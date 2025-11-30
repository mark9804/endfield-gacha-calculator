<script setup lang="ts">
import { computed } from "vue";
import { useDark } from "@vueuse/core";

const isDark = useDark();
const props = withDefaults(
  defineProps<{
    primary?: boolean;
    secondary?: boolean;
    tertiary?: boolean;
    disabled?: boolean;
    loading?: boolean;
    small?: boolean;
    medium?: boolean;
    large?: boolean;
  }>(),
  {
    primary: true,
    medium: true,
  }
);

const additionalClasses = computed(() => [
  props.secondary && "perlica-ui-button--secondary",
  props.tertiary && "perlica-ui-button--tertiary",
  !(props.secondary || props.tertiary) && "perlica-ui-button--primary",
  props.disabled && "perlica-ui-button--disabled",
  props.loading && "perlica-ui-button--loading",
  props.small && "perlica-ui-button--small",
  !(props.small || props.large) && "perlica-ui-button--medium",
  props.large && "perlica-ui-button--large",
]);

const emits = defineEmits<{
  (e: "click"): void;
}>();

const handleClick = () => {
  if (props.disabled || props.loading) return;
  emits("click");
};
</script>

<template>
  <button
    class="perlica-ui-button"
    :class="additionalClasses"
    @click="handleClick"
  >
    <div class="perlica-ui-button__content__wrapper">
      <PText v-if="!loading" secondary subsubsubtitle oneline>
        <slot />
      </PText>
      <PText v-else secondary subsubsubtitle oneline>Loading...</PText>
    </div>
    <ContourBackground
      :width="600"
      :height="200"
      style="opacity: 0.2"
      :color="isDark ? '#fff' : '#191919'"
    />
  </button>
</template>

<style scoped lang="scss">
.perlica-ui-button {
  @apply cursor-pointer rounded-full relative shadow-md overflow-hidden p-[2px] flex items-stretch justify-stretch;
  appearance: none;
  outline: none;
  border: none;
  transition: filter 0.125s ease-in-out;

  &:hover {
    filter: brightness(0.95);
  }

  &__content__wrapper {
    @apply rounded-full flex items-center justify-center border-2 border-solid;
    border-color: $text-secondary;
  }

  &--primary {
    background-color: $bg-primary;
  }

  &--secondary,
  &--tertiary {
    background-color: $bg-fill-2;
  }

  &--disabled,
  &--loading {
    cursor: not-allowed;
  }

  &--disabled {
    opacity: $disabled-opacity;
  }

  &--small {
    .perlica-ui-button__content__wrapper {
      min-width: 64px;
      padding: 2px 12px;
    }
  }

  &--medium {
    .perlica-ui-button__content__wrapper {
      min-width: 92px;
      padding: 5px 14px;
    }
  }

  &--large {
    .perlica-ui-button__content__wrapper {
      min-width: 128px;
      padding: 7px 18px;
    }
  }

  &--loading {
    .perlica-ui-button__content__wrapper {
      animation: pulse 1s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

html.dark {
  .perlica-ui-button {
    &:hover {
      filter: brightness(1.05);
    }
  }
}
</style>
