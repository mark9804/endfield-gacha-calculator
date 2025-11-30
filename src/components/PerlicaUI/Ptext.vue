<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title?: boolean;
    subtitle?: boolean;
    subsubtitle?: boolean;
    subsubsubtitle?: boolean;
    bold?: boolean;
    secondary?: boolean;
    note?: boolean;
    nofill?: boolean;
    nounderline?: boolean;
    oneline?: boolean;
  }>(),
  {
    title: false,
    subtitle: false,
    subsubtitle: false,
    subsubsubtitle: false,
    bold: false,
    secondary: false,
    nofill: false,
    nounderline: false,
    note: false,
    oneline: false,
  }
);

const additionalClasses = computed(() => [
  props.title && "perlica-ui-text--title",
  props.subtitle && "perlica-ui-text--subtitle",
  props.subsubtitle && "perlica-ui-text--subsubtitle",
  props.subsubsubtitle && "perlica-ui-text--subsubsubtitle",
  props.bold && "perlica-ui-text--bold",
  props.secondary && "perlica-ui-text--secondary",
  props.note && "perlica-ui-text--note",
  props.nofill && "perlica-ui-text--nofill",
  props.nounderline && "perlica-ui-text--nounderline",
  props.oneline && "perlica-ui-text--oneline",
]);
</script>

<template>
  <span class="perlica-ui-text" :class="additionalClasses">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.perlica-ui-text {
  font-size: 1rem;
  position: relative;
  z-index: 1;
  color: $text-primary;
  width: fit-content;
  line-height: 1.5;

  // FIXME: multi-line text not supported
  &--title,
  &--subtitle,
  &--subsubtitle {
    &:not(.perlica-ui-text--nofill) {
      background-color: $bg-fill;
    }

    // text-shadow: 2px 2px 0px $text-tertiary;

    &:not(.perlica-ui-text--nounderline) {
      &::before {
        content: "";
        display: block;
        width: 102%;
        height: 35%;
        background-color: $bg-primary;
        position: absolute;
        bottom: 0rem;
        left: -1%;
        z-index: -1;
      }
    }
  }

  &--title {
    @apply font-bold;
    font-size: 3.875rem;
    font-family: "Novecento Wide DemiBold", $font-family;
    letter-spacing: -0.05em;
    line-height: 1;
  }

  &--subtitle {
    @apply font-bold;
    font-size: 2rem;
    font-family: "Novecento Wide DemiBold", $font-family;
    line-height: 1.2;
  }

  &--subsubtitle {
    font-size: 1.25rem;
    font-family: "Novecento Wide DemiBold", $font-family;
  }

  &--subsubsubtitle {
    @apply font-bold;
    font-size: 1rem;
    font-family: "Novecento Wide DemiBold", $font-family;
  }

  &--bold {
    @apply font-bold;
    font-family: "Gilroy Bold", $font-family;
  }

  &--secondary {
    color: $text-secondary;
  }

  &--note {
    color: $text-tertiary;
    font-size: 0.875rem;
    line-height: 1.2;
  }

  &--oneline {
    @apply whitespace-nowrap;
  }
}
</style>
