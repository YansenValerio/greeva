import { client } from './client';

export interface ShippingRate {
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  etd: string;
  cost: number; // sen
}

export async function getShippingRates(
  destinationPostalCode: string,
): Promise<ShippingRate[]> {
  const { data } = await client.post<{ data: ShippingRate[] }>('/shipping/rates', {
    destination_postal_code: destinationPostalCode,
  });
  return data.data;
}
