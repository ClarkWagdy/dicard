export const ROUTES = {
  login: "/login",
  adminDashboard: "/dashboard", // owner / admin
  userDashboard: "/ownerdashboard", // regular user
  card: (username: string) => `/card/${username}`,
} as const;
