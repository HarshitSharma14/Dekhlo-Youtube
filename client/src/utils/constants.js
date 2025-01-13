export const server = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTE = `${server}/api/v1/auth`;

export const GOOGLE_LOGIN_URL = `${AUTH_ROUTE}/login/google`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
