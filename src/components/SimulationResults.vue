<script setup lang="ts">
import { resultsStore } from "@/stores/resultsStore";
import { computed } from "vue";

const useResults = resultsStore();

const simulationResult = computed<SimulationResult>(
  () => useResults.getSimulationResult
);

const hasSimulationResult = computed(() => {
  return (
    simulationResult.value !== null &&
    Object.keys(simulationResult.value).length > 0
  );
});
</script>

<template>
  <PSpace vertical long align="center" v-if="hasSimulationResult">
    <PText subtitle>模拟结果</PText>
    <PSpace>
      <PText bold>平均抽取次数：</PText>
      <PText>{{ simulationResult?.averagePulls }}</PText>
    </PSpace>
    <PSpace>
      <PText bold>标准差：</PText>
      <PText>{{ simulationResult?.stdDev }}</PText>
    </PSpace>
    <PSpace>
      <PText bold>成功率：</PText>
      <PText>{{ simulationResult?.successRateInCurrent }}</PText>
    </PSpace>
  </PSpace>
</template>

<style scoped lang="scss"></style>
