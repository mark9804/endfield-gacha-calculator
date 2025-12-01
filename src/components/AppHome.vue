<script setup lang="ts">
import { ref } from "vue";

const showDebug = ref(false);

function handleToggleDebug() {
  showDebug.value = !showDebug.value;
}
</script>

<template>
  <div class="flex flex-col gap-5 items-center justify-center">
    <div class="flex flex-col gap-2 items-center justify-center">
      <PText title>终末地卡池计算工具</PText>
      <PText subtitle>Endfield Gacha Calculator</PText>
    </div>
    <!-- <UITester /> -->
    <UserInputForm :show-debug="showDebug" @toggle-debug="handleToggleDebug" />
  </div>
  <DebugPanel v-if="showDebug" />
</template>

<style scoped lang="scss"></style>
