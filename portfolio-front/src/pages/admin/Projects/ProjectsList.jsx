import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useProjectsQuery, useDeleteProject } from "../../../features/projects/hooks";
import { ENV } from "../../../config/env";

/* === Pagination (Pager) === */
function Pager({ meta }) {
  const [params, setParams] = useSearchParams();
  const page = Number(meta?.page || 1);
  const limit = Number(meta?.limit || 20);

  const go = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    next.set("limit", String(limit));
    setParams(next, { replace: true });
  };

  return (
    <div className="pager">
      <button className="btn btn-ghost" disabled={!meta?.hasPrev} onClick={() => go(page - 1)}>
        ← Précédent
      </button>
      <span className="muted page-info">
        Page {page} / {meta?.totalPages || 1} — {meta?.total || 0} projets
      </span>
      <button className="btn btn-ghost" disabled={!meta?.hasNext} onClick={() => go(page + 1)}>
        Suivant →
      </button>
    </div>
  );
}

/* === Liste des projets (page principale) === */
export default function ProjectsList() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 20);

  const { data, isLoading, error, refetch, isFetching } = useProjectsQuery({ page, limit });
  const del = useDeleteProject();

  const onDelete = async (id, titre) => {
    if (!confirm(`Supprimer le projet "${titre}" ?`)) return;
    try {
      await del.mutateAsync(id);
      await refetch();
    } catch {
      alert("Suppression impossible");
    }
  };

  const projets = data?.items || [];
  const meta = data?.meta;

  return (
    <section className="section s-admin-projects">
      <style>{`
        .head{display:flex; align-items:center; justify-content:space-between; gap:var(--space-4)}
        .list{display:flex; flex-direction:column; gap:var(--space-4); margin-top:var(--space-6)}
        .item{
          display:flex; align-items:center; justify-content:space-between; gap:var(--space-4);
          border:1px solid var(--color-border); background:var(--color-surface);
          border-radius:var(--radius-lg); padding:var(--space-4);
          transition:transform 200ms var(--ease), border-color 200ms var(--ease), box-shadow 200ms var(--ease);
        }
        .item:hover{ transform:translateY(-4px); border-color:var(--color-primary); box-shadow:0 6px 18px rgba(152,109,255,.18) }
        .item .meta{ font-size:var(--step--1); color:var(--color-muted); margin-top:2px }
        .actions{ display:flex; gap:var(--space-3); flex-wrap:wrap }
        .badge.primary{ border:1px solid var(--color-primary); color:var(--color-primary); border-radius:999px; padding:.1rem .5rem; margin-left:var(--space-2) }

        .pager{ display:flex; align-items:center; justify-content:center; gap:var(--space-4); margin-top:var(--space-8) }
        .page-info{ font-size:var(--step--1) }

        /* container width */
        .narrow{ max-width:1100px }
      `}</style>

      <div className="container narrow">
        <div className="head">
          <h1>Projets <span className="primary">— Admin</span></h1>
          <button onClick={() => nav(`/${ENV.adminSlug}/projets/new`)} className="btn btn-primary">
            + Nouveau projet
          </button>
        </div>

        {isLoading && <p className="muted mt-4">Chargement…</p>}
        {error && (
          <p style={{ color: "#ef4444", marginTop: "var(--space-4)" }}>
            Erreur : {String(error.message || "inconnue")}
          </p>
        )}

        {!isLoading && projets.length === 0 && <p className="muted mt-6">Aucun projet trouvé.</p>}

        <div className="list">
          {projets.map((p) => (
            <article key={p.id_projet} className="item">
              {/* Informations projet */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.titre}
                </div>
                <div className="meta">
                  {p.slug} • {p.statut}
                  {p.est_mis_en_avant && <span className="badge primary">En avant</span>}
                </div>
              </div>

              {/* Boutons actions */}
              <div className="actions">
                <Link className="btn btn-ghost" to={`/${ENV.adminSlug}/projets/${p.id_projet}/edit`}>
                  Éditer
                </Link>
                <Link className="btn btn-ghost" to={`/${ENV.adminSlug}/projets/${p.id_projet}/media`}>
                  Médias
                </Link>
                <Link className="btn btn-ghost" to={`/${ENV.adminSlug}/projets/${p.id_projet}/links`}>
                  Liens
                </Link>
                <button className="btn" onClick={() => onDelete(p.id_projet, p.titre)}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>

        {meta && <Pager meta={meta} />}
        {isFetching && <div className="muted mt-4">Rafraîchissement…</div>}
      </div>
    </section>
  );
}
