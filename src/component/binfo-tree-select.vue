<template>
    <div class="binfo-tree-select">
        <div :value="keyword" tabindex="0" class="value-div" :class="{'empty':!value||(showOptions&&filterable)}" @click="toggleShowOptions"
             @blur="valueDivBlur">
            <input v-if="filterable" v-model="keyword" :readonly="!showOptions" class="value-input" :style="{cursor:showOptions?'':'pointer'}"
                   @blur="valueDivBlur" @input="valueInput"/>
            {{ computeValue }}
            <div v-show="!showClear" class="arrow-div" :class="{'arrow-up':showOptions}"></div>
            <div v-show="showClear" class="clear-div" @click="clearValue($event)"></div>
        </div>
        <div class="options-div" :style="computeOptionsDiv">
            <div class="no-data-div" v-if="optionsForUse.length==0">暂无数据</div>
            <binfo-tree-node @expand-node="childrenExpandNode" @node-click="nodeClick"
                             :ref="'optionItem'+optionIndex" :data="optionItem"
                             v-for="(optionItem,optionIndex) in optionsForUse"
                             :key="'optionItem'+optionIndex" :labelForUse="labelForUse">

            </binfo-tree-node>
        </div>
    </div>
</template>

<script>

export default {
    name: "binfo-tree-select",
    props: {
        value: {
            type: String
        },
        options: {
            type: Array
        },
        filterable: {
            type: Boolean
        },
        labelField: {
            type: String
        },
        valueField: {
            type: String
        }
    },
    data() {
        return {
            showOptions: false,
            timeOutId: "",
            expandClickFlag: false,
            keyword: "",
            optionsForUse: [],
            filterFlag: false,
            showClear: false,
            curNode: {},
            labelForUse: "label",
            valueForUse: "id"
        }
    },
    methods: {
        toggleShowOptions() {
            this.showOptions = !this.showOptions;
            this.$nextTick(() => {
                this.expandClickFlag = !this.expandClickFlag;
            });
        },
        valueDivBlur() {
            this.timeOutId = setTimeout(() => {
                this.showOptions = false
            }, 125);
        },
        nodeClick(node) {
            this.$emit('node-click', node);
            this.$emit('input', node[this.labelForUse]);
        },
        childrenExpandNode() {
            clearTimeout(this.timeOutId);
            document.getElementsByClassName("value-div")[0].focus();
            this.$nextTick(() => {
                this.expandClickFlag = !this.expandClickFlag;
            });
        },
        valueInput() {
            this.optionsForUse = this.filterMethod(JSON.parse(JSON.stringify(this.options)));
            this.$nextTick(() => {
                this.filterFlag = !this.filterFlag;
            });
        },
        filterMethod(optionsArray) {
            let arr = [];
            for (let i = 0; i < optionsArray.length; i++) {
                if (optionsArray[i][this.labelForUse].indexOf(this.keyword) > -1) {
                    arr.push(optionsArray[i]);
                    continue;
                }
                if (optionsArray[i].children) {
                    let temp = this.filterMethod(optionsArray[i].children);
                    if (temp.length > 0) {
                        optionsArray[i].children = temp;
                        arr.push(optionsArray[i]);
                    }
                }
            }
            return arr;
        },
        clearValue(e) {
            let event = e || window.event;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            this.$emit('input', '');
            this.$emit('node-click', null);
            this.showClear = false;
            document.getElementsByClassName("value-div")[0].blur();
        },
        findNode(val, array, parentNode) {
            for (let i = 0; i < array.length; i++) {
                if (parentNode) {
                    array[i].parentNode = parentNode;
                }
                if (array[i][this.labelForUse] == val) {
                    // this.autoExpand(array[i]);
                    return array[i];
                }
                if (array[i].children) {
                    let node = this.findNode(val, array[i].children, array[i]);
                    if (node) {
                        return node;
                    }
                }
            }
            return null;
        },
        autoExpand(node) {
            if (node.parentNode) {
                this.$set(node.parentNode, 'expandFlag', true);
                this.autoExpand(node.parentNode);
            }
        },
        initData() {
            this.optionsForUse = JSON.parse(JSON.stringify(this.options));
            if (this.labelField) {
                this.labelForUse = this.labelField;
            }
            if (this.valueField) {
                this.valueForUse = this.valueField;
            }
        }
    },
    mounted() {
        this.initData();
        let dom = document.getElementsByClassName("value-div")[0];
        dom.addEventListener('mouseover', () => {
            this.showClear = !!this.value;
        });
        dom.addEventListener('mouseleave', () => {
            this.showClear = false;
        });
    },
    computed: {
        computeOptionsDiv() {
            this.expandClickFlag;
            this.filterFlag;
            let height = 0;
            let border;
            let padding = '0';
            if (this.showOptions) {
                try {
                    for (let i = 0; i < this.optionsForUse.length; i++) {
                        height += parseInt(this.$refs['optionItem' + i][0].$el.clientHeight);
                    }
                } catch (e) {
                    e;
                    height = 0;
                }
                height += 12;
                border = '1px solid #e5e5e5';
                padding = '5px 0';
            } else {
                border = 'none';
            }
            if (height > 350) {
                height = 350;
            }
            if (height > 0 && height <= 120) {
                height = 120;
            }
            return {
                height: height + 'px',
                border, padding
            };
        },
        computeValue() {
            if (this.filterable && this.showOptions && this.keyword) {
                return '';
            }
            return this.value ? this.value : "请选择";
        }
    },
    watch: {
        showOptions: {
            handler(newVal) {
                if (!newVal) {
                    this.keyword = '';
                    this.valueInput();
                }
                if (newVal) {
                    this.$set(this.curNode, 'checked', false);
                    if (this.value) {
                        let node = this.findNode(this.value, this.optionsForUse);
                        if (node) {
                            this.$set(this, 'curNode', node);
                            this.$set(node, 'checked', true);
                        }
                    }
                }
            },
            deep: true,
            immediate: true
        },
        options: {
            handler() {
                this.initData();
            },
            deep: true,
            immediate: true
        }
    }
}
</script>

<style scoped lang="scss">
.binfo-tree-select {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 5px 0;
    box-sizing: border-box;

    .value-div {
        width: 100%;
        height: 100%;
        border: 1px solid #e5e5e5;
        box-sizing: border-box;
        border-radius: 5px;
        padding: 0 30px 0 15px;
        display: flex;
        align-items: center;
        cursor: pointer;
        outline: none;
        transition: all .3s ease;
        position: relative;

        &:hover {
            border: 1px solid #C0C4CC;
        }

        &:focus {
            border: 1px solid #25AEA9;

            .arrow-div {
                background: url(../common/img/binfo-tree-select/arrow-down-green.png) 50% 50% / 14px 14px no-repeat;
            }
        }

        .value-input {
            position: absolute;
            width: calc(100% + 2px);
            height: calc(100% + 2px);
            outline: none;
            border: none;
            background: transparent;
            left: -1px;
            top: -1px;
            border-radius: 5px;
            padding: 0 30px 0 15px;
            box-sizing: border-box;
            z-index: 1;

            &:focus {
                border: 1px solid #25AEA9;
            }
        }

        .arrow-div {
            width: 30px;
            height: 100%;
            background: url(../common/img/binfo-tree-select/arrow-down.png) 50% 50% / 14px 14px no-repeat;
            position: absolute;
            right: 0;
            transition: all .3s ease;
        }

        .clear-div {
            width: 30px;
            height: 100%;
            background: url(../common/img/binfo-tree-select/clear.png) 50% 50% / 14px 14px no-repeat;
            position: absolute;
            right: 0;
            transition: all .3s ease;
            z-index: 2;
        }

        .arrow-up {
            transform: rotate(-180deg);
        }
    }

    .empty {
        color: #c0c4cc;
    }

    .options-div {
        width: 100%;
        max-height: 350px;
        box-sizing: border-box;
        position: absolute;
        z-index: 999;
        overflow: hidden;
        background: #fff;
        margin-top: 5px;
        border-radius: 5px;

        &:hover {
            overflow: auto;
        }

        .no-data-div {
            width: 100%;
            height: 50px;
            line-height: 50px;
            text-align: center;
            color: #c0c4cc;
            font-weight: 600;
            font-size: 14px;
        }
    }

    ::-webkit-scrollbar {
        width: 7px;
    }

    ::-webkit-scrollbar-thumb {
        width: 7px;
    }
}
</style>
