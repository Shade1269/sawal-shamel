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
