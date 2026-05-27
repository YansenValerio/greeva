import { client } from './client';

export interface StockAlertPayload {
  product_variant_id: number;
  phone: string;
  email?: string;
}

export async function subscribeStockAlert(payload: StockAlertPayload): Promise<void> {
  await client.post('/stock-alerts', payload);
}
