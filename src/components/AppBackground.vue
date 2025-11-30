<script setup lang="ts">
import { useDark, useWindowSize } from "@vueuse/core";
import { computed } from "vue";

const isDark = useDark();
const { width: windowWidth, height: windowHeight } = useWindowSize();

const useBackgroundOrientation = computed(() => {
  return windowWidth.value > windowHeight.value ? "landscape" : "portrait";
});

const lineColor = computed(() => (isDark.value ? "#fff" : "#191919"));
</script>

<template>
  <div
    class="app-background fixed inset-0 overflow-hidden -z-1 pointer-events-none"
  >
    <ContourBackground
      :orientation="useBackgroundOrientation"
      :width="windowWidth"
      :height="windowHeight"
      :color="lineColor"
      style="opacity: 0.1"
    />
  </div>
</template>

<style scoped lang="scss">
.app-background {
  background-color: $bg-fill-2;
}
</style>
