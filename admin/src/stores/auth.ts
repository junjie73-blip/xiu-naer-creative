import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { login as loginApi } from '@/api/auth'
import type { User } from '@/api/auth'

export type { User }

const STORAGE_KEY = 'xiu_naer_admin_user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'))
  const router = useRouter()

  async function login(username: string, password: string) {
    const data = await loginApi(username, password)
    user.value = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function logout() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
    router.push({ name: 'login' })
  }

  return { user, login, logout }
})
