import type { PropType, VNodeChild } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "DataTableRender",
  props: {
    content: {
      type: null as unknown as PropType<VNodeChild>,
      default: undefined,
    },
    render: {
      type: Function as PropType<() => VNodeChild>,
      default: undefined,
    },
  },
  setup(props) {
    return () => props.render?.() ?? props.content;
  },
});
