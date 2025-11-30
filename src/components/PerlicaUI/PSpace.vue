<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: "none" | "small" | "medium" | "large" | "auto";
    vertical?: boolean;
    align?: "start" | "center" | "end";
    justify?: "start" | "center" | "end";
    long?: boolean;
    wrap?: boolean;
    autoDirection?: boolean;
  }>(),
  {
    size: "medium",
    align: "start",
    justify: "start",
    wrap: false,
    autoDirection: false,
  }
);

const additionalClasses = computed(() => [
  props.size && `perlica-ui-space--${props.size}`,
  props.vertical && "perlica-ui-space--vertical",
  props.align && `perlica-ui-space--align-${props.align}`,
  props.justify && `perlica-ui-space--justify-${props.justify}`,
  props.wrap && "flex-wrap",
  props.long && "perlica-ui-space--long",
  props.autoDirection && "perlica-ui-space--auto-direction",
]);
</script>

<template>
  <div class="perlica-ui-space flex" :class="additionalClasses">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.perlica-ui-space {
  &--none {
    gap: 0 !important;
  }

  &--small {
    @apply gap-2;
  }

  &--medium {
    @apply gap-4;
  }

  &--large {
    @apply gap-6;
  }

  &--auto {
    justify-content: space-between !important;
  }

  &--vertical {
    @apply flex-col;
  }

  &--align-start {
    @apply items-start;
  }

  &--align-center {
    @apply items-center;
  }
  &--align-end {
    @apply items-end;
  }

  &--justify-start {
    @apply justify-start;
  }

  &--justify-center {
    @apply justify-center;
  }

  &--justify-end {
    @apply justify-end;
  }

  &--long {
    @apply w-full;
  }
}
</style>
