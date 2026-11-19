<script setup lang="ts">
defineProps<{
  text?: string
  icon?: string
}>()
</script>

<template>
  <div class="text-center text-muted py-5">
    <i class="bi display-5 d-block mb-2" :class="icon ?? 'bi-inbox'"></i>
    <div class="small">{{ text ?? '暂无数据' }}</div>
  </div>
</template>
