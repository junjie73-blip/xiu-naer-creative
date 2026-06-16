<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  NCard,
  NGrid,
  NGi,
  NStatistic,
  NNumberAnimation,
  NSpin,
  NTag,
} from 'naive-ui'
import { fetchDashboard, type DashboardData } from '@/api/dashboard'
import { fetchTrend, type TrendItem } from '@/api/reports'

const dashboard = ref<DashboardData | null>(null)
const trend = ref<TrendItem[]>([])
const loading = ref(true)

const maxTrendCount = computed(() => {
  if (trend.value.length === 0) return 1
  return Math.max(...trend.value.map((item) => item.count))
})

async function load() {
  loading.value = true
  try {
    const [dashboardData, trendData] = await Promise.all([
      fetchDashboard(),
      fetchTrend(7),
    ])
    dashboard.value = dashboardData
    trend.value = trendData
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <n-spin :show="loading">
    <div class="space-y-4">
      <n-grid
        :cols="3"
        :x-gap="16"
        :y-gap="16"
        responsive="screen"
      >
        <n-gi>
          <n-card>
            <n-statistic
              label="今日报修"
              tabular-nums
            >
              <n-number-animation
                :from="0"
                :to="dashboard?.todayCount || 0"
              />
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic
              label="待处理"
              tabular-nums
            >
              <n-number-animation
                :from="0"
                :to="dashboard?.pendingCount || 0"
              />
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic
              label="已完成"
              tabular-nums
            >
              <n-number-animation
                :from="0"
                :to="dashboard?.completedCount || 0"
              />
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic
              label="累计工单"
              tabular-nums
            >
              <n-number-animation
                :from="0"
                :to="dashboard?.totalCount || 0"
              />
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic
              label="平均评分"
              tabular-nums
            >
              <n-number-animation
                :from="0"
                :to="dashboard?.avgRating || 0"
                :precision="1"
              />
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic
              label="维修人员"
              tabular-nums
            >
              <n-number-animation
                :from="0"
                :to="dashboard?.staffCount || 0"
              />
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>

      <n-card title="近 7 天报修趋势">
        <div class="flex h-40 items-end justify-between gap-2">
          <div
            v-for="item in trend"
            :key="item.date"
            class="flex flex-1 flex-col items-center justify-end"
          >
            <div
              class="w-full rounded-t bg-primary/80 transition-all"
              :style="{ height: `${(item.count / maxTrendCount) * 100}%` }"
            />
            <div class="mt-2 text-xs text-gray-500">
              {{ item.date.slice(5) }}
            </div>
            <n-tag
              size="small"
              class="mt-1"
            >
              {{ item.count }}
            </n-tag>
          </div>
        </div>
      </n-card>
    </div>
  </n-spin>
</template>
