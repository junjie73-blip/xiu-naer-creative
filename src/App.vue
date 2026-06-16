<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppToast from '@/components/AppToast.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />
    <AppToast />
    <main class="mx-auto max-w-md px-4 pb-8">
      <router-view />
    </main>
  </div>
</template>
