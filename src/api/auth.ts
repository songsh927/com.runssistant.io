import apiClient from './client'
import type { LoginRequest, SignupRequest, TokenResponse, User } from '@/types/auth'

export async function signup(body: SignupRequest): Promise<TokenResponse> {
  return apiClient.post('auth/signup', { json: body }).json<TokenResponse>()
}

export async function login(body: LoginRequest): Promise<TokenResponse> {
  return apiClient.post('auth/login', { json: body }).json<TokenResponse>()
}

export async function getMe(): Promise<User> {
  return apiClient.get('auth/me').json<User>()
}
