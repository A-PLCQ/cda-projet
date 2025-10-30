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
    <section className="section s-admin-dashboard">
      <style>{`
        /* ====== Header ====== */
        .dash-head{
          display:flex; flex-direction:column; gap:.5rem;
          margin-bottom:var(--space-8);
        }
        .dash-sub{ color:var(--color-muted) }

        .role-badge{
          display:inline-flex; align-items:center;
          border:1px solid var(--color-primary);
          color:var(--color-primary);
          border-radius:999px;
          padding:.15rem .5rem;
          font-size:var(--step--1);
          margin-left:var(--space-2);
        }

        /* ====== Quick actions ====== */
        .cards{
          display:flex; flex-wrap:wrap; gap:var(--space-6);
        }
        .card-link, .card-plain{
          flex:1 1 280px; max-width:420px; min-width:260px;
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          box-shadow:var(--shadow-1);
          padding:var(--space-6);
          text-decoration:none; color:inherit;
          transition:transform 220ms var(--ease), border-color 220ms var(--ease), box-shadow 220ms var(--ease);
        }
        .card-link:hover, .card-plain:hover{
          transform:translateY(-6px);
          border-color:var(--color-primary);
          box-shadow:0 6px 20px rgba(152,109,255,.25);
        }
        .card-title{ margin:0 }
        .card-desc{ color:var(--color-muted); margin-top:var(--space-2) }

        /* ====== System block ====== */
        .system{
          margin-top:var(--space-12);
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          padding:var(--space-6);
        }
        .system ul{ margin-top:var(--space-3); line-height:1.7 }
      `}</style>

      <div className="container">
        {/* === En-tête === */}
        <header className="dash-head">
          <h1>
            Tableau de bord <span className="primary">.</span>
          </h1>
          <p className="dash-sub">
            Bienvenue <strong>{user?.email}</strong>
            <span className="role-badge">{user?.role || "admin"}</span>
            {" — "}interface d’administration du portfolio <strong>{ENV.appName}</strong>.
          </p>
        </header>

        {/* === Accès rapides === */}
        <div className="cards">
          <Link to={`/${ENV.adminSlug}/projets`} className="card-link">
            <h3 className="card-title">Projets</h3>
            <p className="card-desc">Ajouter, modifier ou supprimer les projets du portfolio.</p>
          </Link>

          <Link to={`/${ENV.adminSlug}/categories`} className="card-link">
            <h3 className="card-title">Catégories</h3>
            <p className="card-desc">Gérer les catégories associées aux projets.</p>
          </Link>

          <Link to={`/${ENV.adminSlug}/medias`} className="card-link">
            <h3 className="card-title">Médias</h3>
            <p className="card-desc">Voir et supprimer les images uploadées sur le serveur.</p>
          </Link>

          <Link to={`/${ENV.adminSlug}/utilisateurs`} className="card-link">
            <h3 className="card-title">Utilisateurs</h3>
            <p className="card-desc">Liste des comptes ayant accès au back-office.</p>
          </Link>

          <Link to={`/${ENV.adminSlug}/parametres`} className="card-link">
            <h3 className="card-title">Paramètres</h3>
            <p className="card-desc">Configurer le site, les métadonnées et les variables d’API.</p>
          </Link>

          <div className="card-plain">
            <h3 className="card-title">Déconnexion</h3>
            <p className="card-desc">Terminer votre session administrateur.</p>
            <button onClick={onLogout} disabled={loading} className="btn btn-primary" style={{ marginTop: "var(--space-4)" }}>
              {loading ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </div>

        {/* === Informations système === */}
        <div className="system">
          <h3>Informations système</h3>
          <ul className="muted">
            <li><strong>Application :</strong> {ENV.appName}</li>
            <li>
              <strong>API :</strong>{" "}
              <a href={ENV.apiBaseUrl} target="_blank" rel="noopener noreferrer" className="link">
                {ENV.apiBaseUrl}
              </a>
            </li>
            <li><strong>Version :</strong> 1.0.0</li>
            <li>
              <strong>Environnement :</strong>{" "}
              {import.meta.env.MODE === "production" ? "Production" : "Développement"}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
