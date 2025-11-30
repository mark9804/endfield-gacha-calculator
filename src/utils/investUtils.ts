import { type PurchaseInfo } from "@/types/UserRecord";

export enum ItemType {
  ORIGINITE = "originite",
  ORUNDUM = "orundum",
}

export type PaymentRank = 648 | 328 | 198 | 98 | 30 | 6;

export type PaymentPriceItem = {
  item: ItemType;
  price: PaymentRank;
  amount: number;
  additionalAmount: number;
  additionalAmountFirstBuy: number;
};

export const paymentPriceMap: PaymentPriceItem[] = [
  {
    item: ItemType.ORIGINITE,
    price: 648 as PaymentRank,
    amount: 280,
    additionalAmount: 70,
    additionalAmountFirstBuy: 280,
  },
  {
    item: ItemType.ORIGINITE,
    price: 328 as PaymentRank,
    amount: 141,
    additionalAmount: 30,
    additionalAmountFirstBuy: 141,
  },
  {
    item: ItemType.ORIGINITE,
    price: 198 as PaymentRank,
    amount: 85,
    additionalAmount: 17,
    additionalAmountFirstBuy: 85,
  },
  {
    item: ItemType.ORIGINITE,
    price: 98 as PaymentRank,
    amount: 42,
    additionalAmount: 8,
    additionalAmountFirstBuy: 42,
  },
  {
    item: ItemType.ORIGINITE,
    price: 30 as PaymentRank,
    amount: 12,
    additionalAmount: 3,
    additionalAmountFirstBuy: 12,
  },
  {
    item: ItemType.ORIGINITE,
    price: 6 as PaymentRank,
    amount: 2,
    additionalAmount: 1,
    additionalAmountFirstBuy: 2,
  },
].sort((a, b) => a.price - b.price);

export const originiteExchangeRate = 75; // 1 衍质源石 = 75 嵌晶玉

/**
 * 动态规划计算最优充值组合 (Final Version)
 * 策略：完全背包(普充)打底 -> 0/1背包(首充)叠加 -> 二维状态记录防止回溯冲突
 */
export function calcMaximumCountConversion(
  savings: number,
  firstBuyItems: number[],
  priceMap = paymentPriceMap
): PurchaseInfo[] {
  if (savings <= 0) return [];

  // 1. 准备数据
  const dp = new Array(savings + 1).fill(0);

  // choiceNormal[j] 记录在预算 j 时，为了达到当前 dp[j]，最后买的【普通商品】的价格
  // 如果为 0，说明这一步没有买普通商品（可能是基础状态）
  const choiceNormal = new Array<number>(savings + 1).fill(0);

  // 2. Phase 1: 完全背包 (普通购买)
  // 先把地基打好，算出“如果只能买普充，各预算下的最大收益”
  console.log("--- Phase 1: Normal Buy ---");
  for (const item of priceMap) {
    const cost = item.price;
    const value = item.amount + item.additionalAmount;

    for (let j = cost; j <= savings; j++) {
      if (dp[j - cost] + value > dp[j]) {
        dp[j] = dp[j - cost] + value;
        choiceNormal[j] = cost; // 记录路径
      }
    }
  }
  // Phase 1 结束时，dp[v] 代表纯普充的最优解

  // 3. Phase 2: 0-1 背包 (首充购买)
  // 在普充的基础上，尝试叠加首充。
  // 关键：我们需要记录“哪个首充被使用了”，而不是覆盖 choiceNormal

  // 筛选出有效的首充列表
  const validFirstBuys = priceMap.filter((p) =>
    firstBuyItems.some((id) => id == p.price)
  );

  // kept[i][j] 表示：在考虑第 i 个首充商品时，预算 j 是否选择了它
  // i 对应 validFirstBuys 的索引
  const kept = Array.from({ length: validFirstBuys.length }, () =>
    new Array<boolean>(savings + 1).fill(false)
  );

  console.log("--- Phase 2: First Buy Overlay ---");
  validFirstBuys.forEach((item, i) => {
    const cost = item.price;
    const value = item.amount + item.additionalAmountFirstBuy;

    // 0-1 背包必须倒序，防止自我叠加
    for (let j = savings; j >= cost; j--) {
      // 比较：不买这个首充(dp[j]) vs 买这个首充(dp[j-cost] + value)
      // 注意：dp[j-cost] 此时包含的是“普充 + 前 i-1 个首充”的最优解
      if (dp[j - cost] + value > dp[j]) {
        dp[j] = dp[j - cost] + value;
        kept[i][j] = true; // 记录：在预算 j 时，我们拿了第 i 个首充
      }
    }
  });

  // 4. 寻找全局最优解
  let maxVal = -1;
  let finalBudget = 0;
  for (let i = 0; i <= savings; i++) {
    if (dp[i] > maxVal) {
      maxVal = dp[i];
      finalBudget = i;
    }
  }

  // 5. 分层回溯
  const resultCountMap = new Map<number, number>();
  let curr = finalBudget;

  console.log(`[Backtrack] MaxVal: ${maxVal}, Budget Used: ${curr}`);

  // 5.1 回溯首充层 (Layer 1..N)
  // 从最后一个首充商品开始倒推
  for (let i = validFirstBuys.length - 1; i >= 0; i--) {
    if (kept[i][curr]) {
      const item = validFirstBuys[i];
      console.log(` > Chose First Buy: ${item.price}`);

      resultCountMap.set(item.price, (resultCountMap.get(item.price) || 0) + 1);
      curr -= item.price;
    }
  }

  // 5.2 回溯普充层 (Layer 0)
  // 剩下的 curr 就是留给普充的预算
  while (curr > 0) {
    const price = choiceNormal[curr];
    if (price === 0) break; // 没钱了或没货了

    console.log(` > Chose Normal Buy: ${price}`);
    resultCountMap.set(price, (resultCountMap.get(price) || 0) + 1);
    curr -= price;
  }

  // 6. 输出结果
  const result: PurchaseInfo[] = [];
  resultCountMap.forEach((count, price) => {
    result.push({
      price: price as PaymentRank,
      count: count,
    });
  });

  return result.sort((a, b) => b.price - a.price);
}

export function calcTotalConversionCount(
  purchases: PurchaseInfo[],
  firstBuyItems: number[]
): number {
  let totalOriginite = 0;

  for (const purchase of purchases) {
    const { price, count } = purchase;
    if (count <= 0) continue;

    const itemConfig = paymentPriceMap.find((p) => p.price === price);
    if (!itemConfig) continue;

    const { amount, additionalAmount, additionalAmountFirstBuy } = itemConfig;

    const hasFirstBuy = firstBuyItems.some((id) => id == price);

    if (hasFirstBuy) {
      totalOriginite += amount + additionalAmountFirstBuy;
      if (count > 1) {
        totalOriginite += (amount + additionalAmount) * (count - 1);
      }
    } else {
      totalOriginite += (amount + additionalAmount) * count;
    }
  }

  return totalOriginite;
}
