import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ENV } from "../../config/env";
import { formatDate } from "../../utils/formatDate";
import { getFeaturedProjects, getProjectMedia, getProjectLinks } from "../../features/projects/api";
import { buildUploadUrl } from "../../utils/url";

/* =========
   Données issues de l’ancien portfolio
   ========= */
const EXPERIENCES = [
  {
    key: "ynov",
    titre: "Ynov Aix-en-Provence",
    role: "Étudiant développeur",
    periode: "3ème année",
    details: `Ynov est une école d'ingénieurs qui propose des formations en informatique, en design et en business.
J'ai choisi le cursus informatique pour acquérir des compétences en développement et programmation.
J'ai également prévu de suivre le cursus en alternance pour acquérir une expérience professionnelle et développer mes compétences en gestion de projet.
J'ai choisi Ynov car c'est une école reconnue par les entreprises.`,
  },
  {
    key: "engie",
    titre: "Technicien Optique",
    role: "Déploiement de Fibre Optique",
    periode: "2020 - 2021 (3 mois)",
    details: `Technicien de Déploiement de Fibre Optique chez Engie Solutions, j'ai été impliqué dans le déploiement de réseaux à haut débit.
Installation de la fibre, exécution de tests pour assurer une connectivité optimale, maîtrise des technologies, travail d'équipe et résolution de problèmes.`,
  },
  {
    key: "novadem",
    titre: "Technicien en conception de drones",
    role: "Conception de drones de surveillance",
    periode: "2022 - 2022 (2 mois)",
    details: `Chez Novadem (drones de surveillance pour l'armée française), j'ai contribué au développement et à la fabrication.
Garantie qualité, conformité aux normes de sécurité, collaboration avec les ingénieurs pour résoudre des défis techniques.`,
  },
  {
    key: "corner",
    titre: "Corner Bistro",
    role: "Barman",
    periode: "2023",
    details: `En parallèle des études : relation client, gestion du temps, travail sous pression.
Créer une atmosphère accueillante, préparer/servir des boissons de qualité, interaction efficace avec les clients.
Compétences en communication et autonomie dans un environnement dynamique.`,
  },
];

const SKILLS = [
  { key: "html", icon: "/assets/icons/html.svg", label: "HTML" },
  { key: "css", icon: "/assets/icons/css.svg", label: "CSS" },
  { key: "js", icon: "/assets/icons/javascript.svg", label: "JavaScript" },
  { key: "next", icon: "/assets/icons/next.svg", label: "Next.js" },
  { key: "vue", icon: "/assets/icons/vuejs-icon.svg", label: "Vue.js" },
  { key: "canva", icon: "/assets/icons/canva-icon.svg", label: "Canva" },
  { key: "figma", icon: "/assets/icons/figma.svg", label: "Figma" },
  { key: "cisco", icon: "/assets/icons/cisco-ar21.svg", label: "Cisco" },
  { key: "angular", icon: "/assets/icons/angular.svg", label: "Angular" },
  { key: "ionic", icon: "/assets/icons/ionic.svg", label: "Ionic" },
];

/* ===== Utils : URL absolue pour les médias ===== */
const toAbsoluteUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const cleaned = String(path).replace(/^\/+/, "");
  if (typeof buildUploadUrl === "function") return buildUploadUrl(cleaned);
  const base = (ENV?.API_URL || "").replace(/\/+$/, "");
  return `${base}/${cleaned}`;
};

export default function Home() {
  const [activeExp, setActiveExp] = useState(EXPERIENCES[0].key);
  const [currentSkill, setCurrentSkill] = useState(null);

  const { data: featured = [], isLoading, error } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: () => getFeaturedProjects({ limit: 6 }),
  });

  const currentExp = EXPERIENCES.find((e) => e.key === activeExp) || EXPERIENCES[0];

  return (
    <>
      <style>{`
        /* ---------- helpers locaux ---------- */
        .wrap{display:flex; gap:var(--space-8); align-items:stretch; flex-wrap:wrap}
        .col{flex:1 1 340px; min-width:300px}
        .field-row{display:flex; gap:var(--space-4); align-items:center; flex-wrap:wrap}
        .gap-2{gap:var(--space-2)}
        .mt-6{margin-top:var(--space-8)}
        .card-padding{padding:var(--space-5)}
        .card-hover{transition: transform var(--duration) var(--ease), border-color var(--duration) var(--ease)}
        .card-hover:hover{transform: translateY(-2px); border-color: var(--color-primary)}

        /* ---------- HERO ---------- */
        .s-home .hero-title{letter-spacing:-.015em}
        .typewriter{font-family:var(--font-body); font-size:var(--step-0); color:var(--color-muted)}

        .brand-logo{
          display:flex; align-items:center; justify-content:center;
          width:100%; min-height:220px; border-radius:var(--radius-lg);
          border:1px solid var(--color-border); background:var(--color-surface);
        }

        /* ---------- ABOUT ---------- */
        .about-visual{
          width:100%; height:220px; border-radius:var(--radius-lg);
          border:1px solid var(--color-border);
          background:linear-gradient(135deg, rgba(152,109,255,.15), transparent 60%), url('/assets/img/hero.jpg') center/cover no-repeat;
        }

        /* ---------- EXPERIENCES ---------- */
        .xp-list .btn{width:100%; justify-content:flex-start}
        .xp-detail .title{display:flex; align-items:baseline; justify-content:space-between; gap:var(--space-2)}
        .xp-detail .company{margin-top:4px}

        /* ---------- PROJETS ---------- */
        .projects-grid{display:flex; flex-wrap:wrap; gap:var(--space-6)}
        .projects-grid .card{flex:1 1 320px; min-width:280px; max-width:420px}
        .thumb{position:relative; width:100%; aspect-ratio:16/9; background:#000; overflow:hidden}

        /* ---------- SKILLS ---------- */
        .skills-wrap{display:flex; gap:var(--space-8); flex-wrap:wrap}
        .skills-grid{display:flex; flex-wrap:wrap; gap:var(--space-4)}
        .skills-grid .card{flex:1 1 120px; min-width:120px; max-width:160px; display:flex; align-items:center; justify-content:center; min-height:120px; cursor:default}

        /* ---------- Responsive tweaks ---------- */
        @media (max-width: 980px){
          .projects-grid .card{flex:1 1 45%}
        }
        @media (max-width: 640px){
          .projects-grid .card{flex:1 1 100%}
        }
      `}</style>

      {/* HERO */}
      <section className="section s-home">
        <div className="container wrap">
          <div className="col" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", justifyContent: "center" }}>
            <h1 className="hero-title">
              Développeur full stack et administrateur réseaux confirmé{" "}
              <span className="primary">spécialisé en web</span>, avec de l’expérience cyber.
            </h1>

            <p className="typewriter">
              Contact pro : plumecocq.augustin@gmail.com · 06 10 53 37 75
            </p>

            <div className="field-row">
              <a
                href="https://www.linkedin.com/in/augustin-plumecocq/"
                target="_blank" rel="noopener noreferrer"
                className="btn btn-primary"
              >
                LinkedIn
              </a>
              <Link to="/projets" className="btn btn-ghost">Voir mes projets</Link>
            </div>
          </div>

          <div className="col card surface card-padding center" style={{ padding: "0" }}>
            <div className="brand-logo">
              <img src="/assets/icons/logo-a-plcq.svg" alt="Logo A-PLCQ" width="140" height="140" />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section s-about">
        <div className="container wrap">
          <div className="col card surface card-padding" style={{ minHeight: 260 }}>
            <div aria-hidden className="about-visual" />
          </div>

          <div className="col" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h4 className="muted">Qui suis-je</h4>
            <h3>Développeur full stack</h3>
            <p>
              Je m'appelle augustin, ou <strong>A-PLCQ</strong>. Esprit créatif animé par la passion du numérique,
              je conçois des interfaces <em>modernes</em> en me concentrant sur les performances,
              les animations, la réactivité et le référencement.
            </p>

            <div className="field-row">
              <a href="https://www.instagram.com/a.plcq/" target="_blank" rel="noopener" className="badge">Instagram</a>
              <a href="https://www.linkedin.com/in/augustin-plumecocq/" target="_blank" rel="noopener" className="badge">LinkedIn</a>
              <a href="https://github.com/A-PLCQ" target="_blank" rel="noopener" className="badge">GitHub</a>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="section">
        <div className="container">
          <h2>Expériences <span className="primary">.</span></h2>

          <div className="wrap mt-6">
            {/* Liste */}
            <div className="col card surface card-padding xp-list">
              <div className="stack gap-2">
                {EXPERIENCES.map((exp) => {
                  const isActive = exp.key === activeExp;
                  return (
                    <button
                      key={exp.key}
                      className={`btn ${isActive ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setActiveExp(exp.key)}
                    >
                      {exp.titre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Détail */}
            <div className="col card surface card-padding xp-detail">
              <div className="stack">
                <div className="title">
                  <h4 className="titleExperience">{currentExp.role}</h4>
                  <p className="muted">{currentExp.periode}</p>
                </div>
                <h5 className="companyExperience company">{currentExp.titre}</h5>
                <p className="changeExperience" style={{ whiteSpace: "pre-line" }}>
                  {currentExp.details}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJETS EN AVANT (API) */}
      <section className="section s-projects">
        <div className="container">
          <div className="field-row" style={{ justifyContent: "space-between" }}>
            <h2>Projets mis en avant</h2>
            <Link to="/projets" className="link">Voir tous les projets →</Link>
          </div>

          {isLoading && <div className="mt-6 muted">Chargement des projets…</div>}
          {error && <div className="mt-6" style={{ color: "#ef4444" }}>Erreur : {String(error.message || "inconnue")}</div>}

          <div className="projects-grid mt-6">
            {featured.map((p) => (
              <ProjectCard key={p.id_projet} projet={p} />
            ))}
          </div>

          {!isLoading && featured.length === 0 && (
            <p className="muted mt-6">Aucun projet mis en avant pour le moment.</p>
          )}
        </div>
      </section>

      {/* SKILLS */}
      <section className="section s-skills">
        <div className="container skills-wrap">
          <div className="col" style={{ display: "flex", flexDirection: "column" }}>
            <h2>Connaissances <span className="primary">.</span></h2>
            <p className="muted">* Survolez une carte pour voir la description *</p>

            <div className="card surface card-padding mt-6">
              <h4 className="muted">Description</h4>
              <p className="changeDescription mt-2">
                {currentSkill ? SKILL_DESCRIPTIONS[currentSkill] : "Survolez un skill pour voir la description détaillée."}
              </p>
            </div>
          </div>

          <div className="col">
            <div className="skills-grid">
              {SKILLS.map((s) => (
                <article
                  key={s.key}
                  className="card surface card-padding card-hover"
                  onMouseEnter={() => setCurrentSkill(s.key)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "var(--space-2)" }}>
                    <img src={s.icon} width="60" height="60" alt={s.label} />
                    <span className="sr-only">{s.label}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const SKILL_DESCRIPTIONS = {
  html:
    "HTML est un langage de balisage dans lequel nous marquons des éléments pour définir les informations que la page affichera.",
  css:
    "CSS est un langage de page de style composé de « couches », créé dans le but de styliser les pages.",
  js:
    "JavaScript est un langage de programmation qui permet d'implémenter des éléments dynamiques dans les pages Web.",
  next:
    "Next.js est un framework Web qui permet des fonctionnalités telles que le rendu côté serveur et la génération de sites.",
  vue:
    "Vue.js est un framework JavaScript open-source pour développer des interfaces utilisateur et des applications SPA.",
  canva:
    "Canva est un outil de conception en ligne pour créer des graphiques, présentations, affiches, documents et contenus visuels.",
  figma:
    "Figma est un outil de conception d'interface Web avec prototypage intégré et collaboration temps réel.",
  cisco:
    "Cisco conçoit et vend des équipements réseau — commutation, routage, sécurité et collaboration.",
  angular:
    "Angular est un framework open-source (Google) pour créer des applications Web dynamiques.",
  ionic:
    "Ionic est un framework open-source pour développer des apps mobiles hybrides (HTML/CSS/JS).",
};

/* ---------- Carte projet : version robuste (Flex-only) ---------- */
function ProjectCard({ projet }) {
  const { id_projet, titre, extrait, client, date_creation, slug } = projet;

  const { data: media = [] } = useQuery({
    queryKey: ["project-media", id_projet],
    queryFn: () => getProjectMedia(id_projet),
  });

  const { data: links = [] } = useQuery({
    queryKey: ["project-links", id_projet],
    queryFn: () => getProjectLinks(id_projet),
  });

  const firstImage =
    (media || []).find(
      (m) => typeof m?.type === "string" && (m.type.startsWith("image/") || m.type === "image")
    ) || media?.[0];

  const img = firstImage?.chemin ? toAbsoluteUrl(firstImage.chemin) : null;

  const github = links.find((l) => l.type === "github");
  const demo = links.find((l) => l.type === "demo");

  return (
    <div className="card surface card-hover" style={{ overflow: "hidden" }}>
      {img ? (
        <div className="thumb">
          <img
            src={img}
            alt={titre}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform .5s var(--ease)"
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onError={(e) => {
              // Fallback visuel si l’URL est cassée
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.style.background =
                "linear-gradient(135deg, rgba(152,109,255,.12), rgba(255,255,255,.04))";
            }}
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="thumb"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, rgba(152,109,255,.12), rgba(255,255,255,.04))",
          }}
        >
          <span className="muted" style={{ fontSize: 12 }}>Pas d’image pour ce projet</span>
        </div>
      )}

      <div className="card-padding" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <h3 style={{ marginBottom: 6 }}>{titre}</h3>
          {extrait && <p className="muted" style={{ fontSize: "var(--step--1)" }}>{extrait}</p>}
          <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>
            {client && <>Client : {client} • </>}
            {formatDate(date_creation)}
          </p>
        </div>

        <div className="field-row">
          <Link to={`/projets/${slug}`} className="btn btn-ghost">Voir le projet</Link>
          {github && <a href={github.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">GitHub</a>}
          {demo && <a href={demo.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Démo</a>}
        </div>
      </div>
    </div>
  );
}
