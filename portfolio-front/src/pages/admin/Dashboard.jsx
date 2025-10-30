import { useAuth } from "../../store/auth.store";
import { ENV } from "../../config/env";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (!confirm("Se déconnecter du tableau de bord ?")) return;
    setLoading(true);
    try {
      await logout();
      nav(`/${ENV.adminSlug}/login`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        {/* === En-tête === */}
        <header className="grid" style={{ gap: "var(--space-2)", marginBottom: "var(--space-8)" }}>
          <h1>
            Tableau de bord <span className="primary">.</span>
          </h1>
          <p className="muted">
            Bienvenue <strong>{user?.email}</strong>{" "}
            <span
              className="badge primary"
              style={{ fontSize: "var(--step--1)", marginLeft: "var(--space-2)" }}
            >
              {user?.role || "admin"}
            </span>{" "}
            — interface d’administration du portfolio{" "}
            <strong>{ENV.appName}</strong>.
          </p>
        </header>

        {/* === Bloc d’accès rapide === */}
        <div
          className="grid"
          style={{
            gap: "var(--space-6)",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <Link
            to={`/${ENV.adminSlug}/projets`}
            className="card surface card-padding card-hover"
          >
            <h3>Projets</h3>
            <p className="muted mt-2">
              Ajouter, modifier ou supprimer les projets du portfolio.
            </p>
          </Link>

          <Link
            to={`/${ENV.adminSlug}/categories`}
            className="card surface card-padding card-hover"
          >
            <h3>Catégories</h3>
            <p className="muted mt-2">
              Gérer les catégories associées aux projets.
            </p>
          </Link>

          <Link
            to={`/${ENV.adminSlug}/medias`}
            className="card surface card-padding card-hover"
          >
            <h3>Médias</h3>
            <p className="muted mt-2">
              Voir et supprimer les images uploadées sur le serveur.
            </p>
          </Link>

          <Link
            to={`/${ENV.adminSlug}/utilisateurs`}
            className="card surface card-padding card-hover"
          >
            <h3>Utilisateurs</h3>
            <p className="muted mt-2">
              Liste des comptes ayant accès au back-office.
            </p>
          </Link>

          <Link
            to={`/${ENV.adminSlug}/parametres`}
            className="card surface card-padding card-hover"
          >
            <h3>Paramètres</h3>
            <p className="muted mt-2">
              Configurer le site, les métadonnées et les variables d’API.
            </p>
          </Link>

          <div className="card surface card-padding card-hover">
            <h3>Déconnexion</h3>
            <p className="muted mt-2">Terminer votre session administrateur.</p>
            <button
              onClick={onLogout}
              disabled={loading}
              className="btn btn-primary mt-4"
            >
              {loading ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </div>

        {/* === Bloc d’informations système === */}
        <div className="card surface card-padding mt-12">
          <h3>Informations système</h3>
          <ul className="mt-3 muted" style={{ lineHeight: 1.7 }}>
            <li>
              <strong>Application :</strong> {ENV.appName}
            </li>
            <li>
              <strong>API :</strong>{" "}
              <a
                href={ENV.apiBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                {ENV.apiBaseUrl}
              </a>
            </li>
            <li>
              <strong>Version :</strong> 1.0.0
            </li>
            <li>
              <strong>Environnement :</strong>{" "}
              {import.meta.env.MODE === "production"
                ? "Production"
                : "Développement"}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
