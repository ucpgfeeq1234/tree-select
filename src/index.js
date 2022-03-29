import BinfoTreeSelect from './component/binfo-tree-select.vue';
import BinfoTreeNode from './component/binfo-tree-node.vue';

const components = [BinfoTreeSelect, BinfoTreeNode];
const install = Vue => {
    components.forEach(item => {
        Vue.component(item.name, item);
    })
}
export default {
    install
};
