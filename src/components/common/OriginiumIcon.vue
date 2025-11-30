<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
    fill?: string;
  }>(),
  {
    width: 64,
    height: 64,
    fill: "var(--bg-fill-3)",
  }
);
</script>

<template>
  <svg :width="width" :height="height" viewBox="0 0 604 604" fill="none">
    <path
      d="M515.546 88.4541L604 302L515.546 515.546L302 604L88.4541 515.546L0 302L88.4541 88.4541L302 0L515.546 88.4541ZM297.893 196.156L212.393 298.656L209.187 302.5L212.393 306.344L297.893 408.844L302.5 414.367L307.107 408.844L392.607 306.344L395.813 302.5L392.607 298.656L307.107 196.156L302.5 190.633L297.893 196.156ZM380.186 302.5L302.5 395.632L224.813 302.5L302.5 209.367L380.186 302.5Z"
      :fill="fill"
    />
  </svg>
</template>

<style scoped lang="scss"></style>
