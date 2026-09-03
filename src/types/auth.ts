export interface User {
  id: string
  name: string
  email: string
  location: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
  location?: string
}

export interface LoginRequest {
  email: string
  password: string
}
