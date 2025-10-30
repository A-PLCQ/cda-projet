import http, { setAuthRuntime, setAccessToken } from '../../services/http';

export async function loginApi({ email, password }) {
  const { data } = await http.post('/auth/login', { email, password });

  // Ta réponse: { data: { user, access_token, refresh_token, jti } }
  const payload = data?.data || {};
  const user = payload.user || null;
  const accessToken = payload.access_token || null;
  const refreshToken = payload.refresh_token || null;
  const jti = payload.jti || null;
  const userId = user?.id_utilisateur || user?.id || null;

  // En mémoire pour l’interceptor
  setAuthRuntime({ accessToken, refreshToken, userId, jti });

  return { user, accessToken, refreshToken, jti, userId };
}

export async function refreshApi({ id_utilisateur, refresh_token }) {
  const { data } = await http.post('/auth/refresh', { id_utilisateur, refresh_token });
  const payload = data?.data || data || {};
  const accessToken = payload.access_token || payload.token || null;
  const jti = payload.jti || null;

  if (accessToken) setAccessToken(accessToken);
  return { accessToken, jti };
}

export async function logoutApi({ jti }) {
  // ta collection dit "Logout (révoque jti)"
  try {
    await http.post('/auth/logout', { jti });
  } finally {
    setAuthRuntime({ accessToken: null, refreshToken: null, userId: null, jti: null });
  }
}

export async function meApi() {
  const { data } = await http.get('/users/me');
  // ta réponse: { ok: true, user: {...} }
  return data?.user || null;
}
