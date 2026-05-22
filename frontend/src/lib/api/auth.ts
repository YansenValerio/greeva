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

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await client.put<ApiItem<User>>('/auth/profile', payload);
  return data.data;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await client.post('/auth/change-password', payload);
}
