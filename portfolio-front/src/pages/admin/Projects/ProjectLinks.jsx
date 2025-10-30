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
    <section className="section s-admin-links">
      <style>{`
        /* Header */
        .head{display:flex; flex-direction:column; gap:.5rem}

        /* Card générique */
        .card-elev{
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          box-shadow:var(--shadow-1);
        }

        /* Formulaire d'ajout */
        .form-card{ margin-top:var(--space-6); padding:var(--space-6) }
        .form{display:flex; flex-direction:column; gap:var(--space-4)}
        .row{display:flex; gap:var(--space-4); align-items:flex-start; flex-wrap:wrap}
        .field{display:flex; flex-direction:column; gap:.35rem}
        .grow{flex:1 1 260px; min-width:240px}
        .fixed{flex:0 0 220px}
        .form-error{
          color:#ef4444; background:rgba(239,68,68,.08);
          border:1px solid rgba(239,68,68,.25);
          border-radius:var(--radius); padding:var(--space-3);
        }

        /* Liste des liens */
        .list-card{ margin-top:var(--space-6); padding:var(--space-6) }
        .list-head{display:flex; align-items:center; justify-content:space-between}
        .list{display:flex; flex-direction:column; gap:var(--space-3); margin-top:var(--space-3)}
        .item{
          display:flex; align-items:center; justify-content:space-between;
          gap:var(--space-4);
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          padding:var(--space-4);
          transition:transform 200ms var(--ease), border-color 200ms var(--ease), box-shadow 200ms var(--ease);
        }
        .item:hover{ transform:translateY(-4px); border-color:var(--color-primary); box-shadow:0 6px 18px rgba(152,109,255,.18) }
        .item-meta{ color:var(--color-muted); margin-top:4px; font-size:var(--step--1) }
        .actions{ display:flex; gap:var(--space-3); flex-wrap:wrap }

        /* Badges type */
        .badge{display:inline-flex; align-items:center; border:1px solid var(--color-border); border-radius:999px; padding:.25rem .6rem}
        .badge.primary{ border-color:var(--color-primary); color:var(--color-primary) }

        /* Container max */
        .narrow{ max-width:920px }
      `}</style>

      <div className="container narrow">
        <header className="head">
          <h1>Liens du projet <span className="primary">.</span></h1>
          <p className="muted">{project?.titre ? project.titre : "— Chargement du projet —"}</p>
        </header>

        {/* Formulaire ajout */}
        <form onSubmit={onAdd} className="card-elev form-card form">
          <div className="row">
            <div className="field grow">
              <label htmlFor="libelle">Libellé</label>
              <input id="libelle" name="libelle" className="input" placeholder="Ex : GitHub, Démo, Documentation…" />
            </div>

            <div className="field grow">
              <label htmlFor="url">URL</label>
              <input id="url" name="url" className="input" placeholder="https://…" />
            </div>

            <div className="field fixed">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" className="input" defaultValue="github">
                <option value="github">GitHub</option>
                <option value="demo">Démo</option>
                <option value="doc">Doc</option>
                <option value="link">Lien</option>
              </select>
            </div>
          </div>

          {formError && <div className="form-error">{formError}</div>}

          <div className="row" style={{ justifyContent:"flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Ajout…" : "Ajouter le lien"}
            </button>
          </div>
        </form>

        {/* Liste */}
        <section className="card-elev list-card">
          <div className="list-head">
            <h3>Liens existants</h3>
            {(isLoading || isFetching) && <span className="muted">Chargement…</span>}
          </div>

          {error && (
            <div style={{ color: "#ef4444", marginTop: "var(--space-3)" }}>
              Impossible de charger les liens.
            </div>
          )}

          {!isLoading && links.length === 0 && (
            <p className="muted" style={{ marginTop: "var(--space-3)" }}>Aucun lien pour ce projet.</p>
          )}

          <div className="list">
            {links.map((l) => {
              const type = (l.type || "").toLowerCase();
              const typeIsPrimary = ["github", "demo", "doc"].includes(type);
              return (
                <article key={l.id_lien} className="item">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"var(--space-3)", flexWrap:"wrap" }}>
                      <strong>{l.libelle}</strong>
                      <span className={`badge ${typeIsPrimary ? "primary" : ""}`} title={`Type : ${l.type || "lien"}`}>
                        {l.type || "lien"}
                      </span>
                    </div>
                    <div className="item-meta">{l.url}</div>
                  </div>

                  <div className="actions">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" title="Ouvrir">
                      Ouvrir
                    </a>
                    <button
                      className="btn btn-ghost"
                      title="Copier l’URL"
                      onClick={async () => {
                        try { await navigator.clipboard.writeText(l.url); } catch { alert("Impossible de copier l’URL."); }
                      }}
                    >
                      Copier
                    </button>
                    <button className="btn" onClick={() => onDelete(l.id_lien)} title="Supprimer">
                      Supprimer
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
