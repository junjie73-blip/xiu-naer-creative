<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
} from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menuOptions = [
  { label: '数据看板', key: 'dashboard', path: '/dashboard' },
  { label: '工单管理', key: 'orders', path: '/orders' },
  { label: '社区管理', key: 'communities', path: '/communities' },
  { label: '人员管理', key: 'staff', path: '/staff' },
  { label: '数据报表', key: 'reports', path: '/reports' },
]

const activeKey = computed(() => {
  const segment = route.path.split('/')[1]
  return segment || 'dashboard'
})

const pageTitle = computed(() => {
  const item = menuOptions.find((option) => option.key === activeKey.value)
  return item?.label || '修哪儿物业后台'
})

function handleMenuUpdate(key: string) {
  const item = menuOptions.find((option) => option.key === key)
  if (item) {
    router.push(item.path)
  }
}
</script>

<template>
  <n-layout
    has-sider
    style="height: 100vh"
  >
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="200"
      show-trigger
    >
      <div class="flex h-16 items-center justify-center text-lg font-bold text-primary">
        修哪儿
      </div>
      <n-menu
        :value="activeKey"
        :options="menuOptions"
        @update:value="handleMenuUpdate"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header
        bordered
        style="
          height: 64px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >
        <h2 class="text-lg font-semibold">
          {{ pageTitle }}
        </h2>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ auth.user?.name }}</span>
          <n-button
            size="small"
            @click="auth.logout"
          >
            退出
          </n-button>
        </div>
      </n-layout-header>

      <n-layout-content content-style="padding: 24px;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
