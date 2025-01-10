const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = `${HOST}/auth`;

export const GOOGLE_AUTH_URL = `${AUTH_ROUTES}/login/federated/google`;
