import type { PropType, Slot } from "vue";
import { defineComponent } from "vue";

/** Stable renderer for slots forwarded through a private context. */
export default defineComponent({
  props: {
    render: { type: Function as PropType<Slot>, required: true },
    scope: { type: Object as PropType<Record<string, unknown>>, required: true },
  },
  setup: props => () => props.render(props.scope),
});
