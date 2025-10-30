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
  categories: z.array(z.string()).optional(), // tableau d'ids
});

export default function ProjectForm() {
  const nav = useNavigate();
  const { id } = useParams(); // si présent -> édition
  const isEdit = !!id;

  // Données du projet (édition)
  const { data: project, isLoading: loadingProject } = useProjectQuery(
    isEdit ? id : undefined
  );

  // Catégories disponibles
  const { data: cats = [], isLoading: loadingCats } = useQuery({
    queryKey: ["cats"],
    queryFn: getCategories,
  });

  // Catégories déjà liées au projet (édition)
  const { data: projectCats = [] } = useProjectCategoriesQuery(
    isEdit ? id : undefined
  );

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

  // Quand le projet (édition) arrive -> reset du formulaire + précochage des catégories
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

      // Applique/Met à jour les catégories si besoin
      const selectedCats = watch("categories") || [];
      const targetId = isEdit ? id : saved?.id_projet;
      if (selectedCats.length && targetId) {
        await setCatsMut.mutateAsync({
          id: targetId,
          categories: selectedCats,
        });
      }

      nav(`/${ENV.adminSlug}/projets`);
    } catch (e) {
      // Erreur générique (tu peux remplacer par un toast)
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
    <section className="section">
      <div className="container" style={{ maxWidth: "920px" }}>
        <header className="grid" style={{ gap: "var(--space-2)" }}>
          <h1>
            {isEdit ? "Éditer le projet" : "Nouveau projet"}{" "}
            <span className="primary">.</span>
          </h1>
          <p className="muted">
            Renseignez les informations principales de votre projet. Les champs
            marqués d’un * sont obligatoires.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card surface card-padding mt-6"
          style={{ display: "grid", gap: "var(--space-6)" }}
        >
          {/* Ligne 1 : Titre */}
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
            {errors.titre && (
              <p className="muted" style={{ color: "#ef4444" }}>
                {errors.titre.message}
              </p>
            )}
          </div>

          {/* Ligne 2 : Extrait */}
          <div className="field">
            <label htmlFor="extrait">Extrait</label>
            <input
              id="extrait"
              className="input"
              placeholder="Résumé court du projet"
              {...register("extrait")}
            />
          </div>

          {/* Ligne 3 : Description */}
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={6}
              className="textarea"
              placeholder="Description détaillée, objectifs, contexte, stack, résultats…"
              {...register("description")}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Ligne 4 : Client / Statut */}
          <div className="field-row">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="client">Client</label>
              <input
                id="client"
                className="input"
                placeholder="Nom du client (optionnel)"
                {...register("client")}
              />
            </div>

            <div className="field" style={{ width: 260 }}>
              <label htmlFor="statut">Statut</label>
              <select id="statut" className="select" {...register("statut")}>
                <option value="brouillon">brouillon</option>
                <option value="publie">publie</option>
              </select>
            </div>
          </div>

          {/* Ligne 5 : Mise en avant */}
          <label className="field-row" style={{ alignItems: "center", gap: "var(--space-3)" }}>
            <input type="checkbox" {...register("est_mis_en_avant")} />
            <span>Mettre en avant</span>
          </label>

          {/* Ligne 6 : Catégories */}
          <div className="field">
            <div className="field-row" style={{ justifyContent: "space-between" }}>
              <label>Catégories</label>
              {loadingCats && <span className="muted">Chargement…</span>}
            </div>

            <div className="field-row" style={{ gap: "var(--space-4)", flexWrap: "wrap" }}>
              {cats.map((c) => (
                <label
                  key={c.id_categorie}
                  className="badge"
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <input
                    type="checkbox"
                    value={c.id_categorie}
                    checked={(watch("categories") || []).includes(c.id_categorie)}
                    onChange={(e) => {
                      const cur = new Set(watch("categories") || []);
                      if (e.target.checked) cur.add(c.id_categorie);
                      else cur.delete(c.id_categorie);
                      setValue("categories", Array.from(cur), { shouldDirty: true });
                    }}
                    style={{ marginRight: "8px" }}
                  />
                  {c.nom}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="field-row" style={{ justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => history.back()}
            >
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
    </section>
  );
}
