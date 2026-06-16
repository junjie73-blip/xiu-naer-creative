import { request } from './request'

export interface DashboardData {
  todayCount: number
  pendingCount: number
  completedCount: number
  totalCount: number
  avgRating: number
  staffCount: number
}

export async function fetchDashboard(): Promise<DashboardData> {
  return request<DashboardData>('/api/admin/dashboard')
}
