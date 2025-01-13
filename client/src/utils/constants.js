export const server = `${import.meta.env.VITE_SERVER_URL}/api/v1`;

export const AUTH_ROUTE = `${server}/auth`;
export const GOOGLE_LOGIN_URL = `${AUTH_ROUTE}/login/google`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;

export const CHANNEL_ROUTE = `${server}/channel`;
export const UPDATE_CHANNEL_INFO_ROUTE = `${CHANNEL_ROUTE}/update-profile`;
export const GET_CHANNEL_DETAILS = `${CHANNEL_ROUTE}/get-info`;
