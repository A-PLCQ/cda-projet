import { Link, NavLink } from "react-router-dom";
import { ENV } from "../config/env";

export default function Header() {
  const navLinkClass = ({ isActive }) => `link ${isActive ? "is-active" : ""}`;

  return (
    <header className="app-header">
      <div className="inner">
        {/* Logo / Titre */}
        <Link to="/" className="brand">
          {ENV.appName}
        </Link>

        {/* Navigation */}
        <nav className="nav">
          <NavLink to="/" className={navLinkClass} end>
            Accueil
          </NavLink>
          <NavLink to="/projets" className={navLinkClass}>
            Projets
          </NavLink>
          <NavLink to="/health" className={navLinkClass}>
            Health
          </NavLink>
          <NavLink to={`/${ENV.adminSlug}/login`} className={navLinkClass}>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
