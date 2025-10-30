import { Link, NavLink } from "react-router-dom";
import { ENV } from "../config/env";
import { useTheme } from "../hooks/useTheme"; // <- nouveau hook partagé

export default function Header() {
  const { theme, toggle } = useTheme(); // "dark" | "light"

  const navLinkClass = ({ isActive }) => `link ${isActive ? "is-active" : ""}`;

  return (
    <header className="app-header">
      <style>{`
        .app-header{
          position:sticky; top:0; z-index:50;
          background:var(--color-bg);
          border-bottom:1px solid var(--color-border);
          backdrop-filter:saturate(1.1) blur(6px);
        }
        .app-header .inner{
          max-width:var(--container);
          margin-inline:auto;
          padding: var(--space-4);
          display:flex; align-items:center; justify-content:space-between;
          gap: var(--space-4);
        }

        /* Brand */
        .brand{
          display:flex; align-items:center; gap:.6rem;
          padding:.4rem .6rem; border-radius:var(--radius);
          font-weight:700; letter-spacing:.2px;
          background:transparent; border:1px solid transparent;
          transition: border-color var(--duration) var(--ease), transform var(--duration) var(--ease);
        }
        .brand:hover{ border-color:var(--color-border); transform:translateY(-1px) }

        /* Nav */
        .nav{ display:flex; align-items:center; gap:.25rem; flex-wrap:wrap }
        .link{
          display:inline-flex; align-items:center; gap:.4rem;
          padding:.55rem .8rem; border-radius:var(--radius);
          color:var(--color-text);
          border:1px solid transparent;
          transition: border-color var(--duration) var(--ease), background var(--duration) var(--ease), transform var(--duration) var(--ease);
        }
        .link:hover{ border-color:var(--color-border); background:var(--color-surface); transform:translateY(-1px) }
        .link.is-active{
          background:var(--color-surface);
          border-color:var(--color-primary);
        }

        /* Actions */
        .actions{ display:flex; align-items:center; gap:.25rem }
        .theme-toggle{
          display:inline-flex; align-items:center; justify-content:center;
          width:2.25rem; height:2.25rem;
          border-radius:999px; border:1px solid var(--color-border);
          background:var(--color-surface);
          cursor:pointer;
          transition: transform var(--duration) var(--ease), border-color var(--duration) var(--ease);
        }
        .theme-toggle:hover{ transform:translateY(-1px); border-color:var(--color-primary) }
        .theme-toggle:active{ transform:none }

        @media (max-width: 720px){
          .nav{ gap:.15rem }
          .link{ padding:.5rem .65rem }
          .brand{ padding:.3rem .5rem }
        }
      `}</style>

      <div className="inner">
        <Link to="/" className="brand">
          <img src="/assets/icons/logo-a-plcq.svg" alt="Logo A-PLCQ" width="32" height="32" />
        </Link>

        {/* Navigation */}
        <nav className="nav" aria-label="Navigation principale">
          <NavLink to="/" className={navLinkClass} end>Accueil</NavLink>
          <NavLink to="/projets" className={navLinkClass}>Projets</NavLink>
          <NavLink to="/health" className={navLinkClass}>Health</NavLink>
          <NavLink to={`/${ENV.adminSlug}/login`} className={navLinkClass}>Admin</NavLink>
        </nav>

        {/* Actions (toggle thème) */}
        <div className="actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === "light" ? "Basculer en mode sombre" : "Basculer en mode clair"}
            onClick={toggle}
            title={theme === "light" ? "Mode sombre" : "Mode clair"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
}
