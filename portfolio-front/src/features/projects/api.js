import http from '../../services/http';

/** Liste paginée */
export async function getProjects({ page = 1, limit = 12 } = {}) {
  const { data } = await http.get('/projets', { params: { page, limit } });
  return {
    items: data?.data || [],
    meta: data?.meta || { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false },
  };
}

/** Détail par id ou slug */
export async function getProject(idOrSlug) {
  const { data } = await http.get(`/projets/${idOrSlug}`);
  return data?.data || null;
}

/** Projets mis en avant */
export async function getFeaturedProjects({ limit = 6 } = {}) {
  // 1) Si ton backend accepte ces filtres, on les passe :
  try {
    const { data } = await http.get('/projets', {
      params: { page: 1, limit, est_mis_en_avant: 1, statut: 'publie' },
    });
    if (Array.isArray(data?.data)) return data.data;
  } catch {
    // ignore -> fallback
  }
  // 2) Fallback : filtre côté client
  const { items } = await getProjects({ page: 1, limit: 50 });
  return items.filter(p => Number(p.est_mis_en_avant) === 1).slice(0, limit);
}

/** Catégories d’un projet */
export async function getProjectCategories(id) {
  const { data } = await http.get(`/projets/${id}/categories`);
  return data?.data || [];
}
export async function setProjectCategories(id, categories) {
  const { data } = await http.put(`/projets/${id}/categories`, { categories });
  return data?.data || [];
}

/** CRUD projets */
export async function createProject(payload) {
  const { data } = await http.post('/projets', payload);
  return data?.data || null;
}
export async function updateProject(id, payload) {
  const { data } = await http.patch(`/projets/${id}`, payload);
  return data?.data || null;
}
export async function deleteProject(id) {
  const { data } = await http.delete(`/projets/${id}`);
  return data?.data || true;
}

/** Médias */
export async function getProjectMedia(id) {
  const { data } = await http.get(`/media/projets/${id}`);
  return data?.data || [];
}
export async function uploadProjectMedia(id, { file, legende, type = 'image', position_ }) {
  const form = new FormData();
  if (file) form.append('file', file);
  if (legende) form.append('legende', legende);
  if (type) form.append('type', type);
  if (position_ != null) form.append('position_', String(position_));
  const { data } = await http.post(`/media/projets/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data || null;
}
export async function deleteMedia(idMedia) {
  const { data } = await http.delete(`/media/${idMedia}`);
  return data?.data || true;
}

/** Liens */
export async function getProjectLinks(id) {
  const { data } = await http.get(`/liens/projets/${id}`);
  return data?.data || [];
}
export async function createProjectLink(id, payload) {
  const { data } = await http.post(`/liens/projets/${id}`, payload);
  return data?.data || null;
}
export async function deleteLink(idLien) {
  const { data } = await http.delete(`/liens/${idLien}`);
  return data?.data || true;
}
