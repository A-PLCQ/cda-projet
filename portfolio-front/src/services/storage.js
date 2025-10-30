const KEY = 'aplq_auth_v1';

export const authStorage = {
  get() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj || {})); } catch {}
  },
  clear() {
    try { localStorage.removeItem(KEY); } catch {}
  },
};
