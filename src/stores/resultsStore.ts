import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type SimulationResult } from "@/utils/gachaUtils";

export const resultsStore = defineStore(
  "results",
  () => {
    const simulationResult = ref<SimulationResult | null>(null);

    const getSimulationResult = computed(() => simulationResult.value);

    function setSimulationResult(result: SimulationResult) {
      simulationResult.value = result;
    }

    function resetSimulationResult() {
      simulationResult.value = null;
    }

    return {
      simulationResult,
      getSimulationResult,
      setSimulationResult,
      resetSimulationResult,
    };
  },
  {
    persist: false,
  }
);
