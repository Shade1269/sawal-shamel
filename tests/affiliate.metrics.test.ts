import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveSalesSnapshotsRuntime } from '../src/features/affiliate/hooks/useAffiliateMetricsRuntime.js';

test('deriveSalesSnapshotsRuntime aggregates paid orders into daily, weekly, and monthly buckets', () => {
  const now = new Date('2024-07-15T12:00:00Z');
  const orders = [
    {
      id: 'today-paid',
      created_at: '2024-07-15T08:30:00Z',
      total_sar: 150,
      payment_status: 'PAID',
      items: [
        { id: 'item-a', quantity: 1, total_price_sar: 75 },
        { id: 'item-b', quantity: 1, total_price_sar: 75 },
      ],
    },
    {
      id: 'two-days-ago',
      created_at: '2024-07-13T10:00:00Z',
      total_sar: 100,
      payment_status: 'PAID',
      items: [{ id: 'item-c', quantity: 1, total_price_sar: 100 }],
    },
    {
      id: 'eight-days-ago',
      created_at: '2024-07-07T09:00:00Z',
      total_sar: 80,
      payment_status: 'PAID',
      items: [{ id: 'item-d', quantity: 1, total_price_sar: 80 }],
    },
    {
      id: 'pending-order',
      created_at: '2024-07-15T09:00:00Z',
      total_sar: 45,
      payment_status: 'PENDING',
      items: [{ id: 'item-e', quantity: 2, total_price_sar: 45 }],
    },
    {
      id: 'previous-month',
      created_at: '2024-06-25T09:00:00Z',
      total_sar: 60,
      payment_status: 'PAID',
      items: [{ id: 'item-f', quantity: 1, total_price_sar: 60 }],
    },
  ];

  const snapshot = deriveSalesSnapshotsRuntime(orders, now);

  assert.equal(snapshot.today.orders, 1);
  assert.equal(snapshot.today.items, 2);
  assert.equal(snapshot.today.revenue, 150);

  assert.equal(snapshot.week.orders, 2);
  assert.equal(snapshot.week.items, 3);
  assert.equal(snapshot.week.revenue, 250);

  assert.equal(snapshot.month.orders, 3);
  assert.equal(snapshot.month.items, 4);
  assert.equal(snapshot.month.revenue, 330);
});

test('deriveSalesSnapshotsRuntime rounds revenue to two decimals', () => {
  const now = new Date('2024-07-15T12:00:00Z');
  const orders = [
    {
      id: 'rounded',
      created_at: '2024-07-15T08:00:00Z',
      total_sar: 12.3456,
      payment_status: 'PAID',
      items: [{ id: 'item-a', quantity: 1, total_price_sar: 12.3456 }],
    },
  ];

  const snapshot = deriveSalesSnapshotsRuntime(orders, now);
  assert.equal(snapshot.today.revenue, 12.35);
});
