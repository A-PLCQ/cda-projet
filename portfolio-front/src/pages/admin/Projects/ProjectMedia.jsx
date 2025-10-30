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

    // Validation légère
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
    <section className="section">
      <div className="container" style={{ maxWidth: 1000 }}>
        <header className="grid" style={{ gap: "var(--space-2)" }}>
          <h1>
            Médias du projet <span className="primary">.</span>
          </h1>
          <p className="muted">
            {project?.titre || "Chargement du projet…"}
          </p>
        </header>

        {/* === Formulaire Upload === */}
        <form
          onSubmit={onUpload}
          className="card surface card-padding mt-6"
          style={{ display: "grid", gap: "var(--space-4)" }}
        >
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
            <div
              style={{
                maxWidth: 300,
                borderRadius: "var(--radius)",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
              }}
            >
              <img
                src={preview}
                alt="aperçu"
                style={{ width: "100%", display: "block" }}
              />
            </div>
          )}

          <div className="field-row">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="legende">Légende</label>
              <input
                id="legende"
                name="legende"
                className="input"
                placeholder="Ex: Capture d’écran page d’accueil"
              />
            </div>

            <div className="field" style={{ width: 160 }}>
              <label htmlFor="position_">Position</label>
              <input
                id="position_"
                name="position_"
                type="number"
                min={1}
                className="input"
                defaultValue={1}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "#ef4444",
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.25)",
                borderRadius: "var(--radius)",
                padding: "var(--space-3)",
              }}
            >
              {error}
            </div>
          )}

          <div className="field-row" style={{ justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Envoi…" : "Uploader"}
            </button>
          </div>
        </form>

        {/* === Liste des médias === */}
        <section className="card surface card-padding mt-6">
          <div className="field-row" style={{ justifyContent: "space-between" }}>
            <h3>Médias existants</h3>
            {isLoading && <span className="muted">Chargement…</span>}
          </div>

          {!isLoading && media.length === 0 && (
            <p className="muted mt-3">Aucun média pour ce projet.</p>
          )}

          <div
            className="grid"
            style={{
              gap: "var(--space-4)",
              marginTop: "var(--space-4)",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {media.map((m) => {
              const src = buildUploadUrl(m.chemin);
              return (
                <article
                  key={m.id_media}
                  className="card surface card-hover"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={src}
                    alt={m.legende || m.filename}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  />
                  <div className="card-padding" style={{ flex: 1 }}>
                    <div className="field-row" style={{ justifyContent: "space-between" }}>
                      <strong>{m.legende || "Sans légende"}</strong>
                      <span className="muted" style={{ fontSize: "var(--step--1)" }}>
                        Pos. {m.position_}
                      </span>
                    </div>
                    <p
                      className="muted"
                      style={{ fontSize: "var(--step--1)", marginTop: "4px" }}
                    >
                      Type : {m.type}
                    </p>
                  </div>

                  <div
                    className="card-padding"
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                    >
                      Ouvrir
                    </a>
                    <button
                      className="btn"
                      onClick={() => onDelete(m.id_media)}
                    >
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
