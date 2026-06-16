<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NCard, NSpin, NSpace, NTag } from 'naive-ui'
import { fetchTrend, fetchCategory, fetchRating, type TrendItem, type CategoryItem, type RatingItem } from '@/api/reports'
import { categoryLabels } from '@/utils/labels'

const loading = ref(true)
const trend = ref<TrendItem[]>([])
const category = ref<CategoryItem[]>([])
const rating = ref<RatingItem[]>([])

const maxTrend = computed(() => Math.max(1, ...trend.value.map((i) => i.count)))
const maxCategory = computed(() => Math.max(1, ...category.value.map((i) => i.count)))
const maxRating = computed(() => Math.max(1, ...rating.value.map((i) => i.count)))

async function load() {
  loading.value = true
  try {
    const [t, c, r] = await Promise.all([fetchTrend(7), fetchCategory(), fetchRating()])
    trend.value = t
    category.value = c
    rating.value = r
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <n-spin :show="loading">
    <div class="space-y-4">
      <n-card title="近 7 天报修趋势">
        <div class="flex h-48 items-end gap-2">
          <div
            v-for="item in trend"
            :key="item.date"
            class="flex flex-1 flex-col items-center justify-end"
          >
            <div
              class="w-full rounded-t bg-primary transition-all"
              :style="{ height: `${(item.count / maxTrend) * 100}%` }"
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

      <n-card title="分类占比">
        <div class="space-y-2">
          <div
            v-for="item in category"
            :key="item.category"
            class="flex items-center gap-3"
          >
            <div class="w-24 text-sm">
              {{ categoryLabels[item.category] || item.category }}
            </div>
            <div class="flex-1 rounded-full bg-gray-100">
              <div
                class="h-4 rounded-full bg-secondary transition-all"
                :style="{ width: `${(item.count / maxCategory) * 100}%` }"
              />
            </div>
            <n-tag size="small">
              {{ item.count }}
            </n-tag>
          </div>
        </div>
      </n-card>

      <n-card title="满意度分布">
        <div class="space-y-2">
          <div
            v-for="item in rating"
            :key="item.rating"
            class="flex items-center gap-3"
          >
            <div class="w-16 text-sm">
              {{ item.rating }} 星
            </div>
            <div class="flex-1 rounded-full bg-gray-100">
              <div
                class="h-4 rounded-full bg-success transition-all"
                :style="{ width: `${(item.count / maxRating) * 100}%` }"
              />
            </div>
            <n-tag size="small">
              {{ item.count }}
            </n-tag>
          </div>
        </div>
      </n-card>
    </div>
  </n-spin>
</template>
