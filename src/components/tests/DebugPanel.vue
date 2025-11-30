<script setup lang="ts">
import { userRecordStore } from "@/stores/userRecordStore";
import { type UserRecord } from "@/types/UserRecord";
import { resultsStore } from "@/stores/resultsStore";
import { computed } from "vue";

const useUserRecord = userRecordStore();
const useResults = resultsStore();

const userRecord = computed<UserRecord>(() => useUserRecord.getUserRecord);

const simulationResult = computed<SimulationResult>(
  () => useResults.getSimulationResult
);
</script>

<template>
  <div
    class="debug-panel flex flex-col gap-2 absolute top-1 right-1 p-3 shadow-lg hover:z-9999"
  >
    <div v-for="(value, key) in userRecord" :key="key">
      <PText bold>{{ key }}: </PText>
      <PText>{{ value }}</PText>
    </div>
    <PText>---</PText>
    <div v-for="(value, key) in simulationResult" :key="key">
      <PText bold>{{ key }}: </PText>
      <PText>{{ value }}</PText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.debug-panel {
  background-color: $bg-fill;
  border-right: 3px solid $bg-primary;
}
</style>
