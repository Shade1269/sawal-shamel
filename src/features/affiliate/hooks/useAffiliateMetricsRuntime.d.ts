export function ensureDateRuntime(value: unknown): Date;

export function deriveSalesSnapshotsRuntime(
  orders: Array<{
    payment_status?: string | null;
    created_at?: string | null;
    total_sar?: number | null;
    items?: Array<{ quantity?: number | null }> | null;
  }>,
  referenceDate?: Date
): {
  today: { orders: number; items: number; revenue: number };
  week: { orders: number; items: number; revenue: number };
  month: { orders: number; items: number; revenue: number };
};

export function deriveTopProductSharesRuntime(
  orders: Array<{
    payment_status?: string | null;
    items?: Array<{
      product_id?: string | null;
      id?: string | null;
      product_title?: string | null;
      quantity?: number | null;
      total_price_sar?: number | null;
    }> | null;
  }>,
  options?: { limit?: number }
): Array<{
  productId: string;
  title: string;
  quantity: number;
  revenue: number;
}>;
