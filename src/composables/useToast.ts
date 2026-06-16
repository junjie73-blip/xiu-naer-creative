import { reactive } from 'vue'

type ToastType = 'info' | 'success' | 'error'

interface ToastState {
  visible: boolean
  message: string
  type: ToastType
}

const state = reactive<ToastState>({
  visible: false,
  message: '',
  type: 'info',
})

let timer: number | undefined

export function useToast() {
  return {
    state,
    show: showToast,
  }
}

export function showToast(message: string, type: ToastType = 'info', duration = 2500) {
  state.message = message
  state.type = type
  state.visible = true

  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    state.visible = false
  }, duration)
}
