<script setup lang="ts">
import { Clock, CheckCircle2, Circle } from 'lucide-vue-next'
import type { TimelineEvent } from '@/utils/api'

interface Props {
  event: TimelineEvent
  isLatest: boolean
}

const props = defineProps<Props>()

const statusLabels: Record<string, string> = {
  submitted: '已提交',
  accepted: '已受理',
  processing: '处理中',
  pending_review: '待验收',
  completed: '已完成',
  escalated: '已升级',
}

function formatTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="relative flex gap-4 pb-8">
    <div class="flex flex-col items-center">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full border-2"
        :class="
          isLatest
            ? 'border-primary bg-primary text-white'
            : 'border-gray-200 bg-white text-gray-400'
        "
      >
        <CheckCircle2
          v-if="isLatest"
          class="h-5 w-5"
        />
        <Circle
          v-else
          class="h-5 w-5"
        />
      </div>
      <div
        v-if="!isLatest"
        class="mt-2 h-full w-0.5 bg-gray-200"
      />
    </div>

    <div class="flex-1 pt-1">
      <div class="flex items-center justify-between">
        <h4
          class="font-semibold"
          :class="isLatest ? 'text-gray-900' : 'text-gray-500'"
        >
          {{ statusLabels[event.status] || event.status }}
        </h4>
        <span class="flex items-center gap-1 text-xs text-gray-400">
          <Clock class="h-3 w-3" />
          {{ formatTime(event.createdAt) }}
        </span>
      </div>
      <p
        v-if="event.remark"
        class="mt-1 text-sm text-gray-600"
      >
        {{ event.remark }}
      </p>
    </div>
  </div>
</template>
