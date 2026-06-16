<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Camera, ScanLine, Truck, Star, ChevronRight, Loader2 } from 'lucide-vue-next'
import { useRecentOrders } from '@/composables/useRecentOrders'
import StatusBadge from '@/components/StatusBadge.vue'

const router = useRouter()
const { orders: recentOrders, isLoading } = useRecentOrders()

const community = {
  id: 'demo-community',
  name: '阳光花园小区',
}

const steps = [
  { icon: Camera, label: '拍照', desc: '上传问题照片' },
  { icon: ScanLine, label: 'AI 识别', desc: '自动分类定级' },
  { icon: Truck, label: '追踪', desc: '实时查看进度' },
  { icon: Star, label: '评价', desc: '完成服务闭环' },
]

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
  <div class="pt-6">
    <!-- Hero -->
    <section class="rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-card">
      <h2 class="text-2xl font-bold">
        像查快递一样查报修
      </h2>
      <p class="mt-2 text-sm text-white/80">
        社区公共设施报修进度透明追踪，让每一单都有始有终。
      </p>

      <div class="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
        <p class="text-xs text-white/70">
          当前社区
        </p>
        <p class="text-lg font-semibold">
          {{ community.name }}
        </p>
      </div>

      <button
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 font-semibold text-primary shadow-md transition-transform active:scale-95"
        @click="router.push('/report')"
      >
        <Camera class="h-5 w-5" />
        立即拍照报修
      </button>
    </section>

    <!-- Recent Orders -->
    <section
      v-if="recentOrders.length > 0"
      class="mt-6"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">
          最近报修
        </h3>
        <button
          class="flex items-center text-sm text-primary"
          @click="router.push('/my-orders')"
        >
          全部
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>

      <div class="mt-3 space-y-3">
        <button
          v-for="order in recentOrders.slice(0, 2)"
          :key="order.id"
          type="button"
          class="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          @click="router.push(`/track/${order.id}`)"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-gray-900">
              {{ order.description || '暂无描述' }}
            </p>
            <p class="mt-1 text-xs text-gray-400">
              {{ formatTime(order.createdAt) }}
            </p>
          </div>
          <StatusBadge :status="order.status" />
        </button>
      </div>
    </section>

    <div
      v-else-if="isLoading"
      class="mt-6 flex items-center justify-center py-8"
    >
      <Loader2 class="h-6 w-6 animate-spin text-primary" />
    </div>

    <!-- Steps -->
    <section class="mt-8">
      <h3 class="text-base font-semibold text-gray-900">
        报修流程
      </h3>
      <div class="mt-4 grid grid-cols-4 gap-3">
        <div
          v-for="(step, index) in steps"
          :key="step.label"
          class="flex flex-col items-center rounded-2xl bg-white p-3 text-center shadow-sm"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <component
              :is="step.icon"
              class="h-5 w-5"
            />
          </div>
          <p class="mt-2 text-xs font-medium text-gray-900">
            {{ step.label }}
          </p>
          <p class="mt-0.5 text-[10px] text-gray-500">
            {{ step.desc }}
          </p>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="mt-8 rounded-2xl bg-white p-5 shadow-sm">
      <h3 class="text-base font-semibold text-gray-900">
        物业联系方式
      </h3>
      <p class="mt-2 text-sm text-gray-500">
        遇到问题可拨打物业电话：010-12345678
      </p>
      <button
        class="mt-4 w-full rounded-full border border-primary py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        @click="router.push('/my-orders')"
      >
        查看我的报修
      </button>
    </section>
  </div>
</template>
