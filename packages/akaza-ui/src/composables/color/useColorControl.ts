import type { InjectionKey, Ref } from "vue";
import type { AkazaChangeEventDetails } from "../../types";
import type { ColorControlProps } from "./types";
import type { UseColorReturn } from "./useColor";
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  useId,
} from "vue";
import { fieldContextKey } from "../../components/field/context";
import { createChangeDetails } from "../../utils/changeEvent";
import { useFieldControl } from "../../utils/useFieldControl";
import { useFormReset } from "../../utils/useFormReset";
import { useColor } from "./useColor";
import "./color.css";

export const colorContextKey: InjectionKey<UseColorReturn> = Symbol("akaza-color");
interface ColorEmit {
  (event: "value-change", value: string, details: AkazaChangeEventDetails): void;
  (event: "value-commit", value: string, details: AkazaChangeEventDetails): void;
}

/** Field/native form wiring shared by color controls; the public composable stays DOM-free. */
export function useColorControl(
  model: Ref<string>,
  props: { [K in keyof ColorControlProps]?: ColorControlProps[K] | undefined },
  emit: ColorEmit,
  input: Ref<HTMLInputElement | null>,
  focus: () => void,
  draftInvalid: Ref<boolean> = ref(false),
) {
  const parent = inject(colorContextKey, null);
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};
  const ownsValue = ["modelValue", "model-value"].some(key =>
    Object.prototype.hasOwnProperty.call(vnodeProps, key),
  );
  const inherited = parent && !ownsValue ? parent : null;
  const color =
    inherited ??
    useColor(model, {
      format: () => props.format ?? "hex",
      onChange: (value, details) => emit("value-change", value, details),
      onCommit: (value, details) => emit("value-commit", value, details),
    });
  const field = inject(fieldContextKey, null);
  const autoId = useId();
  const id = computed(() => props.id ?? field?.inputId.value ?? `akaza-color-${autoId}`);
  const name = computed(() => props.name ?? field?.name.value);
  const disabled = computed(() => props.disabled || field?.disabled.value || false);
  const required = computed(() => props.required || field?.required.value || false);
  const initial = color.value.value;
  const focused = ref(false);
  const touched = ref(false);
  const resetVersion = ref(0);
  let revealed = false;
  const bridge = useFieldControl(field);
  const invalid = computed(
    () => props.invalid || field?.invalid.value || bridge.nativeInvalid.value || false,
  );
  bridge.registerControl({
    dirty: computed(() => color.value.value !== initial),
    touched,
    focused,
    filled: computed(() => !color.isEmpty.value),
  });
  function sync() {
    input.value?.setCustomValidity(
      draftInvalid.value || !color.isValid.value ? "Enter a valid color." : "",
    );
    bridge.syncValidity(input.value, revealed);
  }
  function onInvalid(event: Event) {
    event.preventDefault();
    revealed = true;
    sync();
    focus();
  }
  function onBlur(event: FocusEvent) {
    if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) return;
    focused.value = false;
    touched.value = true;
    revealed = true;
    sync();
  }
  function change(value: string, reason: string, event?: Event) {
    if (blocked()) return false;
    if (inherited) {
      const details = createChangeDetails(reason, event);
      emit("value-change", value, details.details);
      if (details.canceled()) return false;
    }
    const accepted = color.setValue(value, reason, event);
    revealed = true;
    nextTick(sync);
    return accepted;
  }
  function blocked() {
    return disabled.value || props.readOnly || input.value?.matches(":disabled") || false;
  }
  function changed() {
    revealed = true;
    nextTick(sync);
  }
  useFormReset(
    () => input.value,
    () => {
      if (!inherited) color.reset();
      focused.value = false;
      touched.value = false;
      revealed = false;
      draftInvalid.value = false;
      resetVersion.value++;
      nextTick(sync);
    },
  );
  onMounted(sync);
  onUpdated(sync);
  return {
    color,
    inherited: Boolean(inherited),
    field,
    id,
    name,
    disabled,
    required,
    invalid,
    blocked,
    change,
    changed,
    sync,
    onInvalid,
    onBlur,
    resetVersion,
    describedBy: computed(() => props.ariaDescribedby ?? field?.describedBy.value),
    labelledBy: computed(() => props.ariaLabelledby ?? field?.labelledBy.value),
    onFocus: () => {
      focused.value = true;
    },
    attrs: computed(() => ({
      "data-akaza-disabled": disabled.value || undefined,
      "data-akaza-readonly": props.readOnly || undefined,
      "data-akaza-invalid": invalid.value || undefined,
      "data-akaza-focused": focused.value || undefined,
      "data-akaza-touched": touched.value || undefined,
      "data-akaza-dirty": color.value.value !== initial || undefined,
      "data-akaza-filled": !color.isEmpty.value || undefined,
      "data-akaza-out-of-gamut": color.isOutOfGamut.value || undefined,
    })),
  };
}
