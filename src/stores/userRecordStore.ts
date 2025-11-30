import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { AlgorithmType, type SimulationConfig } from "@/utils/gachaUtils";
import { type UserRecord } from "@/types/UserRecord";
import type { PaymentRank } from "@/utils/investUtils";

export const userRecordStore = defineStore(
  "userRecord",
  () => {
    const userRecord = ref<UserRecord>({
      algorithm: AlgorithmType.DP,
      targetCopies: 1,
      currentPity: 0,
      currentBannerPulls: 0,
      is120SparkUsed: false,
      maxInvestCurrentBanner: 1000,
      standardPoolSize: 6,
      extraPoolSize: 2,
      iterations: 100000,
      firstBuyItems: [648, 328, 198, 98, 30, 6],
      purchases: [],
    });

    function updateUserRecord(config: Partial<SimulationConfig>) {
      userRecord.value = { ...userRecord.value, ...config };
    }

    function updateFirstBuyItems(items: number[]) {
      userRecord.value.firstBuyItems = items;
    }

    function addFirstBuyItem(item: number) {
      userRecord.value.firstBuyItems.push(item);
    }

    function removeFirstBuyItem(item: number) {
      userRecord.value.firstBuyItems = userRecord.value.firstBuyItems.filter(
        (i) => i !== item
      );
    }

    const queryFirstBuyStatus = computed(() => (item: number) => {
      return userRecord.value.firstBuyItems.includes(item);
    });

    const queryItemPurchaseCount = computed(() => (item: number) => {
      return (
        userRecord.value.purchases.find((p) => p.price === item)?.count || 0
      );
    });

    function updatePurchaseCount(price: PaymentRank, count: number) {
      const purchases = userRecord.value.purchases;
      if (purchases) {
        const index = purchases.findIndex((p) => p.price === price);
        if (index >= 0) {
          if (purchases[index]) {
            if (count > 0) {
              purchases[index]!.count = count;
            } else {
              purchases.splice(index, 1);
            }
          }
        } else {
          purchases.push({ price, count });
        }
      }
      userRecord.value.purchases = purchases;
    }

    function resetPurchaseCount() {
      userRecord.value.purchases = [];
    }

    watch(
      () => userRecord.value.currentBannerPulls,
      (newVal) => {
        if (newVal && newVal >= 120) {
          userRecord.value.is120SparkUsed = true;
        }
      }
    );

    const getUserRecord = computed(() => userRecord.value);

    function resetUserRecord() {
      userRecord.value = {
        algorithm: AlgorithmType.DP,
        targetCopies: 1,
        currentPity: 0,
        currentBannerPulls: 0,
        is120SparkUsed: false,
        maxInvestCurrentBanner: 0,
        standardPoolSize: 6,
        extraPoolSize: 2,
        iterations: 100000,
        firstBuyItems: [648, 328, 198, 98, 30, 6],
        purchases: [],
      };
    }

    return {
      userRecord,
      getUserRecord,
      updateUserRecord,
      updateFirstBuyItems,
      addFirstBuyItem,
      removeFirstBuyItem,
      queryFirstBuyStatus,
      queryItemPurchaseCount,
      updatePurchaseCount,
      resetPurchaseCount,
      resetUserRecord,
    };
  },
  {
    persist: {
      pick: [
        "userRecord.algorithm",
        "userRecord.firstBuyItems",
        "userRecord.standardPoolSize",
        "userRecord.iterations",
      ],
    },
  }
);
