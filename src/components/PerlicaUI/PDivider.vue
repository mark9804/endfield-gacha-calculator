<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(
  defineProps<{
    vertical?: boolean;
  }>(),
  {
    vertical: false,
  }
);

const additionalClasses = computed(() => [
  props.vertical && "perlica-ui-divider--vertical",
]);
</script>

<template>
  <span class="perlica-ui-divider" :class="additionalClasses"></span>
</template>

<style scoped lang="scss">
.perlica-ui-divider {
  height: 1px;
  width: 100%;
  background-color: $text-tertiary;
  opacity: 0.4;
  &--vertical {
    width: 1px;
    height: 100%;
    background-color: $text-tertiary;
  }
}
</style>
