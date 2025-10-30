import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects, getProject, createProject, updateProject, deleteProject,
  getProjectCategories, setProjectCategories,
  getProjectMedia, uploadProjectMedia, deleteMedia,
  getProjectLinks, createProjectLink, deleteLink,
} from './api';

/* ---------- QUERIES (public/admin) ---------- */
export function useProjectsQuery(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
    keepPreviousData: true,
  });
}
export function useProjectQuery(idOrSlug) {
  return useQuery({
    queryKey: ['project', idOrSlug],
    queryFn: () => getProject(idOrSlug),
    enabled: !!idOrSlug,
  });
}

/* ✅ Alias pour compat avec tes pages publiques */
export const useProjects = useProjectsQuery;
export const useProject = useProjectQuery;

/* ---------- MUTATIONS (admin) ---------- */
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateProject(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

/* ---------- Catégories ---------- */
export function useProjectCategoriesQuery(id) {
  return useQuery({
    queryKey: ['project-cats', id],
    queryFn: () => getProjectCategories(id),
    enabled: !!id,
  });
}
export function useSetProjectCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, categories }) => setProjectCategories(id, categories),
    onSuccess: (_d, { id }) =>
      qc.invalidateQueries({ queryKey: ['project-cats', id] }),
  });
}

/* ---------- Médias ---------- */
export function useProjectMediaQuery(id) {
  return useQuery({
    queryKey: ['project-media', id],
    queryFn: () => getProjectMedia(id),
    enabled: !!id,
  });
}
export function useUploadProjectMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => uploadProjectMedia(id, form),
    onSuccess: (_d, { id }) =>
      qc.invalidateQueries({ queryKey: ['project-media', id] }),
  });
}
export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => qc.invalidateQueries({ queryKey: [/project-media/] }),
  });
}

/* ---------- Liens ---------- */
export function useProjectLinksQuery(id) {
  return useQuery({
    queryKey: ['project-links', id],
    queryFn: () => getProjectLinks(id),
    enabled: !!id,
  });
}
export function useCreateProjectLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => createProjectLink(id, payload),
    onSuccess: (_d, { id }) =>
      qc.invalidateQueries({ queryKey: ['project-links', id] }),
  });
}
export function useDeleteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: [/project-links/] }),
  });
}
