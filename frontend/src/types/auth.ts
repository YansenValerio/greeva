export interface User {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'partner' | 'admin';
  role_label: string;
  phone: string | null;
  avatar: string | null;
  created_at: string;
}

export interface AuthApiResponse {
  data: User;
  token: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}
