import { request } from './request'

export interface TrendItem {
  date: string
  count: number
}

export interface CategoryItem {
  category: string
  count: number
}

export interface RatingItem {
  rating: number
  count: number
}

export async function fetchTrend(days = 7): Promise<TrendItem[]> {
  return request<TrendItem[]>(`/api/admin/reports/trend?days=${days}`)
}

export async function fetchCategory(): Promise<CategoryItem[]> {
  return request<CategoryItem[]>('/api/admin/reports/category')
}

export async function fetchRating(): Promise<RatingItem[]> {
  return request<RatingItem[]>('/api/admin/reports/rating')
}
