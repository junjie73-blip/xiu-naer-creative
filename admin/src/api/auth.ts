import { request } from './request'

export interface User {
  id: string
  username: string
  name: string
  role: string
}

export async function login(username: string, password: string): Promise<User> {
  return request<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}
