<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, X, Loader2, MapPin, User, Building2, Clock, AlertTriangle } from 'lucide-vue-next'
import { uploadImage, createOrder } from '@/utils/api'
import { showToast } from '@/composables/useToast'

const router = useRouter()

const community = {
  id: 'demo-community',
  name: '阳光花园小区',
}

const images = ref<string[]>([])
const description = ref('')
const reporterPhone = ref('')
const contactName = ref('')
const building = ref('')
const unit = ref('')
const locationDetail = ref('')
const preferredTime = ref('')
const isUrgent = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const MAX_IMAGES = 4
const MAX_FILE_SIZE = 10 * 1024 * 1024
const PHONE_STORAGE_KEY = 'xiu_naer_reporter_phone'

function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

function resizeImage(file: File, maxWidth = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''

  const remainingSlots = MAX_IMAGES - images.value.length
  const selectedFiles = files.slice(0, remainingSlots)

  for (const file of selectedFiles) {
    if (!file.type.startsWith('image/')) {
      error.value = '请选择图片文件'
      continue
    }
    if (file.size > MAX_FILE_SIZE) {
      error.value = '单张图片不能超过 10MB'
      continue
    }
    try {
      const base64 = await resizeImage(file)
      images.value.push(base64)
      error.value = ''
    } catch {
      error.value = '图片处理失败，请重试'
    }
  }
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

function validateForm(): boolean {
  error.value = ''
  if (images.value.length === 0) {
    error.value = '请至少上传一张照片'
    return false
  }
  if (!description.value.trim()) {
    error.value = '请填写问题描述'
    return false
  }
  if (!validatePhone(reporterPhone.value)) {
    error.value = '请输入有效的手机号'
    return false
  }
  return true
}

async function submitReport() {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const uploadedUrls: string[] = []
    for (const base64 of images.value) {
      const url = await uploadImage(base64)
      uploadedUrls.push(url)
    }

    const result = await createOrder({
      communityId: community.id,
      reporterPhone: reporterPhone.value,
      contactName: contactName.value,
      building: building.value,
      unit: unit.value,
      location: locationDetail.value,
      preferredTime: preferredTime.value,
      isUrgent: isUrgent.value,
      images: uploadedUrls,
      description: description.value,
    })

    localStorage.setItem(PHONE_STORAGE_KEY, reporterPhone.value)

    router.push({
      path: `/track/${result.orderId}`,
      query: { from: 'report' },
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败，请重试'
    showToast(error.value, 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="pt-6">
    <section class="rounded-3xl bg-white p-5 shadow-card">
      <h2 class="text-lg font-bold text-gray-900">
        拍照报修
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        上传问题照片并填写描述，AI 将自动分类定级。
      </p>

      <div class="mt-5">
        <label class="block text-sm font-medium text-gray-700">照片上传</label>
        <p class="text-xs text-gray-400">
          最多 {{ MAX_IMAGES }} 张，单张不超过 10MB
        </p>

        <div class="mt-3 grid grid-cols-4 gap-3">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="relative aspect-square overflow-hidden rounded-2xl"
          >
            <img
              :src="image"
              alt=""
              class="h-full w-full object-cover"
            >
            <button
              type="button"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
              @click="removeImage(index)"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>

          <label
            v-if="images.length < MAX_IMAGES"
            class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Camera class="h-6 w-6 text-gray-400" />
            <span class="mt-1 text-xs text-gray-400">添加</span>
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleImageChange"
            >
          </label>
        </div>
      </div>

      <div class="mt-5">
        <label class="block text-sm font-medium text-gray-700">问题描述</label>
        <textarea
          v-model="description"
          rows="4"
          placeholder="请描述具体问题，例如：小区东门路灯不亮，影响夜间出行安全。"
          class="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
        />
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">联系人</label>
          <div class="relative mt-2">
            <User class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="contactName"
              type="text"
              placeholder="您的姓名"
              class="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">联系电话</label>
          <input
            v-model="reporterPhone"
            type="tel"
            maxlength="11"
            placeholder="手机号"
            class="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          >
        </div>
      </div>

      <div class="mt-5">
        <label class="block text-sm font-medium text-gray-700">报修位置</label>
        <div class="mt-2 grid grid-cols-3 gap-3">
          <div class="relative">
            <Building2 class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="building"
              type="text"
              placeholder="楼栋"
              class="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
            >
          </div>
          <input
            v-model="unit"
            type="text"
            placeholder="单元"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          >
          <div class="relative">
            <MapPin class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="locationDetail"
              type="text"
              placeholder="具体位置"
              class="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
            >
          </div>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">期望上门时间</label>
          <div class="relative mt-2">
            <Clock class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="preferredTime"
              type="datetime-local"
              class="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">是否紧急</label>
          <button
            type="button"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium transition-colors"
            :class="isUrgent ? 'border-danger bg-danger/5 text-danger' : 'border-gray-200 bg-gray-50 text-gray-600'"
            @click="isUrgent = !isUrgent"
          >
            <AlertTriangle class="h-4 w-4" />
            {{ isUrgent ? '紧急，优先处理' : '非紧急' }}
          </button>
        </div>
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger"
      >
        {{ error }}
      </div>

      <button
        type="button"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-semibold text-white shadow-md transition-transform active:scale-95 disabled:opacity-60"
        :disabled="isSubmitting"
        @click="submitReport"
      >
        <Loader2
          v-if="isSubmitting"
          class="h-5 w-5 animate-spin"
        />
        <Camera
          v-else
          class="h-5 w-5"
        />
        {{ isSubmitting ? '提交中...' : '提交报修' }}
      </button>
    </section>
  </div>
</template>
