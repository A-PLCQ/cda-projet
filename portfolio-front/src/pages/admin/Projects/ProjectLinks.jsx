import { useParams } from "react-router-dom";
import { useProjectQuery } from "../../../features/projects/hooks";
import {
  useProjectLinksQuery,
  useCreateProjectLink,
  useDeleteLink,
} from "../../../features/projects/hooks";
import { useState } from "react";

/** Validation URL simple (robuste et légère) */
function isValidUrl(s) {
  try {
    const u = new URL(s);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
}

export default function ProjectLinks() {
  const { id } = useParams(); // id_projet
  const { data: project } = useProjectQuery(id);
  const { data: links = [], isLoading, error, refetch, isFetching } = useProjectLinksQuery(id);
  const addLink = useCreateProjectLink();
  const delLink = useDeleteLink();

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    const libelle = e.currentTarget.libelle.value.trim();
    const url = e.currentTarget.url.value.trim();
    const type = e.currentTarget.type.value.trim() || "link";

    if (!libelle) return setFormError("Le libellé est requis.");
    if (!url) return setFormError("L’URL est requise.");
    if (!isValidUrl(url)) return setFormError("L’URL n’est pas valide.");

    try {
      setSubmitting(true);
      await addLink.mutateAsync({ id, payload: { libelle, url, type } });
      e.currentTarget.reset();
      await refetch();
    } catch {
      setFormError("Échec de l’ajout du lien.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (linkId) => {
    if (!confirm("Supprimer ce lien ?")) return;
    try {
      await delLink.mutateAsync(linkId);
      await refetch();
    } catch {
      alert("Échec de la suppression du lien.");
    }
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 920 }}>
        <header className="grid" style={{ gap: "var(--space-2)" }}>
          <h1>
            Liens du projet <span className="primary">.</span>
          </h1>
          <p className="muted">
            {project?.titre ? project.titre : "— Chargement du projet —"}
          </p>
        </header>

        {/* Formulaire ajout */}
        <form
          onSubmit={onAdd}
          className="card surface card-padding mt-6"
          style={{ display: "grid", gap: "var(--space-4)" }}
        >
          <div className="field-row">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="libelle">Libellé</label>
              <input
                id="libelle"
                name="libelle"
                className="input"
                placeholder="Ex : GitHub, Démo, Documentation…"
              />
            </div>

            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="url">URL</label>
              <input
                id="url"
                name="url"
                className="input"
                placeholder="https://…"
              />
            </div>

            <div className="field" style={{ width: 220 }}>
              <label htmlFor="type">Type</label>
              <select id="type" name="type" className="select" defaultValue="github">
                <option value="github">GitHub</option>
                <option value="demo">Démo</option>
                <option value="doc">Doc</option>
                <option value="link">Lien</option>
              </select>
            </div>
          </div>

          {formError && (
            <div
              style={{
                color: "#ef4444",
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.25)",
                borderRadius: "var(--radius)",
                padding: "var(--space-3)",
              }}
            >
              {formError}
            </div>
          )}

          <div className="field-row" style={{ justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Ajout…" : "Ajouter le lien"}
            </button>
          </div>
        </form>

        {/* Liste */}
        <section className="card surface card-padding mt-6">
          <div className="field-row" style={{ justifyContent: "space-between" }}>
            <h3>Liens existants</h3>
            {(isLoading || isFetching) && <span className="muted">Chargement…</span>}
          </div>

          {error && (
            <div style={{ color: "#ef4444", marginTop: "var(--space-3)" }}>
              Impossible de charger les liens.
            </div>
          )}

          {!isLoading && links.length === 0 && (
            <p className="muted mt-3">Aucun lien pour ce projet.</p>
          )}

          <div className="grid" style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
            {links.map((l) => (
              <article
                key={l.id_lien}
                className="card surface card-padding card-hover"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <strong>{l.libelle}</strong>
                    <span
                      className={`badge ${["github", "demo", "doc"].includes((l.type || "").toLowerCase()) ? "primary" : ""}`}
                      title={`Type : ${l.type || "lien"}`}
                    >
                      {l.type || "lien"}
                    </span>
                  </div>
                  <div className="muted" style={{ marginTop: 4, fontSize: "var(--step--1)" }}>
                    {l.url}
                  </div>
                </div>

                <div className="field-row">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    title="Ouvrir"
                  >
                    Ouvrir
                  </a>
                  <button
                    className="btn btn-ghost"
                    title="Copier l’URL"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(l.url);
                      } catch {
                        alert("Impossible de copier l’URL.");
                      }
                    }}
                  >
                    Copier
                  </button>
                  <button
                    className="btn"
                    onClick={() => onDelete(l.id_lien)}
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
