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
    <div
      className="pager"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        marginTop: "var(--space-8)",
      }}
    >
      <button
        className="btn btn-ghost"
        disabled={!meta?.hasPrev}
        onClick={() => go(page - 1)}
        style={{ opacity: !meta?.hasPrev ? 0.5 : 1 }}
      >
        ← Précédent
      </button>
      <span className="muted" style={{ fontSize: "var(--step--1)" }}>
        Page {page} / {meta?.totalPages || 1} — {meta?.total || 0} projets
      </span>
      <button
        className="btn btn-ghost"
        disabled={!meta?.hasNext}
        onClick={() => go(page + 1)}
        style={{ opacity: !meta?.hasNext ? 0.5 : 1 }}
      >
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

  const { data, isLoading, error, refetch, isFetching } = useProjectsQuery({
    page,
    limit,
  });
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
    <section className="section">
      <div className="container" style={{ maxWidth: 1100 }}>
        <div className="field-row" style={{ justifyContent: "space-between" }}>
          <h1>
            Projets <span className="primary">— Admin</span>
          </h1>
          <button
            onClick={() => nav(`/${ENV.adminSlug}/projets/new`)}
            className="btn btn-primary"
          >
            + Nouveau projet
          </button>
        </div>

        {isLoading && <p className="muted mt-4">Chargement…</p>}
        {error && (
          <p style={{ color: "#ef4444", marginTop: "var(--space-4)" }}>
            Erreur : {String(error.message || "inconnue")}
          </p>
        )}

        {!isLoading && projets.length === 0 && (
          <p className="muted mt-6">Aucun projet trouvé.</p>
        )}

        <div className="grid mt-6" style={{ gap: "var(--space-4)" }}>
          {projets.map((p) => (
            <article
              key={p.id_projet}
              className="card surface card-hover"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-4)",
              }}
            >
              {/* Informations projet */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p.titre}</div>
                <div className="muted" style={{ fontSize: "var(--step--1)", marginTop: 2 }}>
                  {p.slug} • {p.statut}
                  {p.est_mis_en_avant && (
                    <span
                      className="badge primary"
                      style={{ marginLeft: "var(--space-2)" }}
                    >
                      En avant
                    </span>
                  )}
                </div>
              </div>

              {/* Boutons actions */}
              <div className="field-row" style={{ flexWrap: "wrap", gap: "var(--space-3)" }}>
                <Link
                  className="btn btn-ghost"
                  to={`/${ENV.adminSlug}/projets/${p.id_projet}/edit`}
                >
                  Éditer
                </Link>

                <Link
                  className="btn btn-ghost"
                  to={`/${ENV.adminSlug}/projets/${p.id_projet}/media`}
                >
                  Médias
                </Link>

                <Link
                  className="btn btn-ghost"
                  to={`/${ENV.adminSlug}/projets/${p.id_projet}/liens`}
                >
                  Liens
                </Link>

                <button
                  className="btn"
                  onClick={() => onDelete(p.id_projet, p.titre)}
                >
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
