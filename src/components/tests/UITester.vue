<script setup lang="ts">
import { ref, inject } from "vue";
import { useDark } from "@vueuse/core";

const isDark = useDark();
const toggleAppearance = inject("toggle-appearance") as () => void;

const checked = ref(false);
const value = ref(0);
</script>

<template>
  <div class="flex flex-col gap-2 items-center justify-center">
    <PButton small>开始模拟 / Start Simulation</PButton>
    <PButton secondary>开始模拟 / Start Simulation</PButton>
    <PButton tertiary large>开始模拟 / Start Simulation</PButton>
    <PButton disabled secondary>开始模拟 / Start Simulation</PButton>
    <PButton loading>开始模拟 / Start Simulation</PButton>
    <PCheckbox v-model:checked="checked">开始模拟 / Start Simulation</PCheckbox>
    <PCheckbox v-model:checked="checked" disabled
      >开始模拟 / Start Simulation</PCheckbox
    >
    <PInputNumber v-model:value="value" />
    <PText>{{ value }}</PText>
    <PText v-if="isDark">Dark Mode</PText>
    <PText v-else>Light Mode</PText>
    <PButton @click="toggleAppearance">Toggle Dark Mode</PButton>
  </div>
</template>

<style lang="scss" scoped></style>
