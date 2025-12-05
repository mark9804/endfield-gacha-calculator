<script setup lang="ts">
import QrcodeVue from "qrcode.vue";
import { useBrowserLocation } from "@vueuse/core";
import { useDark } from "@vueuse/core";
import { computed } from "vue";

const location = useBrowserLocation();
const href = computed(() => location.value.href);
const isDark = useDark();

const foreground = computed(() => (isDark.value ? "#ffffff" : "#191919"));
</script>

<template>
  <div
    class="flex flex-col items-center justify-center absolute bottom-4 right-4"
  >
    <qrcode-vue
      :value="href"
      level="M"
      render-as="svg"
      background="#ffffff00"
      :foreground="foreground"
    />
  </div>
</template>

<style scoped lang="scss"></style>
