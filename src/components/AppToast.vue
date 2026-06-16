<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, AlertCircle, Info } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { state } = useToast()

const icon = computed(() => {
  switch (state.type) {
    case 'success':
      return CheckCircle2
    case 'error':
      return AlertCircle
    default:
      return Info
  }
})

const typeClasses = computed(() => {
  switch (state.type) {
    case 'success':
      return 'bg-success text-white'
    case 'error':
      return 'bg-danger text-white'
    default:
      return 'bg-gray-900 text-white'
  }
})
</script>

<template>
  <transition name="toast">
    <div
      v-if="state.visible"
      class="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg"
      :class="typeClasses"
    >
      <div class="flex items-center gap-2">
        <component
          :is="icon"
          class="h-4 w-4"
        />
        <span>{{ state.message }}</span>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -1rem);
}
</style>
