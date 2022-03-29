<template>
    <div class="binfo-tree-node">
        <div class="node-value" :class="{'checked':data.checked,'disabled':data.disabled}" :style="computeNodeValue" @click="nodeClick(data)">
            <div class="triangle-right-div" @click="expandNode(data,$event)"
                 :class="{'expand':data.expandFlag,'no-children':!data.children||data.children.length==0}"></div>
            {{ data[labelForUse] }}
        </div>
        <template v-if="data.children&&data.expandFlag">
            <binfo-tree-node @expand-node="childrenExpandNode" @node-click="nodeClick" :index="selfIndex+1"
                             :data="optionItem" v-for="(optionItem,optionIndex) in data.children"
                             :key="optionItem[labelForUse]+optionIndex" :labelForUse="labelForUse">

            </binfo-tree-node>
        </template>
    </div>
</template>

<script>

export default {
    name: "binfo-tree-node",
    props: {
        data: {
            type: Object
        },
        index: {
            type: Number
        },
        labelForUse: {
            type: String
        }
    },
    data() {
        return {
            selfIndex: 1
        }
    },
    methods: {
        nodeClick(node) {
            if (node.disabled) {
                this.childrenExpandNode();
                return;
            }
            this.$emit('node-click', node);
        },
        expandNode(node, e) {
            let event = e || window.event;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            if (node.children && node.children.length > 0) {
                node.expandFlag = !node.expandFlag;
                this.childrenExpandNode();
            } else {
                this.nodeClick(node);
            }
        },
        childrenExpandNode() {
            this.$emit('expand-node');
        }
    },
    mounted() {
        if (this.index) {
            this.selfIndex = this.index;
        }
    },
    computed: {
        computeNodeValue() {
            let index;
            if (!this.index) {
                index = 1;
            } else {
                index = this.index;
            }
            let paddingLeft = 15 * (index - 1) + 'px';
            return {
                paddingLeft
            }
        }
    },
    watch: {
        data: {
            handler() {
                if (this.data.expandFlag == undefined) {
                    this.$set(this.data, 'expandFlag', false);
                }
            },
            immediate: true,
            deep: true
        }
    }
}
</script>

<style scoped lang="scss">
.binfo-tree-node {
    width: 100%;
    box-sizing: border-box;

    .node-value {
        width: 100%;
        height: 34px;
        cursor: pointer;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        &:hover {
            background: #F5F7FA;
        }

        .triangle-right-div {
            width: 34px;
            height: 34px;
            background: url(../common/img/binfo-tree-select/triangle-right.png) 50% 50% / 14px 14px no-repeat;
            cursor: pointer;
            transition: all .3s ease;
        }

        .expand {
            transform: rotate(90deg);
        }

        .no-children {
            background: none;
        }
    }

    .checked {
        color: #25AEA9;
        font-weight: 600;
    }

    .disabled {
        color: #aaa;
        cursor: not-allowed;
    }
}
</style>
