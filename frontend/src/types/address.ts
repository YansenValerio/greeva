export interface Address {
  id: number;
  label: string | null;
  recipient_name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string | null;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface AddressPayload {
  label?: string | null;
  recipient_name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district?: string | null;
  postal_code: string;
  is_default?: boolean;
}
