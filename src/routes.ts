export const Routes = {
  home: '/',
} as const;

export type RouteKey = keyof typeof Routes;
