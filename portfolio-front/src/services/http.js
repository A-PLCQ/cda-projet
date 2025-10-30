import axios from 'axios';
import { ENV } from '../config/env';

// === Instance Axios ===
const http = axios.create({
  baseURL: ENV.apiBaseUrl,
  withCredentials: false, // ton refresh se fait via body, pas via cookie
});

// === Tokens & infos utilisateur en mémoire ===
let _accessToken = null;
let _refreshToken = null;
let _userId = null;     // id_utilisateur
let _jti = null;        // pour logout / révocation

export const setAuthRuntime = ({ accessToken, refreshToken, userId, jti }) => {
  if (typeof accessToken !== 'undefined') _accessToken = accessToken;
  if (typeof refreshToken !== 'undefined') _refreshToken = refreshToken;
  if (typeof userId !== 'undefined') _userId = userId;
  if (typeof jti !== 'undefined') _jti = jti;
};
export const getAuthRuntime = () => ({
  accessToken: _accessToken,
  refreshToken: _refreshToken,
  userId: _userId,
  jti: _jti,
});
export const setAccessToken = (t) => { _accessToken = t || null; };

// === Interceptor: ajoute Authorization ===
http.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// === Interceptor: 401 -> tente refresh via body { id_utilisateur, refresh_token } ===
let isRefreshing = false;
let pending = [];

const flushQueue = (error, token = null) => {
  pending.forEach(({ resolve, reject }) => {
    if (error) return reject(error);
    resolve(token);
  });
  pending = [];
};

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    if (!error?.response) return Promise.reject(error);

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pending.push({
            resolve: (token) => {
              if (token) original.headers.Authorization = `Bearer ${token}`;
              resolve(http(original));
            },
            reject,
          });
        });
      }

      try {
        isRefreshing = true;

        // ---- refresh spécifique à TON API ----
        const body = {
          id_utilisateur: _userId,
          refresh_token: _refreshToken,
        };
        const { data } = await axios.post(`${ENV.apiBaseUrl}/auth/refresh`, body);

        // supporte payload éventuel : { data: { access_token, jti } } ou à plat
        const payload = data?.data || data || {};
        const newAccess = payload.access_token || payload.token || null;

        setAccessToken(newAccess);
        flushQueue(null, newAccess);

        if (newAccess) original.headers.Authorization = `Bearer ${newAccess}`;
        return http(original);
      } catch (e) {
        flushQueue(e, null);
        setAccessToken(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
