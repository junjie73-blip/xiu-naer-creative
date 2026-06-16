import { ref, onMounted } from 'vue'
import { getMyOrders, type RepairOrder } from '@/utils/api'

const PHONE_STORAGE_KEY = 'xiu_naer_reporter_phone'

export function useRecentOrders() {
  const orders = ref<RepairOrder[]>([])
  const isLoading = ref(false)

  async function load() {
    const phone = localStorage.getItem(PHONE_STORAGE_KEY)
    if (!phone) return

    isLoading.value = true
    try {
      orders.value = await getMyOrders(phone)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(load)

  return { orders, isLoading, refresh: load }
}
