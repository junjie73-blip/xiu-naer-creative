const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = (await response.json()) as ApiResponse<T>
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败')
  }

  return result.data
}
