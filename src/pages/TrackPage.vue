<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loader2, Phone, ClipboardList, MessageSquare, CheckCircle2, Bell, MapPin, User, Clock } from 'lucide-vue-next'
import { getOrder, updateOrderStatus, submitReview, type RepairOrder } from '@/utils/api'
import { showToast } from '@/composables/useToast'
import StatusBadge from '@/components/StatusBadge.vue'
import TimelineItem from '@/components/TimelineItem.vue'
import StarRating from '@/components/StarRating.vue'

const route = useRoute()
const orderId = route.params.orderId as string
const fromReport = route.query.from === 'report'

const order = ref<RepairOrder | null>(null)
const isLoading = ref(true)
const error = ref('')
const isActionLoading = ref(false)
const showSuccessTip = ref(fromReport)
const countdown = ref('')
let countdownTimer: ReturnType<typeof setInterval> | null = null

const rating = ref(5)
const reviewContent = ref('')
const isReviewSubmitting = ref(false)
const reviewSuccess = ref(false)
const showCallModal = ref(false)

const propertyPhone = computed(() => order.value?.community?.contactPhone || '010-12345678')

const categoryLabels: Record<string, string> = {
  lighting: '照明设施',
  sanitation: '环境卫生',
  security: '安防设施',
  elevator: '电梯设备',
  water: '水电设施',
  road: '道路设施',
  green: '绿化养护',
  other: '其他问题',
}

const severityLabels: Record<string, string> = {
  general: '一般',
  urgent: '紧急',
  critical: '严重',
}

const severityClasses: Record<string, string> = {
  general: 'bg-blue-100 text-blue-700',
  urgent: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
}

const showAcceptAction = computed(() => order.value?.status === 'pending_review')
const showReviewForm = computed(
  () => order.value?.status === 'completed' && !order.value?.review && !reviewSuccess.value
)
const reporterPhotos = computed(() => order.value?.attachments.filter((a) => a.type === 'reporter') || [])
const handlerPhotos = computed(() => order.value?.attachments.filter((a) => a.type === 'handler') || [])

function formatTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function updateCountdown() {
  if (!order.value?.deadline) {
    countdown.value = ''
    return
  }
  const end = new Date(order.value.deadline).getTime()
  const now = Date.now()
  const diff = end - now
  if (diff <= 0) {
    countdown.value = '已超时'
    return
  }
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  countdown.value = `${hours}小时${minutes}分钟`
}

async function loadOrder() {
  isLoading.value = true
  error.value = ''
  try {
    order.value = await getOrder(orderId)
    updateCountdown()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '查询工单失败'
  } finally {
    isLoading.value = false
  }
}

async function acceptCompletion() {
  if (!order.value) return
  isActionLoading.value = true
  try {
    await updateOrderStatus(orderId, 'completed', '用户确认验收')
    showToast('验收成功，期待您的评价', 'success')
    await loadOrder()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '验收失败'
    showToast(error.value, 'error')
  } finally {
    isActionLoading.value = false
  }
}

async function urgeOrder() {
  if (!order.value) return
  isActionLoading.value = true
  try {
    await updateOrderStatus(orderId, order.value.status, '用户催单，请尽快处理')
    showToast('催单成功，已通知工作人员', 'success')
    await loadOrder()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '催单失败'
    showToast(error.value, 'error')
  } finally {
    isActionLoading.value = false
  }
}

function callProperty() {
  showCallModal.value = true
}

function confirmCall() {
  showCallModal.value = false
  window.location.href = `tel:${propertyPhone.value}`
}

async function submitUserReview() {
  if (!order.value) return
  isReviewSubmitting.value = true
  error.value = ''
  try {
    await submitReview(orderId, rating.value, reviewContent.value)
    reviewSuccess.value = true
    showToast('评价提交成功，感谢您的反馈', 'success')
    await loadOrder()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '评价失败'
    showToast(error.value, 'error')
  } finally {
    isReviewSubmitting.value = false
  }
}

async function shareOrder() {
  if (!order.value) return
  const shareUrl = `${window.location.origin}/track/${orderId}`
  try {
    await navigator.clipboard.writeText(shareUrl)
    showToast('追踪链接已复制到剪贴板', 'success')
  } catch {
    showToast('复制失败，请手动复制链接', 'error')
  }
}

onMounted(() => {
  loadOrder()
  countdownTimer = setInterval(updateCountdown, 60000)
  if (fromReport) {
    setTimeout(() => {
      showSuccessTip.value = false
    }, 5000)
  }
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<template>
  <div class="pt-6">
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-20"
    >
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
      <p class="mt-3 text-sm text-gray-500">
        加载工单中...
      </p>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl bg-danger-50 p-6 text-center"
    >
      <p class="text-danger">
        {{ error }}
      </p>
      <button
        class="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-white"
        @click="loadOrder"
      >
        重试
      </button>
    </div>

    <div v-else-if="order">
      <div
        v-if="showSuccessTip"
        class="mb-4 rounded-2xl bg-success-50 p-4 text-center text-sm text-success"
      >
        报修提交成功！您可以随时来这里查看处理进度。
      </div>

      <!-- 工单状态卡片 -->
      <section class="rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-white/70">
              工单编号
            </p>
            <p class="mt-1 font-mono text-sm">
              {{ order.id }}
            </p>
          </div>
          <StatusBadge :status="order.status" />
        </div>

        <h2 class="mt-4 text-xl font-bold">
          {{ categoryLabels[order.category] || order.category }}
        </h2>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="severityClasses[order.severity] || 'bg-white/20 text-white'"
          >
            {{ severityLabels[order.severity] || order.severity }}
          </span>
          <span class="text-xs text-white/80">预计完成：{{ formatTime(order.deadline) }}</span>
        </div>

        <div
          v-if="countdown"
          class="mt-3 text-xs text-white/80"
        >
          剩余时间：{{ countdown }}
        </div>

        <div class="mt-6 flex items-center gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur">
          <Phone class="h-4 w-4 text-white/70" />
          <span class="text-sm">{{ order.reporterPhone }}</span>
        </div>
      </section>

      <!-- 负责人员 -->
      <section
        v-if="order.handler"
        class="mt-4 rounded-2xl bg-white p-4 shadow-sm"
      >
        <h3 class="text-sm font-semibold text-gray-900">
          负责人员
        </h3>
        <div class="mt-2 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ order.handler.name }}
            </p>
            <p
              v-if="order.handler.phone"
              class="text-xs text-gray-500"
            >
              {{ order.handler.phone }}
            </p>
          </div>
        </div>
      </section>

      <!-- 描述与图片 -->
      <section class="mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <h3 class="flex items-center gap-2 text-base font-semibold text-gray-900">
          <ClipboardList class="h-5 w-5 text-primary" />
          问题描述
        </h3>
        <p class="mt-3 text-sm leading-relaxed text-gray-600">
          {{ order.description || '暂无描述' }}
        </p>

        <div
          v-if="order.building || order.unit || order.location"
          class="mt-3 flex flex-wrap gap-2 text-xs text-gray-500"
        >
          <span
            v-if="order.building"
            class="rounded-full bg-gray-100 px-2 py-1"
          >{{ order.building }}</span>
          <span
            v-if="order.unit"
            class="rounded-full bg-gray-100 px-2 py-1"
          >{{ order.unit }}</span>
          <span
            v-if="order.location"
            class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1"
          >
            <MapPin class="h-3 w-3" /> {{ order.location }}
          </span>
        </div>

        <div
          v-if="reporterPhotos.length > 0"
          class="mt-4 grid grid-cols-3 gap-3"
        >
          <a
            v-for="attachment in reporterPhotos"
            :key="attachment.id"
            :href="attachment.url"
            target="_blank"
            class="aspect-square overflow-hidden rounded-2xl"
          >
            <img
              :src="attachment.thumbnailUrl || attachment.url"
              alt=""
              class="h-full w-full object-cover"
            >
          </a>
        </div>
      </section>

      <!-- 处理照片 -->
      <section
        v-if="handlerPhotos.length > 0"
        class="mt-4 rounded-3xl bg-white p-5 shadow-sm"
      >
        <h3 class="text-base font-semibold text-gray-900">
          处理照片
        </h3>
        <div class="mt-3 grid grid-cols-3 gap-3">
          <a
            v-for="attachment in handlerPhotos"
            :key="attachment.id"
            :href="attachment.url"
            target="_blank"
            class="aspect-square overflow-hidden rounded-2xl"
          >
            <img
              :src="attachment.thumbnailUrl || attachment.url"
              alt=""
              class="h-full w-full object-cover"
            >
          </a>
        </div>
      </section>

      <!-- 进度时间线 -->
      <section class="mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900">
          处理进度
        </h3>
        <div class="mt-4">
          <TimelineItem
            v-for="(event, index) in order.timeline"
            :key="event.id"
            :event="event"
            :is-latest="index === 0"
          />
        </div>
      </section>

      <!-- 快捷操作 -->
      <section
        v-if="order.status !== 'completed'"
        class="mt-4 grid grid-cols-2 gap-3"
      >
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-2xl bg-warning py-3 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
          :disabled="isActionLoading"
          @click="urgeOrder"
        >
          <Bell class="h-4 w-4" />
          催单
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          @click="callProperty"
        >
          <Phone class="h-4 w-4" />
          联系物业
        </button>
      </section>

      <!-- 验收操作 -->
      <section
        v-if="showAcceptAction"
        class="mt-4 rounded-3xl bg-white p-5 shadow-sm"
      >
        <h3 class="text-base font-semibold text-gray-900">
          确认验收
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          维修已完成，请点击下方按钮确认验收。
        </p>
        <button
          type="button"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-success py-3 font-semibold text-white shadow-md transition-transform active:scale-95 disabled:opacity-60"
          :disabled="isActionLoading"
          @click="acceptCompletion"
        >
          <Loader2
            v-if="isActionLoading"
            class="h-5 w-5 animate-spin"
          />
          <CheckCircle2
            v-else
            class="h-5 w-5"
          />
          {{ isActionLoading ? '提交中...' : '确认验收' }}
        </button>
      </section>

      <!-- 评价表单 -->
      <section
        v-if="showReviewForm"
        class="mt-4 rounded-3xl bg-white p-5 shadow-sm"
      >
        <h3 class="flex items-center gap-2 text-base font-semibold text-gray-900">
          <MessageSquare class="h-5 w-5 text-primary" />
          服务评价
        </h3>
        <div class="mt-3">
          <p class="text-sm text-gray-500">
            满意度评分
          </p>
          <StarRating
            v-model="rating"
            class="mt-2"
          />
        </div>
        <div class="mt-4">
          <textarea
            v-model="reviewContent"
            rows="3"
            placeholder="请留下您的宝贵意见（选填）"
            class="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </div>
        <button
          type="button"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-white shadow-md transition-transform active:scale-95 disabled:opacity-60"
          :disabled="isReviewSubmitting"
          @click="submitUserReview"
        >
          <Loader2
            v-if="isReviewSubmitting"
            class="h-5 w-5 animate-spin"
          />
          <span v-else>提交评价</span>
        </button>
      </section>

      <!-- 已评价 -->
      <section
        v-else-if="order.review"
        class="mt-4 rounded-3xl bg-white p-5 shadow-sm"
      >
        <h3 class="text-base font-semibold text-gray-900">
          我的评价
        </h3>
        <div class="mt-3">
          <StarRating
            :model-value="order.review.rating"
            readonly
          />
        </div>
        <p
          v-if="order.review.content"
          class="mt-3 text-sm text-gray-600"
        >
          {{ order.review.content }}
        </p>
      </section>

      <!-- 分享 -->
      <button
        type="button"
        class="mt-4 w-full rounded-full border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        @click="shareOrder"
      >
        复制追踪链接
      </button>

      <!-- 联系物业弹窗 -->
      <div
        v-if="showCallModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div class="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone class="h-6 w-6" />
          </div>
          <h3 class="mt-4 text-base font-semibold text-gray-900">
            联系物业
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            拨打后将跳转至系统拨号
          </p>
          <p class="mt-3 text-lg font-bold text-primary">
            {{ propertyPhone }}
          </p>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700"
              @click="showCallModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="rounded-2xl bg-primary py-3 text-sm font-semibold text-white"
              @click="confirmCall"
            >
              拨打
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
