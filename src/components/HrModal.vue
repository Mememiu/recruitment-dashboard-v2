<script setup lang="ts">
defineProps<{
  title: string
  wide?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-panel" :style="wide ? { width: '760px' } : undefined">
        <div class="d-flex align-items-center justify-content-between p-4 pb-3">
          <h5 class="mb-0 fw-bold">{{ title }}</h5>
          <button class="btn btn-light btn-sm rounded-circle" @click="emit('close')" title="关闭">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <hr class="my-0" />
        <div class="p-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="d-flex justify-content-end gap-2 p-4 pt-0">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
