import {
  EndfieldCalculator,
  type SimulationConfig,
  type SimulationResult,
} from "@/utils/gachaUtils";

self.onmessage = (e: MessageEvent<SimulationConfig>) => {
  const config = e.data;
  const calculator = new EndfieldCalculator();

  try {
    const result = calculator.calculate(config);
    self.postMessage({ status: "success", result });
  } catch (error) {
    self.postMessage({ status: "error", error });
  }
};
