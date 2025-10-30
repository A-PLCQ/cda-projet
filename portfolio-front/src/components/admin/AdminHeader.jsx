import { Link, NavLink, useNavigate } from "react-router-dom";
import { ENV } from "../../config/env";
import { useAuth } from "../../store/auth.store";
import { useTheme } from "../../hooks/useTheme";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate(`/${ENV.adminSlug}/login`);
  };

  const navClass = ({ isActive }) => `nav-item ${isActive ? "active" : ""}`;

  return (
    <header className="admin-header">
      <style>{`
        .admin-header{
          width:100%;
          position:sticky; top:0; z-index:40;
          backdrop-filter:blur(12px);
          background:rgba(0,0,0,0.35);
          border-bottom:1px solid var(--color-border);
        }
        .admin-bar{
          max-width:1200px; margin-inline:auto;
          padding:var(--space-3) var(--space-4);
          display:flex; align-items:center; justify-content:space-between;
          gap:var(--space-6);
        }
        .brand{ font-weight:600; font-size:1.1rem; letter-spacing:.03em; color:var(--color-text) }
        nav{ display:flex; align-items:center; gap:var(--space-2) }
        .nav-item{
          padding:.45rem .85rem; border-radius:var(--radius);
          font-size:var(--step--1); color:var(--color-text);
          opacity:.85; transition:all var(--duration) var(--ease);
        }
        .nav-item:hover{ opacity:1; background:var(--color-surface) }
        .nav-item.active{ background:var(--color-primary); color:#fff; opacity:1 }

        .user-bar{ display:flex; align-items:center; gap:var(--space-3); font-size:var(--step--1) }

        .logout-btn, .theme-btn{
          border:1px solid var(--color-border); border-radius:var(--radius);
          padding:.4rem .9rem; background:transparent;
          transition:all var(--duration) var(--ease);
        }
        .logout-btn:hover{
          background:var(--color-primary); color:#fff; border-color:var(--color-primary);
        }

        /* Theme toggle look */
        .theme-btn{ display:inline-flex; align-items:center; gap:.5rem; }
        .theme-dot{
          width:10px; height:10px; border-radius:999px;
          background: currentColor; display:inline-block;
        }
      `}</style>

      <div className="admin-bar">
        <Link to={`/${ENV.adminSlug}/dashboard`} className="brand">
          Backoffice A-PLCQ
        </Link>

        <nav>
          <NavLink to={`/${ENV.adminSlug}/dashboard`} className={navClass}>Tableau de bord</NavLink>
          <NavLink to={`/${ENV.adminSlug}/projets`} className={navClass}>Projets</NavLink>
          <NavLink to={`/${ENV.adminSlug}/categories`} className={navClass}>Catégories</NavLink>
          <NavLink to={`/${ENV.adminSlug}/medias`} className={navClass}>Médias</NavLink>
        </nav>

        <div className="user-bar">
          <button
            type="button"
            onClick={toggle}
            className="theme-btn"
            aria-label={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
            title={theme === "light" ? "Mode sombre" : "Mode clair"}
          >
            {theme === "light" ? "🌞 Light" : "🌙 Dark"} <span className="theme-dot" />
          </button>

          {user && <span className="muted hidden sm:block">{user.email} ({user.role})</span>}

          <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
        </div>
      </div>
    </header>
  );
}
