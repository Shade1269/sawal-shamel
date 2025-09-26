export const ensureDateRuntime = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

const roundCurrencyRuntime = (value) => Math.round(value * 100) / 100;

export const deriveSalesSnapshotsRuntime = (orders, referenceDate = new Date()) => {
  const startOf = (date, unit) => {
    const clone = new Date(date.getTime());
    if (unit === 'day') {
      clone.setHours(0, 0, 0, 0);
    } else if (unit === 'week') {
      const day = clone.getDay();
      const diff = (day - 6 + 7) % 7;
      clone.setDate(clone.getDate() - diff);
      clone.setHours(0, 0, 0, 0);
    } else if (unit === 'month') {
      clone.setDate(1);
      clone.setHours(0, 0, 0, 0);
    }
    return clone;
  };

  const startToday = startOf(referenceDate, 'day');
  const startWeek = startOf(referenceDate, 'week');
  const startMonth = startOf(referenceDate, 'month');

  const compute = (from) => {
    return orders.reduce(
      (acc, order) => {
        if (order.payment_status !== 'PAID') {
          return acc;
        }

        const createdAt = ensureDateRuntime(order.created_at);
        if (createdAt < from) {
          return acc;
        }

        const itemCount = Array.isArray(order.items)
          ? order.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
          : 0;
        const revenue = Number(order.total_sar) || 0;

        return {
          orders: acc.orders + 1,
          items: acc.items + itemCount,
          revenue: roundCurrencyRuntime(acc.revenue + revenue),
        };
      },
      { orders: 0, items: 0, revenue: 0 }
    );
  };

  return {
    today: compute(startToday),
    week: compute(startWeek),
    month: compute(startMonth),
  };
};

export const deriveTopProductSharesRuntime = (orders, options = {}) => {
  const limit = typeof options.limit === 'number' && options.limit > 0 ? options.limit : 3;

  const aggregate = new Map();

  orders.forEach((order) => {
    if (!Array.isArray(order.items)) return;
    if (order.payment_status && order.payment_status !== 'PAID') return;

    order.items.forEach((item) => {
      if (!item) return;
      const productId = item.product_id || item.id;
      const title = item.product_title || 'منتج غير مسمى';

      if (!productId) return;

      const quantity = Number(item.quantity) || 0;
      const revenue = Number(item.total_price_sar) || 0;

      const current = aggregate.get(productId) ?? { productId, title, quantity: 0, revenue: 0 };

      current.quantity += quantity;
      current.revenue = roundCurrencyRuntime(current.revenue + revenue);

      aggregate.set(productId, current);
    });
  });

  return Array.from(aggregate.values())
    .filter((entry) => entry.quantity > 0 && entry.revenue > 0)
    .sort((a, b) => (b.revenue !== a.revenue ? b.revenue - a.revenue : b.quantity - a.quantity))
    .slice(0, limit);
};
