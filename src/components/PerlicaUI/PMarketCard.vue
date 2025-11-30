<script setup lang="ts">
import { computed } from "vue";
import { type PaymentPriceItem } from "@/utils/investUtils";
import { userRecordStore } from "@/stores/userRecordStore";

const useUserRecord = userRecordStore();

const props = defineProps<{
  item: PaymentPriceItem;
}>();

const isFirstBuy = computed({
  get: () => useUserRecord.queryFirstBuyStatus(props.item.price),
  set: (value: boolean) => {
    if (value) {
      useUserRecord.addFirstBuyItem(props.item.price);
    } else {
      useUserRecord.removeFirstBuyItem(props.item.price);
    }
  },
});

const purchaseCount = computed({
  get: () => useUserRecord.queryItemPurchaseCount(props.item.price),
  set: (value: number) => {
    useUserRecord.updatePurchaseCount(props.item.price, value);
  },
});
</script>

<template>
  <PSpace vertical align="center" size="large">
    <div
      class="perlica-ui-market-card flex flex-col shadow-lg rounded-sm items-center justify-center p-3 gap-5"
    >
      <OriginiumIcon
        :width="48"
        :height="48"
        fill="var(--text-tertiary)"
        style="filter: drop-shadow(2px 2px 0 var(--text-tertiary))"
      />
      <PSpace vertical align="center" size="none">
        <PText>衍质源石</PText>
        <PText
          >{{ item.amount }} +
          {{
            isFirstBuy ? item.additionalAmountFirstBuy : item.additionalAmount
          }}
          个</PText
        >
        <PText>{{ item.price }}元</PText>
        <PCheckbox v-model:checked="isFirstBuy">首充</PCheckbox>
      </PSpace>
    </div>
    <PInputNumber v-model:value="purchaseCount" />
  </PSpace>
</template>

<style scoped lang="scss">
.perlica-ui-market-card {
  width: 100px;
  background: linear-gradient(to bottom, $bg-primary 0%, $bg-fill 50%);
}
</style>
