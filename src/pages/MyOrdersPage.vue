<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Loader2, ChevronRight, Phone, RefreshCw, ArrowDown } from 'lucide-vue-next'
import { getMyOrdersPage, type RepairOrder, type RepairOrderListResponse } from '@/utils/api'
import StatusBadge from '@/components/StatusBadge.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()

const PHONE_STORAGE_KEY = 'xiu_naer_reporter_phone'
const PAGE_SIZE = 10
const REFRESH_THRESHOLD = 80

const phone = ref('')
const statusFilter = ref('')
const orders = ref<RepairOrder[]>([])
const page = ref(1)
const total = ref(0)
const isLoading = ref(false)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const error = ref('')
const hasSearched = ref(false)

const pullDistance = ref(0)
const pullStartY = ref(0)
const isPulling = ref(false)

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'submitted', label: '已提交' },
  { value: 'accepted', label: '已受理' },
  { value: 'processing', label: '处理中' },
  { value: 'pending_review', label: '待验收' },
  { value: 'completed', label: '已完成' },
]

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter((order) => order.status === statusFilter.value)
})

function validatePhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

function resetPagination() {
  page.value = 1
  hasMore.value = true
  total.value = 0
}

async function fetchPage(reset: boolean): Promise<RepairOrderListResponse | null> {
  if (!validatePhone(phone.value)) {
    error.value = '请输入有效的手机号'
    return null
  }

  error.value = ''

  try {
    const res = await getMyOrdersPage(
      phone.value,
      page.value,
      PAGE_SIZE,
      statusFilter.value || undefined,
    )

    if (reset) {
      orders.value = res.list
    } else {
      orders.value.push(...res.list)
    }

    total.value = res.total
    hasMore.value = orders.value.length < res.total && res.list.length === PAGE_SIZE
    return res
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
    return null
  }
}

async function searchOrders() {
  resetPagination()
  isLoading.value = true
  hasSearched.value = true
  localStorage.setItem(PHONE_STORAGE_KEY, phone.value)

  await fetchPage(true)

  isLoading.value = false
}

async function refreshOrders() {
  if (isRefreshing.value) return

  isRefreshing.value = true
  resetPagination()
  await fetchPage(true)
  isRefreshing.value = false
}

async function loadMore() {
  if (isLoadingMore.value || isRefreshing.value || !hasMore.value) return

  isLoadingMore.value = true
  page.value += 1
  await fetchPage(false)
  isLoadingMore.value = false
}

function onFilterChange() {
  if (validatePhone(phone.value)) {
    searchOrders()
  }
}

function onScroll() {
  if (isLoadingMore.value || isRefreshing.value || !hasMore.value) return

  const scrollBottom = window.scrollY + window.innerHeight
  const threshold = document.documentElement.scrollHeight - 100

  if (scrollBottom >= threshold) {
    loadMore()
  }
}

function onTouchStart(event: TouchEvent) {
  if (window.scrollY > 0 || isRefreshing.value) return

  pullStartY.value = event.touches[0].clientY
  isPulling.value = true
}

function onTouchMove(event: TouchEvent) {
  if (!isPulling.value) return

  const distance = event.touches[0].clientY - pullStartY.value
  if (distance > 0) {
    pullDistance.value = Math.min(distance * 0.5, 120)
  }
}

function onTouchEnd() {
  if (!isPulling.value) return

  isPulling.value = false

  if (pullDistance.value >= REFRESH_THRESHOLD) {
    pullDistance.value = 60
    refreshOrders().then(() => {
      pullDistance.value = 0
    })
  } else {
    pullDistance.value = 0
  }
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

onMounted(() => {
  const savedPhone = localStorage.getItem(PHONE_STORAGE_KEY)
  if (savedPhone) {
    phone.value = savedPhone
    searchOrders()
  }

  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div
    class="pt-6"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
      class="pointer-events-none fixed left-0 right-0 top-0 z-40 flex items-end justify-center transition-transform duration-200"
      :style="{ transform: `translateY(${pullDistance - 60}px)` }"
    >
      <div class="flex h-16 items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2
          v-if="isRefreshing"
          class="h-4 w-4 animate-spin text-primary"
        />
        <RefreshCw
          v-else-if="pullDistance >= REFRESH_THRESHOLD"
          class="h-4 w-4 text-primary"
        />
        <ArrowDown
          v-else
          class="h-4 w-4"
        />
        <span>
          {{ isRefreshing ? '刷新中...' : pullDistance >= REFRESH_THRESHOLD ? '松开刷新' : '下拉刷新' }}
        </span>
      </div>
    </div>

    <section class="rounded-3xl bg-white p-5 shadow-sm">
      <h2 class="text-lg font-bold text-gray-900">
        我的报修
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        输入手机号查询历史报修记录。
      </p>

      <div class="relative mt-4">
        <Phone class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          v-model="phone"
          type="tel"
          maxlength="11"
          placeholder="请输入手机号"
          class="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-24 text-sm outline-none focus:border-primary focus:bg-white"
          @keyup.enter="searchOrders"
        >
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          :disabled="isLoading"
          @click="searchOrders"
        >
          <Loader2
            v-if="isLoading"
            class="h-4 w-4 animate-spin"
          />
          <Search
            v-else
            class="h-4 w-4"
          />
        </button>
      </div>

      <div
        v-if="error"
        class="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600"
      >
        {{ error }}
      </div>
    </section>

    <section
      v-if="hasSearched && !isLoading"
      class="mt-5"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">
          报修记录
          <span class="ml-1 text-xs font-normal text-gray-400">({{ total }})</span>
        </h3>
        <select
          v-model="statusFilter"
          class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-primary"
          @change="onFilterChange"
        >
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div
        v-if="filteredOrders.length > 0"
        class="mt-4 space-y-3"
      >
        <button
          v-for="order in filteredOrders"
          :key="order.id"
          type="button"
          class="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          @click="router.push(`/track/${order.id}`)"
        >
          <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            <img
              v-if="order.attachments.length > 0"
              :src="order.attachments[0].thumbnailUrl || order.attachments[0].url"
              alt=""
              class="h-full w-full object-cover"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-xs text-gray-400"
            >
              无图
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <p class="truncate text-sm font-semibold text-gray-900">
                {{ order.description || '暂无描述' }}
              </p>
              <ChevronRight class="h-4 w-4 flex-shrink-0 text-gray-400" />
            </div>
            <div class="mt-1 flex items-center gap-2">
              <StatusBadge :status="order.status" />
              <span class="text-xs text-gray-400">{{ formatTime(order.createdAt) }}</span>
            </div>
            <p
              v-if="order.location"
              class="mt-1 truncate text-xs text-gray-500"
            >
              {{ order.building }}{{ order.unit }} · {{ order.location }}
            </p>
          </div>
        </button>
      </div>

      <Empty
        v-else-if="!isRefreshing"
        title="暂无报修记录"
        description="该手机号下还没有报修工单，去首页提交一单吧。"
        class="rounded-3xl bg-white shadow-sm"
      />

      <div
        v-if="filteredOrders.length > 0"
        class="mt-4 flex items-center justify-center pb-2 text-sm text-gray-400"
      >
        <Loader2
          v-if="isLoadingMore"
          class="mr-2 h-4 w-4 animate-spin text-primary"
        />
        <span>{{ isLoadingMore ? '加载中...' : hasMore ? '上拉加载更多' : '已经到底啦' }}</span>
      </div>
    </section>
  </div>
</template>
