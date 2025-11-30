<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { type UserRecord } from "@/types/UserRecord";
import { userRecordStore } from "@/stores/userRecordStore";
import { resultsStore } from "@/stores/resultsStore";
import { type SimulationConfig, AlgorithmType } from "@/utils/gachaUtils";
import {
  paymentPriceMap,
  calcMaximumCountConversion,
  calcTotalConversionCount,
} from "@/utils/investUtils";
import { EndfieldCalculator } from "@/utils/gachaUtils";
const useUserRecord = userRecordStore();
const useResults = resultsStore();

const userRecord = computed<UserRecord>({
  get: () => useUserRecord.getUserRecord,
  set: (value: Partial<SimulationConfig>) => {
    useUserRecord.updateUserRecord(value);
  },
});

function updateMaxInvest(originite: number, orundum: number, permits: number) {
  const maxOrundum = originite * 75 + orundum + permits * 500; // 全部换算成玉
  userRecord.value.maxInvestCurrentBanner = Math.floor(maxOrundum / 500);
}

const originiteCount = ref(0); // 衍质源石
const orundumCount = ref(0); // 嵌晶玉
const permitsCount = ref(0); // 招募许可

const savings = ref(0); // 人民币

watch([originiteCount, orundumCount, permitsCount], () => {
  updateMaxInvest(originiteCount.value, orundumCount.value, permitsCount.value);
});

const showAdvancedSettings = ref(true);
const showInvestmentSettings = ref(false);

const useDP = computed({
  get: () => userRecord.value.algorithm === AlgorithmType.DP,
  set: (value: boolean) => {
    updateAlgorithm(value ? AlgorithmType.DP : AlgorithmType.MCMC);
  },
});

const useMCMC = computed({
  get: () => userRecord.value.algorithm === AlgorithmType.MCMC,
  set: (value: boolean) => {
    updateAlgorithm(value ? AlgorithmType.MCMC : AlgorithmType.DP);
  },
});

function updateAlgorithm(algorithm: AlgorithmType) {
  userRecord.value.algorithm = algorithm;
}

function calculateOptimalConversion() {
  const purchases = calcMaximumCountConversion(
    savings.value,
    userRecord.value.firstBuyItems
  );
  userRecord.value.purchases = purchases;
  savings.value = purchases.reduce(
    (acc, curr) => acc + curr.price * curr.count,
    0
  );
}

const totalConversionCount = computed(() => {
  return calcTotalConversionCount(
    userRecord.value.purchases,
    userRecord.value.firstBuyItems
  );
});

function updateResourceInfo() {
  originiteCount.value += totalConversionCount.value;
  useUserRecord.resetPurchaseCount();
  savings.value = 0;
}

function handleReset() {
  useUserRecord.resetUserRecord();
  originiteCount.value = 0;
  orundumCount.value = 0;
  permitsCount.value = 0;
  savings.value = 0;
}

const calculating = ref(false);

// test gacha calculator
function handleSimulateGacha() {
  calculating.value = true;
  const calculator = new EndfieldCalculator();
  const result = calculator.calculate(userRecord.value);
  useResults.setSimulationResult(result);

  calculating.value = false;
}

// debugger pane

withDefaults(defineProps<{ showDebug?: boolean }>(), {
  showDebug: false,
});

const emits = defineEmits<{
  (e: "toggle-debug"): void;
}>();

function toggleDebug() {
  emits("toggle-debug");
}
</script>

<template>
  <div
    class="user-input-form flex flex-col gap-5 p-5 border-t-4 border-b-0 border-l-0 border-r-0 border-solid shadow-lg"
  >
    <PSpace vertical long>
      <PText subsubtitle bold>基础信息</PText>
      <PSpace vertical>
        <PSpace wrap>
          <PInputNumber v-model:value="userRecord.targetCopies"
            >目标抽取个数</PInputNumber
          >
          <PInputNumber v-model:value="userRecord.currentPity">
            上个池子已抽
          </PInputNumber>
          <PInputNumber v-model:value="userRecord.currentBannerPulls">
            这个池子已抽
          </PInputNumber>
          <PSpace size="none">
            <PText>120保底：</PText>
            <PCheckbox v-model:checked="userRecord.is120SparkUsed"
              >{{ userRecord.is120SparkUsed ? "已" : "未" }}触发</PCheckbox
            >
          </PSpace>
        </PSpace>
      </PSpace>
    </PSpace>
    <PSpace vertical long>
      <PText subsubtitle bold>资源信息</PText>
      <PSpace>
        <PInputNumber v-model:value="originiteCount" suffix="个">
          衍质源石
        </PInputNumber>
        <PInputNumber v-model:value="orundumCount" suffix="个">
          嵌晶玉
        </PInputNumber>
        <PInputNumber v-model:value="permitsCount" suffix="张">
          招募许可
        </PInputNumber>
        <PSpace size="small">
          <PText>，共 </PText>
          <PText bold>{{ userRecord.maxInvestCurrentBanner }}</PText>
          <PText>抽</PText>
        </PSpace>
      </PSpace>
    </PSpace>
    <PCheckbox v-model:checked="showInvestmentSettings"
      >我要氪金，给我展示氪金选项</PCheckbox
    >
    <PSpace v-if="showInvestmentSettings" vertical long>
      <PText subsubtitle bold>充值信息</PText>
      <PSpace align="center" justify="center">
        <PInputNumber v-model:value="savings" suffix="元"> 预算 </PInputNumber>
        <PText>，共计可获得 </PText>
        <PText bold>{{ totalConversionCount }}</PText>
        <PText>衍质源石</PText>
        <PButton secondary small @click="calculateOptimalConversion"
          >帮我计算最优档位</PButton
        >
        <PButton small @click="updateResourceInfo">更新资源信息</PButton>
      </PSpace>
      <PSpace>
        <PText subsubsubtitle>充值档位</PText>
      </PSpace>
      <PSpace wrap size="auto" :style="{ gap: '20px 0' }" long>
        <PMarketCard
          v-for="item in paymentPriceMap"
          :key="item.item"
          :item="item"
        />
      </PSpace>
    </PSpace>
    <PSpace vertical long>
      <PSpace long justify="end" align="center">
        <PDivider />
        <PCheckbox v-model:checked="showAdvancedSettings"
          >展开高级设置</PCheckbox
        >
      </PSpace>
      <PSpace v-if="showAdvancedSettings" vertical>
        <PText subsubtitle bold>算法设置</PText>
        <PSpace vertical size="small">
          <PSpace>
            <PText>选择算法</PText>
            <PSpace size="small">
              <PCheckbox v-model:checked="useDP">动态规划</PCheckbox>
              <PCheckbox v-model:checked="useMCMC">MCMC</PCheckbox>
              <PSpace v-if="useMCMC" size="small">
                <PText>模拟次数</PText>
                <PInputNumber v-model:value="userRecord.iterations" suffix="次">
                </PInputNumber>
              </PSpace>
            </PSpace>
          </PSpace>
          <PSpace vertical size="none">
            <PText note>
              动态规划：直接计算概率分布，极快，结果精确。MCMC：随机模拟 N
              次，耗时较长，能模拟真实波动。
            </PText>
            <PText note>移动设备推荐使用动态规划。</PText>
          </PSpace>
        </PSpace>
        <PSpace vertical>
          <PText subsubtitle bold>卡池设置</PText>
          <PSpace wrap>
            <PText>常驻六星数量</PText>
            <PInputNumber
              v-model:value="userRecord.standardPoolSize"
              suffix="个"
            >
            </PInputNumber>
            <PText>陪跑六星数量</PText>
            <PInputNumber v-model:value="userRecord.extraPoolSize" suffix="个">
            </PInputNumber>
          </PSpace>
          <PText note>
            常驻六星：常驻池角色 <br />
            陪跑六星：不在常驻池中，最近两个池子的角色。开服首个池子没有陪跑，第二个池子只有一个陪跑，之后稳定为
            2 个陪跑。
          </PText>
        </PSpace>
        <PCheckbox :checked="showDebug" @update:checked="toggleDebug"
          >显示调试信息</PCheckbox
        >
      </PSpace>
    </PSpace>
    <PSpace justify="center" long>
      <PButton secondary @click="handleReset">重置 / Reset</PButton>
      <PButton :loading="calculating" @click="handleSimulateGacha"
        >开始计算 / Start</PButton
      >
    </PSpace>
    <SimulationResults />
  </div>
</template>

<style scoped lang="scss">
.user-input-form {
  border-color: $bg-primary;
  background-color: $bg-fill;
  width: 960px;
  max-width: min(1200px, 90%);
}
</style>
