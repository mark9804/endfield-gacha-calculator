<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    suffix?: string;
  }>(),
  {
    value: 0,
    min: 0,
    max: 1000000,
    step: 1,
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: "update:value", value: number): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:value", Number(target.value));
};

function handleDecrement() {
  emit("update:value", Math.max(props.value - props.step, props.min));
}

function handleIncrement() {
  emit("update:value", Math.min(props.value + props.step, props.max));
}
</script>

<template>
  <div
    class="perlica-ui-number-input perlica-ui-number-input__wrapper relative flex flex-nowrap items-stretch justify-center gap-1"
  >
    <PText oneline><slot /></PText>
    <div
      class="perlica-ui-number-input__wrapper__inner relative flex items-stretch justify-center"
    >
      <span
        class="perlica-ui-number-input__decrement"
        @click="handleDecrement"
      />
      <input
        type="number"
        :value="value"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        @input="handleChange"
      />
      <span
        class="perlica-ui-number-input__increment"
        @click="handleIncrement"
      />
    </div>
    <PText v-if="suffix" oneline>{{ suffix }}</PText>
  </div>
</template>

<style scoped lang="scss">
.perlica-ui-number-input {
  input {
    appearance: none;
    min-width: 2.5rem;
    width: 5rem;
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    text-align: center;
    font-family: "Novecento Wide DemiBold", $font-family;
    font-size: 1.25rem;
    background-color: transparent;
    color: $text-primary;
    // background-color: $bg-fill;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  }

  &__decrement,
  &__increment {
    @apply cursor-pointer user-select-none w-3 border-t-4 border-b-4 border-solid;
    height: fill-available;
    display: flex;
    border-color: $text-tertiary;
  }

  &__decrement {
    @apply border-l-4 border-r-0;
  }

  &__increment {
    @apply border-l-0 border-r-4;
  }
}
</style>
