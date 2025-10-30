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
    <div
      className="pager"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        justifyContent: "center",
        marginTop: "var(--space-8)",
      }}
    >
      <button
        disabled={!meta?.hasPrev}
        onClick={() => go(page - 1)}
        className="btn btn-ghost"
        style={{ opacity: !meta?.hasPrev ? 0.4 : 1 }}
      >
        ← Précédent
      </button>
      <span className="muted" style={{ fontSize: "var(--step--1)" }}>
        Page {page} / {meta?.totalPages || 1} — {meta?.total || 0} projets
      </span>
      <button
        disabled={!meta?.hasNext}
        onClick={() => go(page + 1)}
        className="btn btn-ghost"
        style={{ opacity: !meta?.hasNext ? 0.4 : 1 }}
      >
        Suivant →
      </button>
    </div>
  );
}

/* === Liste des projets === */
export default function Projects() {
  const [params] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 12);

  const { data, isLoading, error, isFetching } = useProjects({ page, limit });
  const items = data?.items || [];
  const meta = data?.meta;

  return (
    <section className="section s-projects">
      <div className="container">
        <h1 className="mb-4">Projets <span className="primary">.</span></h1>

        {isLoading && <div className="muted mt-4">Chargement…</div>}
        {error && (
          <div style={{ color: "#ef4444", marginTop: "var(--space-4)" }}>
            Erreur : {String(error.message || "inconnue")}
          </div>
        )}

        <div className="grid grid-3 mt-6">
          {items.map((p) => (
            <Link
              key={p.id_projet}
              to={`/projets/${p.slug}`}
              className="card surface card-padding card-hover"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h3 style={{ marginBottom: "var(--space-2)" }}>{p.titre}</h3>
              <p className="muted" style={{ fontSize: "var(--step--1)" }}>
                {p.extrait}
              </p>
              <p className="muted" style={{ marginTop: "var(--space-2)", fontSize: 12 }}>
                {p.client ? `Client : ${p.client} • ` : ""}
                Créé le {formatDate(p.date_creation)}
              </p>
              {p.est_mis_en_avant && (
                <div className="badge primary" style={{ marginTop: "var(--space-3)" }}>
                  Mis en avant
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <Pager meta={meta} />
        {isFetching && <div className="mt-4 muted">Rafraîchissement…</div>}
      </div>
    </section>
  );
}
