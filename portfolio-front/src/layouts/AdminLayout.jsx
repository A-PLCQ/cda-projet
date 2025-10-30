import { NavLink, Outlet } from "react-router-dom";
import { ENV } from "../config/env";

export default function AdminLayout() {
  const base = `/${ENV.adminSlug}`;
  const tab = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 border rounded ${isActive ? "bg-white/10" : ""}`
      }
      end
    >
      {label}
    </NavLink>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Backoffice</h1>
      <div className="flex gap-2 mb-6">
        {tab(`${base}/projets`, "Projets")}
        {tab(`${base}/categories`, "Catégories")}
      </div>
      <Outlet />
    </div>
  );
}
