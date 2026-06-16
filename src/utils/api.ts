const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface CreateOrderRequest {
  communityId: string
  reporterPhone: string
  contactName?: string
  building?: string
  unit?: string
  location?: string
  preferredTime?: string
  isUrgent?: boolean
  images: string[]
  description: string
  lat?: number
  lng?: number
}

export interface CreateOrderResponse {
  orderId: string
  category: string
  severity: string
  status: string
  createdAt: string
}

export interface Community {
  id: string
  name: string
  address: string | null
  contactName: string | null
  contactPhone: string | null
  createdAt: string
  updatedAt: string
}

export interface RepairOrder {
  id: string
  communityId: string
  community: Community | null
  reporterPhone: string
  contactName: string | null
  building: string | null
  unit: string | null
  location: string | null
  preferredTime: string | null
  isUrgent: boolean
  category: string
  severity: string
  status: string
  statusLabel: string
  description: string | null
  lat: number | null
  lng: number | null
  assignedTo: string | null
  handlerId: string | null
  handler: User | null
  deadline: string | null
  createdAt: string
  updatedAt: string
  timeline: TimelineEvent[]
  attachments: RepairAttachment[]
  review: Review | null
}

export interface User {
  id: string
  username: string
  role: string
  name: string
  phone: string | null
}

export interface TimelineEvent {
  id: string
  orderId: string
  status: string
  remark: string | null
  operatorId: string | null
  operatorName: string | null
  createdAt: string
}

export interface RepairAttachment {
  id: string
  orderId: string
  url: string
  thumbnailUrl: string | null
  type: 'reporter' | 'handler'
  createdAt: string
}

export interface Review {
  id: string
  orderId: string
  rating: number
  content: string | null
  createdAt: string
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
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

export async function uploadImage(base64Image: string): Promise<string> {
  const data = await request<{ url: string }>('/api/upload', {
    method: 'POST',
    body: JSON.stringify({ image: base64Image }),
  })
  return data.url
}

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>('/api/repair-orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getOrder(orderId: string): Promise<RepairOrder> {
  return request<RepairOrder>(`/api/repair-orders/${orderId}`)
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  remark?: string
): Promise<void> {
  await request<unknown>(`/api/repair-orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, remark }),
  })
}

export async function submitReview(orderId: string, rating: number, content?: string): Promise<void> {
  await request<unknown>(`/api/repair-orders/${orderId}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, content }),
  })
}

export interface RepairOrderListResponse {
  list: RepairOrder[]
  total: number
  page: number
  pageSize: number
}

export async function getMyOrders(phone: string, status?: string): Promise<RepairOrder[]> {
  const query = new URLSearchParams({ phone })
  if (status) {
    query.append('status', status)
  }
  const data = await request<RepairOrderListResponse>(`/api/repair-orders?${query.toString()}`)
  return data.list
}

export async function getMyOrdersPage(
  phone: string,
  page: number = 1,
  pageSize: number = 10,
  status?: string,
): Promise<RepairOrderListResponse> {
  const query = new URLSearchParams({
    phone,
    page: String(page),
    pageSize: String(pageSize),
  })
  if (status) {
    query.append('status', status)
  }
  return request<RepairOrderListResponse>(`/api/repair-orders?${query.toString()}`)
}
