<script setup lang="ts">
import { nextTick, provide } from "vue";
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark();
const toggleDark = useToggle(isDark);

const enableTransitions = () =>
  "startViewTransition" in document &&
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

// FIXME: will flicker 1 frame when toggling from light → dark theme
provide("toggle-appearance", async () => {
  if (!enableTransitions()) {
    toggleDark();
    return;
  }

  await document.startViewTransition(async () => {
    toggleDark();
    await nextTick();
  }).ready;

  document.documentElement.animate(
    {
      opacity: isDark.value ? [1, 0] : [0, 1],
    },
    {
      duration: 300,
      easing: "ease-in-out",
      pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
    }
  );
});
</script>

<template>
  <div
    class="app-container flex flex-col items-center justify-center min-h-screen w-full"
  >
    <AppBackground />
    <AppHome />
  </div>
</template>

<style lang="scss">
html.dark {
  color-scheme: dark;
}

::view-transition-old(root),
::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: none;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}
</style>
