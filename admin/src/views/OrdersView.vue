<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NDataTable,
  NInput,
  NSelect,
  NSpace,
  NButton,
  NPagination,
  NSpin,
  NTag,
  type DataTableColumns,
} from 'naive-ui'
import { listOrders, type RepairOrder } from '@/api/orders'
import {
  categoryLabels,
  severityLabels,
  statusLabels,
  statusOptions,
  severityOptions,
} from '@/utils/labels'

const router = useRouter()

const loading = ref(false)
const orders = ref<RepairOrder[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const status = ref('')
const severity = ref('')

const statusTypeMap: Record<string, string> = {
  submitted: 'default',
  accepted: 'info',
  processing: 'warning',
  pending_review: 'warning',
  completed: 'success',
  escalated: 'error',
}

const severityTypeMap: Record<string, string> = {
  general: 'default',
  urgent: 'warning',
  critical: 'error',
}

const columns: DataTableColumns<RepairOrder> = [
  {
    title: '工单编号',
    key: 'id',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: RepairOrder) {
      return h(
        NTag,
        { type: statusTypeMap[row.status] as any, size: 'small' },
        { default: () => statusLabels[row.status] || row.status },
      )
    },
  },
  {
    title: '分类 / 严重度',
    key: 'category',
    width: 160,
    render(row: RepairOrder) {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(NTag, { size: 'small' }, { default: () => categoryLabels[row.category] || row.category }),
            h(
              NTag,
              { type: severityTypeMap[row.severity] as any, size: 'small' },
              { default: () => severityLabels[row.severity] || row.severity },
            ),
          ],
        },
      )
    },
  },
  {
    title: '报修人手机',
    key: 'reporterPhone',
    width: 140,
  },
  {
    title: '位置',
    key: 'location',
    ellipsis: { tooltip: true },
    render(row: RepairOrder) {
      const parts = [row.building, row.unit, row.location].filter(Boolean)
      return parts.join(' · ') || '-'
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 170,
    render(row: RepairOrder) {
      return new Date(row.createdAt).toLocaleString('zh-CN')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render(row: RepairOrder) {
      return h(
        NButton,
        { size: 'small', type: 'primary', onClick: () => router.push(`/orders/${row.id}`) },
        { default: () => '详情' },
      )
    },
  },
]

async function loadData() {
  loading.value = true
  try {
    const res = await listOrders({
      status: status.value,
      severity: severity.value,
      keyword: keyword.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    orders.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  loadData()
}

function onPageChange(newPage: number) {
  page.value = newPage
  loadData()
}

onMounted(loadData)
</script>

<template>
  <n-card title="工单列表">
    <n-space
      vertical
      size="large"
    >
      <n-space>
        <n-input
          v-model:value="keyword"
          placeholder="搜索手机号或描述"
          style="width: 240px"
          @keydown.enter="onSearch"
        />
        <n-select
          v-model:value="status"
          placeholder="工单状态"
          clearable
          :options="statusOptions"
          style="width: 160px"
          @update:value="onSearch"
        />
        <n-select
          v-model:value="severity"
          placeholder="严重度"
          clearable
          :options="severityOptions"
          style="width: 160px"
          @update:value="onSearch"
        />
        <n-button
          type="primary"
          @click="onSearch"
        >
          查询
        </n-button>
      </n-space>

      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="orders"
          :bordered="false"
        />
      </n-spin>

      <div class="flex justify-end">
        <n-pagination
          v-model:page="page"
          :page-size="pageSize"
          :item-count="total"
          @update:page="onPageChange"
        />
      </div>
    </n-space>
  </n-card>
</template>
