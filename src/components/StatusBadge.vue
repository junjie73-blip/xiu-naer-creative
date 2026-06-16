<script setup lang="ts">
interface Props {
  status: string
}

const props = defineProps<Props>()

const statusStyles: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  accepted: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-amber-100 text-amber-700',
  pending_review: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  escalated: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  submitted: '已提交',
  accepted: '已受理',
  processing: '处理中',
  pending_review: '待验收',
  completed: '已完成',
  escalated: '已升级',
}

const style = statusStyles[props.status] || 'bg-gray-100 text-gray-700'
const label = statusLabels[props.status] || props.status
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
    :class="style"
  >
    {{ label }}
  </span>
</template>
