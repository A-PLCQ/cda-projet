import { Link, useSearchParams } from "react-router-dom";
import { useProjects } from "../../features/projects/hooks";
import { formatDate } from "../../utils/formatDate";

/* === Pagination réutilisable === */
function Pager({ meta }) {
  const [params, setParams] = useSearchParams();
  const page = Number(meta?.page || 1);
  const limit = Number(meta?.limit || 12);

  const go = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    next.set("limit", String(limit));
    setParams(next, { replace: true });
  };

  return (
    <div className="pager">
      <button
        disabled={!meta?.hasPrev}
        onClick={() => go(page - 1)}
        className="btn btn-ghost"
        aria-disabled={!meta?.hasPrev}
      >
        ← Précédent
      </button>

      <span className="muted page-info">
        Page {page} / {meta?.totalPages || 1} — {meta?.total || 0} projets
      </span>

      <button
        disabled={!meta?.hasNext}
        onClick={() => go(page + 1)}
        className="btn btn-ghost"
        aria-disabled={!meta?.hasNext}
      >
        Suivant →
      </button>
    </div>
  );
}

/* === Liste des projets (Flex-only + hover refondu) === */
export default function Projects() {
  const [params] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 12);

  const { data, isLoading, error, isFetching } = useProjects({ page, limit });
  const items = data?.items || [];
  const meta = data?.meta;

  return (
    <section className="section s-projects">
      <style>{`
        /* ---------- Layout général ---------- */
        .projects-header{display:flex; align-items:center; justify-content:space-between; gap:var(--space-4)}
        .projects-list{display:flex; flex-wrap:wrap; gap:var(--space-6); margin-top:var(--space-6)}

        /* ---------- Carte projet ---------- */
        .projects-list .card{
          flex:1 1 320px; min-width:280px; max-width:420px;
          display:flex; flex-direction:column; justify-content:space-between;
          text-decoration:none; color:inherit;
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          box-shadow:var(--shadow-1);
          transition: all 220ms var(--ease);
          padding:var(--space-5);
        }

        .projects-list .card:hover{
          border-color:var(--color-primary);
          transform:translateY(-6px);
          box-shadow:0 6px 20px rgba(152,109,255,.25);
          background:linear-gradient(180deg, rgba(152,109,255,.06), transparent 80%), var(--color-surface);
        }

        .projects-list .card h3{
          font-size:var(--step-2);
          margin-bottom:var(--space-2);
          line-height:1.25;
        }

        .projects-list .card p{
          line-height:1.55;
        }

        .projects-list .meta{
          font-size:var(--step--1);
          color:var(--color-muted);
          margin-top:var(--space-2);
        }

        .badge.primary{
          display:inline-flex; align-items:center;
          background:var(--color-primary);
          color:#fff;
          font-size:var(--step--1);
          border-radius:999px;
          padding:.35rem .75rem;
          margin-top:var(--space-3);
        }

        /* ---------- Pager ---------- */
        .pager{
          display:flex; align-items:center; justify-content:center;
          gap:var(--space-3); margin-top:var(--space-8);
        }
        .pager [aria-disabled="true"]{opacity:.45; pointer-events:none}
        .page-info{font-size:var(--step--1)}

        /* ---------- Responsive ---------- */
        @media (max-width:980px){ .projects-list .card{flex:1 1 45%} }
        @media (max-width:640px){ .projects-list .card{flex:1 1 100%} }
      `}</style>

      <div className="container">
        <div className="projects-header">
          <h1>Projets <span className="primary">.</span></h1>
        </div>

        {isLoading && <div className="muted mt-4">Chargement…</div>}
        {error && (
          <div style={{ color: "#ef4444", marginTop: "var(--space-4)" }}>
            Erreur : {String(error.message || "inconnue")}
          </div>
        )}

        <div className="projects-list">
          {items.map((p) => (
            <Link
              key={p.id_projet}
              to={`/projets/${p.slug}`}
              className="card"
            >
              <div>
                <h3>{p.titre}</h3>
                {p.extrait && (
                  <p className="muted" style={{ fontSize: "var(--step--1)" }}>
                    {p.extrait}
                  </p>
                )}
                <p className="meta">
                  {p.client ? `Client : ${p.client} • ` : ""}
                  Créé le {formatDate(p.date_creation)}
                </p>
              </div>

              {p.est_mis_en_avant && (
                <div className="badge primary">Mis en avant</div>
              )}
            </Link>
          ))}
        </div>

        {!isLoading && !error && items.length === 0 && (
          <p className="muted" style={{ marginTop: "var(--space-6)" }}>
            Aucun projet pour le moment.
          </p>
        )}

        <Pager meta={meta} />
        {isFetching && <div className="mt-4 muted">Rafraîchissement…</div>}
      </div>
    </section>
  );
}
