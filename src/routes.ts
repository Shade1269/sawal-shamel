export const Routes = {
  home: '/',
  auth: '/auth',',,
  // add other routes as needed
} as const;
export type RouteKey = keyof typeof Routes;
