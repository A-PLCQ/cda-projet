import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  useProjectQuery,
  useCreateProject,
  useUpdateProject,
  useProjectCategoriesQuery,
  useSetProjectCategories,
} from "../../../features/projects/hooks";
import { getCategories } from "../../../features/categories/api";
import { useQuery } from "@tanstack/react-query";
import { ENV } from "../../../config/env";

const schema = z.object({
  titre: z.string().min(2, "Le titre doit comporter au moins 2 caractères"),
  extrait: z.string().optional(),
  description: z.string().optional(),
  client: z.string().optional(),
  statut: z.enum(["brouillon", "publie"]).default("publie"),
  est_mis_en_avant: z.boolean().default(false),
  categories: z.array(z.string()).optional(),
});

export default function ProjectForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Données du projet (édition)
  const { data: project, isLoading: loadingProject } = useProjectQuery(isEdit ? id : undefined);

  // Catégories disponibles
  const { data: cats = [], isLoading: loadingCats } = useQuery({
    queryKey: ["cats"],
    queryFn: getCategories,
  });

  // Catégories déjà liées au projet (édition)
  const { data: projectCats = [] } = useProjectCategoriesQuery(isEdit ? id : undefined);

  // Mutations
  const createMut = useCreateProject();
  const updateMut = useUpdateProject();
  const setCatsMut = useSetProjectCategories();

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      titre: "",
      extrait: "",
      description: "",
      client: "",
      statut: "publie",
      est_mis_en_avant: false,
      categories: [],
    },
  });

  // Pré-remplissage en édition
  useEffect(() => {
    if (isEdit && project) {
      reset({
        titre: project.titre || "",
        extrait: project.extrait || "",
        description: project.description || "",
        client: project.client || "",
        statut: project.statut || "publie",
        est_mis_en_avant: !!project.est_mis_en_avant,
        categories:
          Array.isArray(projectCats) && projectCats.length
            ? projectCats.map((c) => c.id_categorie)
            : [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, project, projectCats]);

  const onSubmit = async (values) => {
    try {
      let saved;
      if (isEdit) {
        saved = await updateMut.mutateAsync({
          id,
          payload: {
            titre: values.titre,
            extrait: values.extrait,
            description: values.description,
            client: values.client,
            statut: values.statut,
            est_mis_en_avant: values.est_mis_en_avant,
          },
        });
      } else {
        saved = await createMut.mutateAsync({
          titre: values.titre,
          extrait: values.extrait,
          description: values.description,
          client: values.client,
          statut: values.statut,
          est_mis_en_avant: values.est_mis_en_avant,
          categories: values.categories || [],
        });
      }

      // Catégories
      const selectedCats = watch("categories") || [];
      const targetId = isEdit ? id : saved?.id_projet;
      if (targetId) {
        await setCatsMut.mutateAsync({ id: targetId, categories: selectedCats });
      }

      nav(`/${ENV.adminSlug}/projets`);
    } catch {
      alert("Erreur lors de l’enregistrement du projet.");
    }
  };

  if (isEdit && loadingProject) {
    return (
      <section className="section">
        <div className="container">
          <div className="muted">Chargement…</div>
        </div>
      </section>
    );
  }

  return (
    <section className="section s-admin-project-form">
      <style>{`
        .head{display:flex; flex-direction:column; gap:.5rem}
        .form-card{
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          padding:var(--space-6);
          box-shadow:var(--shadow-1);
          margin-top:var(--space-6);
        }
        form.form{display:flex; flex-direction:column; gap:var(--space-6)}
        .field{display:flex; flex-direction:column; gap:.35rem}
        .row{display:flex; gap:var(--space-4); align-items:flex-start; flex-wrap:wrap}
        .grow{flex:1 1 320px; min-width:260px}
        .fixed{flex:0 0 260px}
        .checkbox-row{display:flex; align-items:center; gap:var(--space-3)}
        .cats{display:flex; gap:var(--space-4); flex-wrap:wrap}
        .badge{border:1px solid var(--color-border); border-radius:999px; padding:.4rem .7rem; background:var(--color-surface)}
        .err{color:#ef4444; font-size:var(--step--1)}
      `}</style>

      <div className="container" style={{ maxWidth: 920 }}>
        <header className="head">
          <h1>
            {isEdit ? "Éditer le projet" : "Nouveau projet"} <span className="primary">.</span>
          </h1>
          <p className="muted">
            Renseignez les informations principales de votre projet. Les champs marqués d’un * sont
            obligatoires.
          </p>
        </header>

        <div className="form-card">
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Titre */}
            <div className="field">
              <label htmlFor="titre">
                Titre <span className="primary">*</span>
              </label>
              <input
                id="titre"
                className="input"
                placeholder="Ex: Refonte site vitrine"
                {...register("titre")}
              />
              {errors.titre && <p className="err">{errors.titre.message}</p>}
            </div>

            {/* Extrait */}
            <div className="field">
              <label htmlFor="extrait">Extrait</label>
              <input
                id="extrait"
                className="input"
                placeholder="Résumé court du projet"
                {...register("extrait")}
              />
            </div>

            {/* Description */}
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={6}
                className="input"
                placeholder="Description détaillée, objectifs, contexte, stack, résultats…"
                {...register("description")}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Client / Statut */}
            <div className="row">
              <div className="field grow">
                <label htmlFor="client">Client</label>
                <input
                  id="client"
                  className="input"
                  placeholder="Nom du client (optionnel)"
                  {...register("client")}
                />
              </div>

              <div className="field fixed">
                <label htmlFor="statut">Statut</label>
                <select id="statut" className="input" {...register("statut")}>
                  <option value="brouillon">brouillon</option>
                  <option value="publie">publie</option>
                </select>
              </div>
            </div>

            {/* Mise en avant */}
            <label className="checkbox-row">
              <input type="checkbox" {...register("est_mis_en_avant")} />
              <span>Mettre en avant</span>
            </label>

            {/* Catégories */}
            <div className="field">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <label>Catégories</label>
                {loadingCats && <span className="muted">Chargement…</span>}
              </div>

              <div className="cats">
                {cats.map((c) => {
                  const selected = (watch("categories") || []).includes(c.id_categorie);
                  return (
                    <label
                      key={c.id_categorie}
                      className="badge"
                      style={{
                        cursor: "pointer",
                        userSelect: "none",
                        borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                        color: selected ? "var(--color-primary)" : "inherit",
                      }}
                    >
                      <input
                        type="checkbox"
                        value={c.id_categorie}
                        checked={selected}
                        onChange={(e) => {
                          const cur = new Set(watch("categories") || []);
                          if (e.target.checked) cur.add(c.id_categorie);
                          else cur.delete(c.id_categorie);
                          setValue("categories", Array.from(cur), { shouldDirty: true });
                        }}
                        style={{ marginRight: 8 }}
                      />
                      {c.nom}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => history.back()}>
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || createMut.isPending || updateMut.isPending}
              >
                {isEdit ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
