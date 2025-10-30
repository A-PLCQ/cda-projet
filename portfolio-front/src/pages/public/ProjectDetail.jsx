import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProject } from "../../features/projects/hooks";
import { getProjectMedia, getProjectLinks } from "../../features/projects/api";
import { buildUploadUrl } from "../../utils/url";
import { formatDate } from "../../utils/formatDate";

export default function ProjectDetail() {
  const { slug } = useParams();

  // 1) Données du projet (par slug)
  const { data: p, isLoading, error } = useProject(slug);

  // 2) Médias & liens (quand on a l'id)
  const { data: media = [], isLoading: mediaLoading } = useQuery({
    enabled: !!p?.id_projet,
    queryKey: ["project-media", p?.id_projet],
    queryFn: () => getProjectMedia(p.id_projet),
  });

  const { data: links = [], isLoading: linksLoading } = useQuery({
    enabled: !!p?.id_projet,
    queryKey: ["project-links", p?.id_projet],
    queryFn: () => getProjectLinks(p.id_projet),
  });

  // Images uniquement (type "image" ou "image/*")
  const images = (media || []).filter(
    (m) =>
      typeof m?.type === "string" &&
      (m.type === "image" || m.type.startsWith("image/"))
  );

  // Cover = première image si dispo
  const cover = images[0]?.chemin ? buildUploadUrl(images[0].chemin) : null;

  // Liens triés (github, demo, doc, autre…)
  const byType = (t) => links.find((l) => l.type?.toLowerCase() === t);
  const linkGithub = byType("github");
  const linkDemo = byType("demo");
  const linkDoc = byType("doc") || byType("documentation");

  return (
    <section className="section">
      <div className="container">
        {/* Back */}
        <div className="mb-4">
          <Link to="/projets" className="link">← Retour aux projets</Link>
        </div>

        {/* Loading / Error / Not found */}
        {isLoading && (
          <div className="card surface card-padding">
            <div className="muted">Chargement…</div>
          </div>
        )}
        {error && (
          <div style={{ color: "#ef4444" }}>
            Erreur : {String(error.message || "inconnue")}
          </div>
        )}
        {!isLoading && !p && <div>Projet introuvable.</div>}

        {/* Contenu */}
        {p && (
          <div className="grid" style={{ gap: "var(--space-6)" }}>
            {/* Titre + Meta */}
            <header>
              <h1>{p.titre}</h1>
              <p className="muted" style={{ marginTop: "6px", fontSize: "var(--step--1)" }}>
                {p.client ? <>Client : {p.client} • </> : null}
                Publié : {formatDate(p.date_creation)}
              </p>
            </header>

            {/* Cover */}
            {cover ? (
              <div
                className="card surface"
                style={{
                  overflow: "hidden",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <img
                  src={cover}
                  alt={p.titre}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "420px",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform .6s var(--ease)",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
            ) : null}

            {/* Grille 2 colonnes : contenu + sidebar */}
            <div className="grid grid-2">
              {/* Colonne gauche : contenu */}
              <article className="grid" style={{ gap: "var(--space-6)" }}>
                {p.extrait && (
                  <p
                    className="muted"
                    style={{
                      fontSize: "var(--step-1)",
                      lineHeight: 1.6,
                    }}
                  >
                    {p.extrait}
                  </p>
                )}

                {p.description && (
                  <div className="card surface card-padding">
                    <h3 style={{ marginBottom: "var(--space-3)" }}>Description</h3>
                    <div
                      className="content"
                      style={{ whiteSpace: "pre-line", lineHeight: 1.7, opacity: 0.95 }}
                    >
                      {p.description}
                    </div>
                  </div>
                )}

                {/* Galerie d’images */}
                <section className="card surface card-padding">
                  <div className="field-row" style={{ justifyContent: "space-between" }}>
                    <h3>Galerie</h3>
                    {mediaLoading && <span className="muted">Chargement…</span>}
                  </div>

                  {images.length === 0 ? (
                    <p className="muted mt-2">Aucune image disponible.</p>
                  ) : (
                    <div
                      className="grid"
                      style={{
                        gap: "var(--space-4)",
                        gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                      }}
                    >
                      {images.map((m) => {
                        const src = buildUploadUrl(m.chemin);
                        return (
                          <a
                            key={m.id_media || src}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card surface card-hover"
                            style={{
                              display: "block",
                              overflow: "hidden",
                              borderRadius: "var(--radius)",
                              border: "1px solid var(--color-border)",
                            }}
                            title={m.legende || p.titre}
                          >
                            <img
                              src={src}
                              alt={m.legende || p.titre}
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "160px",
                                objectFit: "cover",
                                display: "block",
                                transition: "transform .5s var(--ease)",
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </section>
              </article>

              {/* Colonne droite : meta + liens */}
              <aside className="grid" style={{ gap: "var(--space-6)" }}>
                <div className="card surface card-padding">
                  <h3 style={{ marginBottom: "var(--space-3)" }}>Informations</h3>
                  <dl className="grid" style={{ gap: "var(--space-2)" }}>
                    <div className="field-row" style={{ justifyContent: "space-between" }}>
                      <dt className="muted">Statut</dt>
                      <dd>{p.statut || "—"}</dd>
                    </div>
                    <div className="field-row" style={{ justifyContent: "space-between" }}>
                      <dt className="muted">Slug</dt>
                      <dd className="muted">{p.slug}</dd>
                    </div>
                    <div className="field-row" style={{ justifyContent: "space-between" }}>
                      <dt className="muted">Début</dt>
                      <dd>{p.date_debut ? formatDate(p.date_debut) : "—"}</dd>
                    </div>
                    <div className="field-row" style={{ justifyContent: "space-between" }}>
                      <dt className="muted">Fin</dt>
                      <dd>{p.date_fin ? formatDate(p.date_fin) : "—"}</dd>
                    </div>
                  </dl>

                  {p.est_mis_en_avant && (
                    <div className="badge primary" style={{ marginTop: "var(--space-3)" }}>
                      Mis en avant
                    </div>
                  )}
                </div>

                <div className="card surface card-padding">
                  <h3 style={{ marginBottom: "var(--space-3)" }}>Liens</h3>
                  {linksLoading && <p className="muted">Chargement…</p>}
                  {!linksLoading && links.length === 0 && (
                    <p className="muted">Aucun lien renseigné.</p>
                  )}
                  {!linksLoading && links.length > 0 && (
                    <div className="grid" style={{ gap: "var(--space-3)" }}>
                      {linkGithub && (
                        <a
                          href={linkGithub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost"
                        >
                          GitHub
                        </a>
                      )}
                      {linkDemo && (
                        <a
                          href={linkDemo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost"
                        >
                          Démo
                        </a>
                      )}
                      {linkDoc && (
                        <a
                          href={linkDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost"
                        >
                          Documentation
                        </a>
                      )}
                      {/* Autres liens génériques */}
                      {links
                        .filter(
                          (l) =>
                            !["github", "demo", "doc", "documentation"].includes(
                              (l.type || "").toLowerCase()
                            )
                        )
                        .map((l) => (
                          <a
                            key={l.id_lien || l.url}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                          >
                            {l.libelle || l.type || "Lien"}
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
