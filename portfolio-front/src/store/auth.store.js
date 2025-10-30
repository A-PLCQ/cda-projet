import { create } from 'zustand';
import { authStorage } from '../services/storage';
import { loginApi, logoutApi, meApi, refreshApi } from '../features/auth/api';
import { setAuthRuntime } from '../services/http';

export const useAuth = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  userId: null,
  jti: null,
  loading: false,
  error: null,

  isAuthenticated: () => !!get().accessToken,

  // Recharge depuis localStorage puis tente /users/me
  bootstrap: async () => {
    const persisted = authStorage.get();
    if (!persisted) return;

    const { accessToken, refreshToken, userId, jti, user } = persisted;
    set({ accessToken, refreshToken, userId, jti, user });
    setAuthRuntime({ accessToken, refreshToken, userId, jti });

    if (!user) {
      try {
        const me = await meApi();    
        set({ user: me, error: null });
      } catch {
        // access expiré: tente un refresh si on a refreshToken
        if (refreshToken && userId) {
          try {
            const { accessToken: newToken, jti: newJti } = await refreshApi({ id_utilisateur: userId, refresh_token: refreshToken });
            set({ accessToken: newToken, jti: newJti || jti });
            setAuthRuntime({ accessToken: newToken, refreshToken, userId, jti: newJti || jti });
            const me = await meApi();
            set({ user: me, error: null });
          } catch {
            authStorage.clear();
            set({ user: null, accessToken: null, refreshToken: null, userId: null, jti: null });
          }
        }
      }
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const { user, accessToken, refreshToken, jti, userId } = await loginApi({ email, password });
      const toPersist = { user, accessToken, refreshToken, jti, userId };
      authStorage.set(toPersist);
      set({ ...toPersist, loading: false });
      return { user };
    } catch (e) {
      set({ error: e?.response?.data?.message || 'Échec de connexion', loading: false });
      throw e;
    }
  },

  logout: async () => {
    const { jti } = get();
    try { await logoutApi({ jti }); } catch {}
    authStorage.clear();
    setAuthRuntime({ accessToken: null, refreshToken: null, userId: null, jti: null });
    set({ user: null, accessToken: null, refreshToken: null, userId: null, jti: null });
  },
}));
