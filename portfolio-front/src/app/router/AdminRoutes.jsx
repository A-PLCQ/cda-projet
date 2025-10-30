import { Route, Navigate } from "react-router-dom";
import { ENV } from "../../config/env";
import AdminLayout from "../../layouts/AdminLayout";

// Auth
import Login from "../../pages/admin/Auth/Login";
import Dashboard from "../../pages/admin/Dashboard";

// Projets
import ProjectsList from "../../pages/admin/Projects/ProjectsList";
import ProjectForm from "../../pages/admin/Projects/ProjectForm";
import ProjectMedia from "../../pages/admin/Projects/ProjectMedia";
import ProjectLinks from "../../pages/admin/Projects/ProjectLinks";

// Catégories
import CategoriesList from "../../pages/admin/Categories/CategoriesList";

// Nouvelles pages
import MediasIndex from "../../pages/admin/Medias/MediasIndex";
import UsersList from "../../pages/admin/Users/UsersList";
import SettingsIndex from "../../pages/admin/Settings/SettingsIndex";

// Guards
import AuthGuard from "../router/guards/AuthGuard";
import RoleGuard from "../router/guards/RoleGuard";

const base = `/${ENV.adminSlug}`;

/* ⚠️ On exporte un FRAGMENT, pas un composant */
export const AdminRoutes = (
  <>
    {/* Login public */}
    <Route path={`${base}/login`} element={<Login />} />

    {/* Routes protégées */}
    <Route
      path={base}
      element={
        <AuthGuard>
          <RoleGuard allow={["admin", "editor"]}>
            <AdminLayout />
          </RoleGuard>
        </AuthGuard>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />

      {/* Projets */}
      <Route path="projets" element={<ProjectsList />} />
      <Route path="projets/new" element={<ProjectForm />} />
      <Route path="projets/:id/edit" element={<ProjectForm />} />
      <Route path="projets/:id/media" element={<ProjectMedia />} />
      <Route path="projets/:id/links" element={<ProjectLinks />} />

      {/* Catégories */}
      <Route path="categories" element={<CategoriesList />} />

      {/* Nouvelles sections Admin */}
      <Route path="medias" element={<MediasIndex />} />
      <Route path="utilisateurs" element={<UsersList />} />
      <Route path="parametres" element={<SettingsIndex />} />

      {/* Catch-all admin */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  </>
);
