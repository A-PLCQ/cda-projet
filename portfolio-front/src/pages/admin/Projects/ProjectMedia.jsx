import { useParams } from "react-router-dom";
import {
  useProjectQuery,
  useProjectMediaQuery,
  useUploadProjectMedia,
  useDeleteMedia,
} from "../../../features/projects/hooks";
import { buildUploadUrl } from "../../../utils/url";
import { useState } from "react";

export default function ProjectMedia() {
  const { id } = useParams(); // id_projet
  const { data: project } = useProjectQuery(id);
  const { data: media = [], isLoading, refetch } = useProjectMediaQuery(id);
  const upload = useUploadProjectMedia();
  const delMedia = useDeleteMedia();

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onUpload = async (e) => {
    e.preventDefault();
    setError("");
    const file = e.currentTarget.file.files[0];
    const legende = e.currentTarget.legende.value.trim();
    const position_ = e.currentTarget.position_.value || 1;
    if (!file) return setError("Veuillez sélectionner une image.");

    if (!file.type.startsWith("image/")) {
      return setError("Le fichier doit être une image.");
    }

    try {
      setSubmitting(true);
      await upload.mutateAsync({
        id,
        form: { file, legende, type: "image", position_ },
      });
      e.currentTarget.reset();
      setPreview(null);
      await refetch();
    } catch {
      setError("Échec de l’upload.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id_media) => {
    if (!confirm("Supprimer ce média ?")) return;
    try {
      await delMedia.mutateAsync(id_media);
      await refetch();
    } catch {
      alert("Suppression impossible.");
    }
  };

  return (
    <section className="section s-admin-media">
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

        /* Upload form */
        .form-card{margin-top:var(--space-6); padding:var(--space-6)}
        .form{display:flex; flex-direction:column; gap:var(--space-4)}
        .row{display:flex; gap:var(--space-4); align-items:flex-start; flex-wrap:wrap}
        .field{display:flex; flex-direction:column; gap:.35rem}
        .grow{flex:1 1 320px; min-width:260px}
        .fixed{flex:0 0 160px}
        .preview{
          max-width:300px; border-radius:var(--radius);
          overflow:hidden; border:1px solid var(--color-border)
        }
        .err{
          color:#ef4444; background:rgba(239,68,68,.08);
          border:1px solid rgba(239,68,68,.25);
          border-radius:var(--radius);
          padding:var(--space-3);
        }

        /* Liste médias */
        .list-card{margin-top:var(--space-6); padding:var(--space-6)}
        .list-head{display:flex; align-items:center; justify-content:space-between}
        .media-list{display:flex; flex-wrap:wrap; gap:var(--space-4); margin-top:var(--space-4)}
        .media-item{
          flex:1 1 260px; max-width:420px; min-width:240px;
          display:flex; flex-direction:column; overflow:hidden;
          border:1px solid var(--color-border); border-radius:var(--radius-lg);
          background:var(--color-surface); transition:transform 200ms var(--ease), border-color 200ms var(--ease), box-shadow 200ms var(--ease);
        }
        .media-item:hover{ transform:translateY(-4px); border-color:var(--color-primary); box-shadow:0 6px 18px rgba(152,109,255,.18) }
        .thumb{width:100%; aspect-ratio:16/9; background:#000; overflow:hidden; border-bottom:1px solid var(--color-border)}
        .thumb img{width:100%; height:100%; object-fit:cover; display:block}
        .media-body{padding:var(--space-4); flex:1}
        .media-meta{display:flex; align-items:center; justify-content:space-between}
        .media-footer{padding:var(--space-4); border-top:1px solid var(--color-border); display:flex; justify-content:space-between}
        .narrow{max-width:1000px}
      `}</style>

      <div className="container narrow">
        <header className="head">
          <h1>Médias du projet <span className="primary">.</span></h1>
          <p className="muted">{project?.titre || "Chargement du projet…"}</p>
        </header>

        {/* === Formulaire Upload === */}
        <form onSubmit={onUpload} className="card-elev form-card form">
          <div className="field">
            <label htmlFor="file">Fichier image</label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
          </div>

          {preview && (
            <div className="preview">
              <img src={preview} alt="aperçu" style={{ width:"100%", display:"block" }} />
            </div>
          )}

          <div className="row">
            <div className="field grow">
              <label htmlFor="legende">Légende</label>
              <input id="legende" name="legende" className="input" placeholder="Ex: Capture d’écran page d’accueil" />
            </div>

            <div className="field fixed">
              <label htmlFor="position_">Position</label>
              <input id="position_" name="position_" type="number" min={1} className="input" defaultValue={1} />
            </div>
          </div>

          {error && <div className="err">{error}</div>}

          <div className="row" style={{ justifyContent:"flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Envoi…" : "Uploader"}
            </button>
          </div>
        </form>

        {/* === Liste des médias === */}
        <section className="card-elev list-card">
          <div className="list-head">
            <h3>Médias existants</h3>
            {isLoading && <span className="muted">Chargement…</span>}
          </div>

          {!isLoading && media.length === 0 && (
            <p className="muted" style={{ marginTop: "var(--space-3)" }}>Aucun média pour ce projet.</p>
          )}

          <div className="media-list">
            {media.map((m) => {
              const src = buildUploadUrl(m.chemin);
              return (
                <article key={m.id_media} className="media-item">
                  <div className="thumb">
                    <img
                      src={src}
                      alt={m.legende || m.filename}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.style.background = "linear-gradient(135deg, rgba(152,109,255,.12), rgba(255,255,255,.04))"; }}
                    />
                  </div>

                  <div className="media-body">
                    <div className="media-meta">
                      <strong>{m.legende || "Sans légende"}</strong>
                      <span className="muted" style={{ fontSize:"var(--step--1)" }}>Pos. {m.position_}</span>
                    </div>
                    <p className="muted" style={{ fontSize:"var(--step--1)", marginTop:4 }}>
                      Type : {m.type}
                    </p>
                  </div>

                  <div className="media-footer">
                    <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Ouvrir</a>
                    <button className="btn" onClick={() => onDelete(m.id_media)}>Supprimer</button>
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
