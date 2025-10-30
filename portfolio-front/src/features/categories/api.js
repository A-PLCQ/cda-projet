import http from '../../services/http';

export async function getCategories() {
  const { data } = await http.get('/categories');
  return data?.data || [];
}
export async function createCategory(payload) {
  const { data } = await http.post('/categories', payload);
  return data?.data || null;
}
export async function updateCategory(id, payload) {
  const { data } = await http.patch(`/categories/${id}`, payload);
  return data?.data || null;
}
export async function deleteCategory(id) {
  const { data } = await http.delete(`/categories/${id}`);
  return data?.data || true;
}
