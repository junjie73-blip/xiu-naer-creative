import { request } from './request'

export interface Community {
  id: string
  name: string
  region: string | null
  address: string | null
  contactName: string | null
  contactPhone: string | null
  qrCode: string | null
}

export type CommunityForm = Omit<Community, 'id'>

export async function listCommunities(): Promise<Community[]> {
  return request<Community[]>('/api/communities')
}

export async function createCommunity(data: CommunityForm): Promise<Community> {
  return request<Community>('/api/communities', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCommunity(
  id: string,
  data: Partial<CommunityForm>,
): Promise<Community> {
  return request<Community>(`/api/communities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteCommunity(id: string): Promise<void> {
  await request<unknown>(`/api/communities/${id}`, {
    method: 'DELETE',
  })
}
