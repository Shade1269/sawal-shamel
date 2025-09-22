import test from 'node:test';
import assert from 'node:assert/strict';
import { getHomeRouteForRoleRuntime as getHomeRouteForRole } from '../src/hooks/getHomeRouteForRoleRuntime.js';

test('getHomeRouteForRole returns admin dashboard for admin role', () => {
  assert.equal(getHomeRouteForRole('admin'), '/admin/dashboard');
});

test('getHomeRouteForRole returns merchant area for merchant role', () => {
  assert.equal(getHomeRouteForRole('merchant'), '/merchant');
});

test('getHomeRouteForRole defaults affiliates to affiliate route', () => {
  assert.equal(getHomeRouteForRole('affiliate'), '/affiliate');
});

test('getHomeRouteForRole falls back to dashboard when role missing', () => {
  assert.equal(getHomeRouteForRole(undefined), '/dashboard');
});
