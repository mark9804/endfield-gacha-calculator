/**
 * 抽卡计算器工具类
 *
 * 基于《明日方舟：终末地》技术测试（三测）的数据，本计算器采用以下数学模型。请注意，正式上线时数值可能会有所调整。
 * 逻辑由 Gemini 3 Pro (11/30/2025) 生成，计算逻辑经过人类检查与修正。
 */

/**
 * 算法类型枚举
 */
export enum AlgorithmType {
  MCMC = "MCMC",
  DP = "DP",
}

// 输入参数接口
export interface SimulationConfig {
  algorithm: AlgorithmType;
  targetCopies: number;

  currentPity: number;
  currentBannerPulls: number;
  is120SparkUsed: boolean;

  maxInvestCurrentBanner: number;
  standardPoolSize: number;
  extraPoolSize: number;

  iterations?: number;
}

// 结果输出接口
export interface SimulationResult {
  averagePulls: number; // 总期望抽数
  stdDev: number; // 标准差
  successRateInCurrent: number; // 当期毕业率 (0~1)

  /**
   * 条件期望：如果当期没毕业，预计还需要多少抽才能歪满？
   * E[FuturePulls | CurrentFail]
   */
  expectedPullsOnFail: number;

  distribution?: number[];
  note?: string;
}

export class EndfieldCalculator {
  private readonly SOFT_START = 66;
  private readonly HARD_PITY = 80;
  private readonly SPARK_AT = 120;
  private readonly MILESTONE_STEP = 240;

  private getRate(n: number): number {
    if (n < this.SOFT_START) return 0.008;
    if (n >= this.HARD_PITY) return 1.0;
    return 0.008 + (n - this.SOFT_START + 1) * 0.05;
  }

  /**
   * 同步计算入口
   * 注意：Worker 内部也会调用此方法来执行实际的 MCMC 运算
   */
  public calculate(config: SimulationConfig): SimulationResult {
    // 歪中目标的单次成本期望
    // 概率 = 0.5(歪) * (1 / (常驻池大小 + 2个陪跑))
    const probHitFuture = 0.5 * (1 / (config.standardPoolSize + 2));
    const avgPullPer6Star = 62.3; // 综合期望约为 62.3 抽一个六星
    const futureUnitCost = avgPullPer6Star / probHitFuture;

    if (config.algorithm === AlgorithmType.DP) {
      return this.runDP(config, futureUnitCost);
    } else {
      return this.runMCMC(config, futureUnitCost);
    }
  }

  /**
   * 异步计算入口
   * DP 走主线程，MCMC 走 Web Worker
   */
  public async calculateAsync(
    config: SimulationConfig
  ): Promise<SimulationResult> {
    // 1. 如果是 DP，计算极快，直接在主线程同步执行，避免 Worker 通信开销
    if (config.algorithm === AlgorithmType.DP) {
      return this.calculate(config);
    }

    // 2. 如果是 MCMC，计算量大，放入 Worker 执行以防阻塞 UI
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("../workers/mcmc.worker.ts", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (e) => {
        const { status, result, error } = e.data;
        if (status === "success") {
          resolve(result);
        } else {
          reject(error);
        }
        worker.terminate(); // 计算完成，销毁 worker
      };

      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };

      // 发送配置给 Worker
      // 使用 JSON.parse(JSON.stringify()) 确保对象纯净，虽然 SimulationConfig 已经是纯数据接口
      worker.postMessage(JSON.parse(JSON.stringify(config)));
    });
  }

  // ==========================================
  // 算法 1: 动态规划 (DP)
  // ==========================================
  private runDP(
    config: SimulationConfig,
    futureUnitCost: number
  ): SimulationResult {
    const maxAddedPulls =
      config.maxInvestCurrentBanner - config.currentBannerPulls;

    if (maxAddedPulls <= 0) {
      const needed = Math.max(0, config.targetCopies);
      return {
        averagePulls: needed * futureUnitCost,
        stdDev: 0,
        successRateInCurrent: 0,
        expectedPullsOnFail: needed * futureUnitCost,
      };
    }

    let dp = this.createDpState(config.targetCopies);

    // 初始化状态
    const startPity = Math.min(config.currentPity, 79);
    const startSpark = config.is120SparkUsed ? 1 : 0;
    dp[startPity][0][startSpark] = 1.0;

    let expectedPulls = 0;
    let sumSquares = 0;
    let accumulatedSuccessProb = 0;

    for (let t = 1; t <= maxAddedPulls; t++) {
      const currentTotalPulls = config.currentBannerPulls + t;
      const nextDp = this.createDpState(config.targetCopies);

      // 1. 状态转移
      for (let p = 0; p < 80; p++) {
        for (let k = 0; k < config.targetCopies; k++) {
          for (let s = 0; s < 2; s++) {
            const prob = dp[p][k][s];
            if (prob <= 0) continue;

            // 120 Spark
            if (currentTotalPulls === this.SPARK_AT && s === 0) {
              this.transition(nextDp, 0, k + 1, 1, prob, config.targetCopies);
              continue;
            }

            // RNG
            const rate = this.getRate(p + 1);
            // 50% UP
            this.transition(
              nextDp,
              0,
              k + 1,
              1,
              prob * rate * 0.5,
              config.targetCopies
            );
            // 50% Spook
            this.transition(
              nextDp,
              0,
              k,
              s,
              prob * rate * 0.5,
              config.targetCopies
            );
            // No drop
            this.transition(
              nextDp,
              p + 1,
              k,
              s,
              prob * (1 - rate),
              config.targetCopies
            );
          }
        }
      }

      // 2. 240 抽里程碑
      if (
        currentTotalPulls > 0 &&
        currentTotalPulls % this.MILESTONE_STEP === 0
      ) {
        this.applyMilestone(nextDp, config.targetCopies);
      }

      dp = nextDp;

      // 3. 统计本步骤刚刚毕业的概率 (PDF at step t)
      let stepSuccessProb = 0;
      for (let p = 0; p < 80; p++) {
        for (let s = 0; s < 2; s++) {
          // dp[...][target] 存放的是本轮刚刚达成目标的状态
          stepSuccessProb += dp[p][config.targetCopies][s];
        }
      }
      // 4. 累加期望和成功率
      if (stepSuccessProb > 0) {
        expectedPulls += stepSuccessProb * t;
        sumSquares += stepSuccessProb * (t * t);
        accumulatedSuccessProb += stepSuccessProb; // 直接累加 PDF 得到 CDF
      }
    }

    // 5. 计算未来期望 (处理残留的未毕业概率)
    // Residual Probability = 1 - accumulatedSuccessProb
    let totalFutureCostUnconditional = 0;

    for (let p = 0; p < 80; p++) {
      for (let k = 0; k < config.targetCopies; k++) {
        for (let s = 0; s < 2; s++) {
          const prob = dp[p][k][s];
          if (prob > 0) {
            const needed = config.targetCopies - k;
            const futureCost = needed * futureUnitCost;

            totalFutureCostUnconditional += prob * futureCost;
            expectedPulls += prob * (maxAddedPulls + futureCost);
          }
        }
      }
    }

    const variance = sumSquares - expectedPulls * expectedPulls; // 注意：这里只包含当期部分的方差贡献
    // 修正：如果方差计算出现微小负数（浮点误差），归零
    const stdDev = variance > 0 ? Math.sqrt(variance) : 0;

    console.log(
      `[DP Final] Success Rate: ${accumulatedSuccessProb}, Expected: ${expectedPulls}`
    );

    const failRate = 1 - accumulatedSuccessProb;
    const expectedPullsOnFail =
      failRate > 1e-9 ? totalFutureCostUnconditional / failRate : 0;

    return {
      averagePulls: expectedPulls,
      stdDev: stdDev,
      successRateInCurrent: accumulatedSuccessProb,
      expectedPullsOnFail: expectedPullsOnFail,
      note: "DP模式下，标准差仅反映当期卡池内的波动，若进入等歪阶段，实际波动会远大于显示值。",
    };
  }

  private transition(
    dp: number[][][],
    p: number,
    k: number,
    s: number,
    prob: number,
    maxK: number
  ) {
    const actualK = Math.min(k, maxK);
    const actualP = Math.min(p, 79);
    dp[actualP][actualK][s] += prob;
  }

  private createDpState(target: number): number[][][] {
    const arr = new Array(80);
    for (let i = 0; i < 80; i++) {
      arr[i] = new Array(target + 1);
      for (let j = 0; j <= target; j++) {
        arr[i][j] = [0, 0];
      }
    }
    return arr;
  }

  private applyMilestone(dp: number[][][], target: number) {
    for (let p = 0; p < 80; p++) {
      for (let s = 0; s < 2; s++) {
        // 必须倒序遍历 k，防止重复计算 (k=0->1, 然后又处理 k=1->2...)
        for (let k = target - 1; k >= 0; k--) {
          const prob = dp[p][k][s];
          if (prob > 0) {
            dp[p][k][s] = 0; // 移走原状态
            const nextK = Math.min(k + 1, target);
            dp[p][nextK][s] += prob; // 移入新状态
          }
        }
      }
    }
  }

  // ==========================================
  // 算法 2: MCMC
  // ==========================================
  private runMCMC(
    config: SimulationConfig,
    futureUnitCost: number
  ): SimulationResult {
    const iterations = config.iterations || 10000;
    const results: number[] = [];
    let successInCurrentCount = 0;

    // 用于计算条件期望
    let totalFuturePullsSum = 0; // 仅统计失败组的未来抽数
    let failedCount = 0;

    for (let i = 0; i < iterations; i++) {
      let pulls = 0;
      let copies = 0;
      let pity = config.currentPity;
      let bannerPulls = config.currentBannerPulls; // 累计
      let sparkUsed = config.is120SparkUsed;

      while (copies < config.targetCopies) {
        pulls++;
        pity++;

        // 判断当前是否在当期池
        // 注意：bannerPulls 包含历史抽数，所以在判断循环时要 careful
        // 这里 pulls 是增量。 total = currentBannerPulls + pulls
        const currentTotal = config.currentBannerPulls + pulls;
        const isCurrentMode = currentTotal <= config.maxInvestCurrentBanner;

        if (isCurrentMode) {
          bannerPulls++; // 模拟器内部状态增加

          // Milestone
          if (bannerPulls > 0 && bannerPulls % this.MILESTONE_STEP === 0) {
            copies++;
            if (copies >= config.targetCopies) break;
          }

          // Spark
          if (!sparkUsed && bannerPulls === this.SPARK_AT) {
            copies++;
            pity = 0;
            sparkUsed = true;
            continue;
          }

          // RNG
          const rate = this.getRate(pity);
          if (Math.random() < rate) {
            pity = 0;
            if (Math.random() < 0.5) {
              copies++;
              sparkUsed = true;
            }
          }
        } else {
          // Future Mode
          // 直接由期望公式接管，结束模拟
          const needed = config.targetCopies - copies;
          // 注意：这里一旦进入 Future Mode，successInCurrentCount 就不加了
          const futureCost = needed * futureUnitCost;

          pulls += futureCost;

          totalFuturePullsSum += futureCost;
          failedCount++;

          copies = config.targetCopies;
        }
      }

      results.push(pulls);

      // 判定是否在当期毕业
      // pulls 包含了 future cost，如果没进 future mode，pulls 就是当期消耗
      // 简单的判定：如果循环是因为 copies >= target 且 isCurrentMode 为 true 结束的...
      // 或者直接比较：
      if (pulls + config.currentBannerPulls <= config.maxInvestCurrentBanner) {
        successInCurrentCount++;
      }
    }

    const sum = results.reduce((a, b) => a + b, 0);
    const avg = sum / iterations;
    const sqDiff = results.reduce((a, b) => a + Math.pow(b - avg, 2), 0);
    const stdDev = Math.sqrt(sqDiff / iterations);

    const expectedPullsOnFail =
      failedCount > 0 ? totalFuturePullsSum / failedCount : 0;

    return {
      averagePulls: avg,
      stdDev: stdDev,
      successRateInCurrent: successInCurrentCount / iterations,
      expectedPullsOnFail: expectedPullsOnFail,
      distribution: results,
    };
  }
}
