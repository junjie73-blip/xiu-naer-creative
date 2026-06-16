<script setup lang="ts">
import { ArrowLeft, Home, List } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const titleMap: Record<string, string> = {
  home: '修哪儿',
  report: '拍照报修',
  track: '进度追踪',
  'my-orders': '我的报修',
}

function goBack() {
  router.back()
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
    <div class="mx-auto flex max-w-md items-center justify-between">
      <button
        v-if="route.name !== 'home'"
        class="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
        @click="goBack"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
      <div
        v-else
        class="h-10 w-10"
      />

      <h1 class="text-lg font-bold text-gray-900">
        {{ titleMap[route.name as string] || '修哪儿' }}
      </h1>

      <button
        class="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
        @click="router.push('/my-orders')"
      >
        <List class="h-5 w-5" />
      </button>
    </div>
  </header>
</template>
