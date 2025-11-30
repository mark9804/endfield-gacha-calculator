<script setup lang="ts">
import { useDark } from "@vueuse/core";

const isDark = useDark();

const props = withDefaults(
  defineProps<{
    checked?: boolean;
    disabled?: boolean;
  }>(),
  {
    checked: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: "update:checked", value: boolean): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:checked", target.checked);
};
</script>

<template>
  <label
    class="perlica-ui-checkbox flex flex-nowrap items-center cursor-pointer !select-none"
    :class="{ 'perlica-ui-checkbox--disabled': disabled }"
  >
    <input
      type="checkbox"
      class="perlica-ui-checkbox__input"
      :checked="checked"
      :disabled="disabled"
      @change="handleChange"
    />
    <div
      class="perlica-ui-checkbox__indicator"
      :class="{ 'perlica-ui-checkbox__indicator--checked': checked }"
    >
      <!-- Tick icon -->
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M75 25L37.5 62.5L25 50"
          :stroke="isDark ? '#fff' : '#191919'"
          stroke-width="10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="perlica-ui-checkbox__label ml-1">
      <PText oneline>
        <slot />
      </PText>
    </div>
  </label>
</template>

<style scoped lang="scss">
.perlica-ui-checkbox {
  width: fit-content;

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__indicator {
    @apply w-4 h-4 rounded-full border-2 border-solid border-text-primary;

    svg {
      opacity: 0;
    }

    &--checked {
      background-color: $bg-primary;

      box-shadow: 2px 2px $bg-primary;

      svg {
        opacity: 1;
      }
    }
  }

  &--disabled {
    opacity: $disabled-opacity;
    cursor: not-allowed;
  }
}
</style>
