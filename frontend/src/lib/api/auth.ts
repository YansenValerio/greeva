import { client } from './client';
import type { AuthApiResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import type { ApiItem } from '@/types/api';

export async function login(credentials: LoginCredentials): Promise<AuthApiResponse> {
  const { data } = await client.post<AuthApiResponse>('/auth/login', credentials);
  return data;
}

export async function register(payload: RegisterData): Promise<AuthApiResponse> {
  const { data } = await client.post<AuthApiResponse>('/auth/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<ApiItem<User>>('/auth/me');
  return data.data;
}
