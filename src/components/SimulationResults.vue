<script setup lang="ts">
import { resultsStore } from "@/stores/resultsStore";
import { computed } from "vue";
import { type SimulationResult } from "@/utils/gachaUtils";

const useResults = resultsStore();

const simulationResult = computed<SimulationResult | null>(
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
  <PSpace v-if="hasSimulationResult" vertical long align="center">
    <PText subtitle>模拟结果</PText>
    <PSpace size="small">
      <PText bold>平均抽取次数：</PText>
      <PText>{{ simulationResult?.averagePulls }}</PText>
    </PSpace>
    <PSpace size="small">
      <PText bold>标准差：</PText>
      <PText>{{ simulationResult?.stdDev }}</PText>
    </PSpace>
    <PSpace size="small">
      <PText bold>成功率：</PText>
      <PText>{{ simulationResult?.successRateInCurrent ?? "--" }}</PText>
    </PSpace>
    <PSpace
      v-if="simulationResult && simulationResult.expectedPullsOnFail > 0"
      size="small"
    >
      <PText bold>如果当期卡池未能毕业，后期卡池需投入：</PText>
      <PText>{{ simulationResult.expectedPullsOnFail }} 抽</PText>
    </PSpace>
  </PSpace>
</template>

<style scoped lang="scss"></style>
