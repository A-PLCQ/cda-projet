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

  // Images uniquement
  const images = (media || []).filter(
    (m) => typeof m?.type === "string" && (m.type === "image" || m.type.startsWith("image/"))
  );

  // Cover = première image si dispo
  const cover = images[0]?.chemin ? buildUploadUrl(images[0].chemin) : null;

  // Liens triés
  const byType = (t) => links.find((l) => l.type?.toLowerCase() === t);
  const linkGithub = byType("github");
  const linkDemo = byType("demo");
  const linkDoc = byType("doc") || byType("documentation");

  return (
    <section className="section">
      <style>{`
        /* ---------- Layouts flex locaux ---------- */
        .detail-wrap{display:flex; gap:var(--space-6); flex-wrap:wrap}
        .detail-main{flex:1 1 640px; min-width:320px; display:flex; flex-direction:column; gap:var(--space-6)}
        .detail-aside{flex:0 1 360px; min-width:260px; display:flex; flex-direction:column; gap:var(--space-6)}

        .card-elev{
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          box-shadow:var(--shadow-1);
        }

        /* ---------- Head ---------- */
        .title-block{display:flex; flex-direction:column; gap:.4rem}

        /* ---------- Cover ---------- */
        .cover{overflow:hidden; border-radius:var(--radius-lg); border:1px solid var(--color-border)}
        .cover img{width:100%; height:420px; object-fit:cover; display:block; transition:transform .6s var(--ease)}
        .cover:hover img{transform:scale(1.02)}

        /* ---------- Galerie ---------- */
        .gallery{display:flex; flex-wrap:wrap; gap:var(--space-4)}
        .g-item{
          flex:1 1 calc(33.333% - var(--space-4));
          min-width:180px; max-width:100%;
          overflow:hidden; border-radius:var(--radius); border:1px solid var(--color-border);
          transition:transform 200ms var(--ease), border-color 200ms var(--ease), box-shadow 200ms var(--ease);
        }
        .g-item:hover{transform:translateY(-4px); border-color:var(--color-primary); box-shadow:0 6px 18px rgba(152,109,255,.22)}
        .g-item img{width:100%; height:160px; object-fit:cover; display:block; transition:transform .5s var(--ease)}
        .g-item:hover img{transform:scale(1.05)}

        /* ---------- Meta list ---------- */
        .kv{display:flex; justify-content:space-between; align-items:baseline; gap:var(--space-4)}
        .kv dt{color:var(--color-muted)}
        .badge.primary{
          display:inline-flex; align-items:center; background:var(--color-primary); color:#fff;
          font-size:var(--step--1); border-radius:999px; padding:.35rem .75rem;
        }

        /* ---------- Pager-style back ---------- */
        .back-link{display:inline-flex; gap:.5rem; align-items:center}

        /* ---------- Responsive tweaks ---------- */
        @media (max-width: 780px){
          .cover img{height:300px}
          .g-item{flex:1 1 calc(50% - var(--space-4))}
        }
        @media (max-width: 520px){
          .g-item{flex:1 1 100%}
        }
      `}</style>

      <div className="container">
        {/* Back */}
        <div className="mb-4">
          <Link to="/projets" className="link back-link">← Retour aux projets</Link>
        </div>

        {/* Loading / Error / Not found */}
        {isLoading && (
          <div className="card-elev card-padding">
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
          <div className="detail-wrap">
            {/* Colonne gauche */}
            <div className="detail-main">
              <header className="title-block">
                <h1>{p.titre}</h1>
                <p className="muted" style={{ fontSize: "var(--step--1)" }}>
                  {p.client ? <>Client : {p.client} • </> : null}
                  Publié : {formatDate(p.date_creation)}
                </p>
              </header>

              {/* Cover */}
              {cover && (
                <div className="cover card-elev">
                  <img src={cover} alt={p.titre} loading="lazy" />
                </div>
              )}

              {/* Extrait */}
              {p.extrait && (
                <p className="muted" style={{ fontSize: "var(--step-1)", lineHeight: 1.6 }}>
                  {p.extrait}
                </p>
              )}

              {/* Description */}
              {p.description && (
                <div className="card-elev card-padding">
                  <h3 style={{ marginBottom: "var(--space-3)" }}>Description</h3>
                  <div style={{ whiteSpace: "pre-line", lineHeight: 1.7, opacity: 0.95 }}>
                    {p.description}
                  </div>
                </div>
              )}

              {/* Galerie */}
              <section className="card-elev card-padding">
                <div className="field-row" style={{ justifyContent: "space-between" }}>
                  <h3>Galerie</h3>
                  {mediaLoading && <span className="muted">Chargement…</span>}
                </div>

                {images.length === 0 ? (
                  <p className="muted mt-2">Aucune image disponible.</p>
                ) : (
                  <div className="gallery">
                    {images.map((m) => {
                      const src = buildUploadUrl(m.chemin);
                      return (
                        <a
                          key={m.id_media || src}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="g-item card-elev"
                          title={m.legende || p.titre}
                        >
                          <img src={src} alt={m.legende || p.titre} loading="lazy" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Colonne droite */}
            <aside className="detail-aside">
              <div className="card-elev card-padding">
                <h3 style={{ marginBottom: "var(--space-3)" }}>Informations</h3>
                <dl className="stack" style={{ gap: "var(--space-2)" }}>
                  <div className="kv">
                    <dt className="muted">Statut</dt>
                    <dd>{p.statut || "—"}</dd>
                  </div>
                  <div className="kv">
                    <dt className="muted">Slug</dt>
                    <dd className="muted">{p.slug}</dd>
                  </div>
                  <div className="kv">
                    <dt className="muted">Début</dt>
                    <dd>{p.date_debut ? formatDate(p.date_debut) : "—"}</dd>
                  </div>
                  <div className="kv">
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

              <div className="card-elev card-padding">
                <h3 style={{ marginBottom: "var(--space-3)" }}>Liens</h3>
                {linksLoading && <p className="muted">Chargement…</p>}
                {!linksLoading && links.length === 0 && <p className="muted">Aucun lien renseigné.</p>}

                {!linksLoading && links.length > 0 && (
                  <div className="stack" style={{ gap: "var(--space-3)" }}>
                    {linkGithub && (
                      <a href={linkGithub.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                        GitHub
                      </a>
                    )}
                    {linkDemo && (
                      <a href={linkDemo.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                        Démo
                      </a>
                    )}
                    {linkDoc && (
                      <a href={linkDoc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                        Documentation
                      </a>
                    )}

                    {/* Autres liens */}
                    {links
                      .filter((l) => !["github", "demo", "doc", "documentation"].includes((l.type || "").toLowerCase()))
                      .map((l) => (
                        <a key={l.id_lien || l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                          {l.libelle || l.type || "Lien"}
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
