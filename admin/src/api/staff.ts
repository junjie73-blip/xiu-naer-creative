import { request } from './request'

export interface Staff {
  id: string
  username: string
  name: string
  role: string
  phone: string | null
  status: string
}

export type StaffForm = Omit<Staff, 'id'> & { password: string }

export async function listStaff(): Promise<Staff[]> {
  return request<Staff[]>('/api/users?role=staff')
}

export async function createStaff(data: StaffForm): Promise<Staff> {
  return request<Staff>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateStaff(
  id: string,
  data: Partial<Omit<StaffForm, 'password'>> & { password?: string },
): Promise<Staff> {
  return request<Staff>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteStaff(id: string): Promise<void> {
  await request<unknown>(`/api/users/${id}`, {
    method: 'DELETE',
  })
}
