import { client } from './client';
import type { ApiItem } from '@/types/api';
import type { Address, AddressPayload } from '@/types/address';

export async function getAddresses(): Promise<Address[]> {
  const { data } = await client.get<{ data: Address[] }>('/addresses');
  return data.data;
}

export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await client.post<ApiItem<Address>>('/addresses', payload);
  return data.data;
}

export async function updateAddress(
  id: number,
  payload: Partial<AddressPayload>,
): Promise<Address> {
  const { data } = await client.put<ApiItem<Address>>(`/addresses/${id}`, payload);
  return data.data;
}

export async function deleteAddress(id: number): Promise<void> {
  await client.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const { data } = await client.patch<ApiItem<Address>>(`/addresses/${id}/default`);
  return data.data;
}
