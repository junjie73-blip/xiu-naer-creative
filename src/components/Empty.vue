<script setup lang="ts">
import { ClipboardX } from 'lucide-vue-next'

interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: '暂无数据',
  description: '这里还没有内容',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <ClipboardX class="h-8 w-8 text-gray-400" />
    </div>
    <h3 class="mt-4 text-base font-semibold text-gray-900">
      {{ title }}
    </h3>
    <p class="mt-1 text-sm text-gray-500">
      {{ description }}
    </p>
  </div>
</template>
