import { request } from './request'

export interface TimelineEvent {
  id: string
  status: string
  remark: string | null
  operatorName: string | null
  createdAt: string
}

export interface Attachment {
  id: string
  url: string
  thumbnailUrl: string | null
  type: string
}

export interface Review {
  id: string
  rating: number
  content: string | null
}

export interface RepairOrder {
  id: string
  communityId: string
  community: { id: string; name: string } | null
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
  handlerId: string | null
  handler: { id: string; name: string; phone: string | null } | null
  deadline: string | null
  createdAt: string
  updatedAt: string
  timeline: TimelineEvent[]
  attachments: Attachment[]
  review: Review | null
}

export interface RepairOrderListResponse {
  list: RepairOrder[]
  total: number
  page: number
  pageSize: number
}

export interface ListParams {
  phone?: string
  status?: string
  communityId?: string
  severity?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export async function listOrders(params: ListParams = {}): Promise<RepairOrderListResponse> {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value))
    }
  })
  return request<RepairOrderListResponse>(`/api/repair-orders?${query.toString()}`)
}

export async function getOrder(id: string): Promise<RepairOrder> {
  return request<RepairOrder>(`/api/repair-orders/${id}`)
}

export async function assignOrder(
  id: string,
  handlerId: string,
  operatorName?: string,
): Promise<void> {
  await request<unknown>(`/api/repair-orders/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ handlerId, operatorName }),
  })
}

export async function updateOrderStatus(
  id: string,
  status: string,
  remark?: string,
): Promise<void> {
  await request<unknown>(`/api/repair-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, remark }),
  })
}
