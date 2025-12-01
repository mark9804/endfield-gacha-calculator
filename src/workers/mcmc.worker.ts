import {
  EndfieldCalculator,
  type SimulationConfig,
  type SimulationResult,
} from "@/utils/gachaUtils";

self.onmessage = (e: MessageEvent<SimulationConfig>) => {
  const config = e.data;
  const calculator = new EndfieldCalculator();
  // We force the algorithm to MCMC in the worker, or trust the config
  // But since this IS the MCMC worker, we can assume we want MCMC.
  // However, the calculator.calculate method dispatches based on config.algorithm.
  // So we should ensure config.algorithm is MCMC or call runMCMC directly if exposed.
  // Since runMCMC is private, we'll use the public calculate method.

  try {
    const result = calculator.calculate(config);
    self.postMessage({ status: "success", result });
  } catch (error) {
    self.postMessage({ status: "error", error });
  }
};
