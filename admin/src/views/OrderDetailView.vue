<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard,
  NSpace,
  NButton,
  NSelect,
  NSpin,
  NTag,
  NTimeline,
  NTimelineItem,
  NDivider,
  NImage,
  useMessage,
} from 'naive-ui'
import { getOrder, assignOrder, updateOrderStatus, type RepairOrder } from '@/api/orders'
import { listStaff, type Staff } from '@/api/staff'
import { useAuthStore } from '@/stores/auth'
import { categoryLabels, severityLabels, statusLabels, statusOptions } from '@/utils/labels'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const message = useMessage()

const orderId = route.params.id as string
const order = ref<RepairOrder | null>(null)
const staffList = ref<Staff[]>([])
const loading = ref(true)
const actionLoading = ref(false)
const selectedHandler = ref<string | null>(null)

const reporterPhotos = computed(() => order.value?.attachments.filter((a) => a.type === 'reporter') || [])
const handlerPhotos = computed(() => order.value?.attachments.filter((a) => a.type === 'handler') || [])

const staffOptions = computed(() =>
  staffList.value
    .filter((s) => s.status === 'active')
    .map((s) => ({ label: `${s.name} (${s.phone || '无电话'})`, value: s.id })),
)

const statusTypeMap: Record<string, string> = {
  submitted: 'default',
  accepted: 'info',
  processing: 'warning',
  pending_review: 'warning',
  completed: 'success',
  escalated: 'error',
}

async function loadData() {
  loading.value = true
  try {
    const [orderData, staffData] = await Promise.all([getOrder(orderId), listStaff()])
    order.value = orderData
    staffList.value = staffData
    selectedHandler.value = orderData.handlerId
  } finally {
    loading.value = false
  }
}

async function handleAssign() {
  if (!selectedHandler.value) {
    message.warning('请选择处理人员')
    return
  }
  actionLoading.value = true
  try {
    await assignOrder(orderId, selectedHandler.value, auth.user?.name)
    message.success('派单成功')
    await loadData()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '派单失败')
  } finally {
    actionLoading.value = false
  }
}

async function changeStatus(status: string, remark: string) {
  actionLoading.value = true
  try {
    await updateOrderStatus(orderId, status, remark)
    message.success('状态更新成功')
    await loadData()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '状态更新失败')
  } finally {
    actionLoading.value = false
  }
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleString('zh-CN')
}

onMounted(loadData)
</script>

<template>
  <n-spin :show="loading">
    <div
      v-if="order"
      class="space-y-4"
    >
      <n-card title="工单详情">
        <n-space
          vertical
          size="large"
        >
          <n-space align="center">
            <span class="text-gray-500">状态</span>
            <n-tag
              :type="statusTypeMap[order.status] as any"
              size="large"
            >
              {{ statusLabels[order.status] || order.status }}
            </n-tag>
          </n-space>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">工单编号：</span>
              <span>{{ order.id }}</span>
            </div>
            <div>
              <span class="text-gray-500">社区：</span>
              <span>{{ order.community?.name || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">分类：</span>
              <span>{{ categoryLabels[order.category] || order.category }}</span>
            </div>
            <div>
              <span class="text-gray-500">严重度：</span>
              <span>{{ severityLabels[order.severity] || order.severity }}</span>
            </div>
            <div>
              <span class="text-gray-500">报修人手机：</span>
              <span>{{ order.reporterPhone }}</span>
            </div>
            <div>
              <span class="text-gray-500">联系人：</span>
              <span>{{ order.contactName || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">位置：</span>
              <span>
                {{ [order.building, order.unit, order.location].filter(Boolean).join(' · ') || '-' }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">创建时间：</span>
              <span>{{ formatTime(order.createdAt) }}</span>
            </div>
          </div>

          <div>
            <span class="text-gray-500">问题描述：</span>
            <p class="mt-1 text-sm">
              {{ order.description || '暂无描述' }}
            </p>
          </div>
        </n-space>
      </n-card>

      <n-card title="处理进度">
        <n-timeline>
          <n-timeline-item
            v-for="event in order.timeline"
            :key="event.id"
            :type="event.status === 'completed' ? 'success' : 'default'"
            :title="statusLabels[event.status] || event.status"
            :content="event.remark || ''"
            :time="formatTime(event.createdAt)"
          />
        </n-timeline>
      </n-card>

      <n-card title="操作">
        <n-space vertical>
          <n-space align="center">
            <span>派单给：</span>
            <n-select
              v-model:value="selectedHandler"
              placeholder="选择维修人员"
              :options="staffOptions"
              style="width: 240px"
            />
            <n-button
              type="primary"
              :loading="actionLoading"
              @click="handleAssign"
            >
              确认派单
            </n-button>
          </n-space>

          <n-divider />

          <n-space>
            <n-button
              :disabled="order.status === 'processing'"
              @click="changeStatus('processing', '开始处理')"
            >
              标记处理中
            </n-button>
            <n-button
              :disabled="order.status === 'pending_review'"
              @click="changeStatus('pending_review', '处理完成，等待验收')"
            >
              标记待验收
            </n-button>
            <n-button
              :disabled="order.status === 'completed'"
              type="success"
              @click="changeStatus('completed', '工单已完成')"
            >
              标记已完成
            </n-button>
          </n-space>
        </n-space>
      </n-card>

      <n-card
        v-if="reporterPhotos.length > 0"
        title="报修照片"
      >
        <n-space>
          <n-image
            v-for="photo in reporterPhotos"
            :key="photo.id"
            :src="photo.thumbnailUrl || photo.url"
            :preview-src="photo.url"
            width="120"
            class="rounded"
          />
        </n-space>
      </n-card>

      <n-card
        v-if="handlerPhotos.length > 0"
        title="处理照片"
      >
        <n-space>
          <n-image
            v-for="photo in handlerPhotos"
            :key="photo.id"
            :src="photo.thumbnailUrl || photo.url"
            :preview-src="photo.url"
            width="120"
            class="rounded"
          />
        </n-space>
      </n-card>

      <n-space>
        <n-button @click="router.push('/orders')">
          返回列表
        </n-button>
      </n-space>
    </div>
  </n-spin>
</template>
