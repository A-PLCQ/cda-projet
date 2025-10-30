import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../features/categories/api";
import { useEffect, useMemo, useState } from "react";

/* Petit helper pour afficher un message temporaire */
function useFlash(timeout = 2500) {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), timeout);
    return () => clearTimeout(t);
  }, [msg, timeout]);
  return [msg, setMsg];
}

export default function CategoriesList() {
  const {
    data: cats = [],
    refetch,
    isLoading,
    isFetching,
    error,
  } = useQuery({ queryKey: ["cats"], queryFn: getCategories });

  const [editing, setEditing] = useState(null); // {id_categorie, nom, description, slug}
  const [submitting, setSubmitting] = useState(false);
  const [flashOk, setFlashOk] = useFlash();
  const [flashErr, setFlashErr] = useFlash();

  const title = useMemo(
    () => (editing ? "Modifier la catégorie" : "Nouvelle catégorie"),
    [editing]
  );

  const onCreate = async (e) => {
    e.preventDefault();
    const nom = e.currentTarget.nom.value.trim();
    const description = e.currentTarget.description.value.trim();
    if (!nom) {
      setFlashErr("Le nom est requis.");
      return;
    }
    try {
      setSubmitting(true);
      await createCategory({ nom, description });
      e.currentTarget.reset();
      setFlashOk("Catégorie créée.");
      await refetch();
    } catch {
      setFlashErr("Échec de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    const nom = e.currentTarget.nom.value.trim();
    const description = e.currentTarget.description.value.trim();
    if (!nom) {
      setFlashErr("Le nom est requis.");
      return;
    }
    try {
      setSubmitting(true);
      await updateCategory(editing.id_categorie, { nom, description });
      setEditing(null);
      setFlashOk("Catégorie mise à jour.");
      await refetch();
    } catch {
      setFlashErr("Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (cat) => {
    if (!confirm(`Supprimer la catégorie "${cat.nom}" ?`)) return;
    try {
      setSubmitting(true);
      await deleteCategory(cat.id_categorie);
      setFlashOk("Catégorie supprimée.");
      await refetch();
    } catch {
      setFlashErr("Suppression impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="card surface card-padding">
            <p className="muted">Chargement…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <header className="grid" style={{ gap: "var(--space-2)" }}>
          <h1>
            Catégories <span className="primary">.</span>
          </h1>
          <p className="muted">
            Gérez les catégories associées à vos projets (création, édition,
            suppression).
          </p>
        </header>

        {(flashOk || flashErr || error) && (
          <div className="grid" style={{ gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
            {flashOk && (
              <div
                className="card surface card-padding"
                style={{ borderLeft: "3px solid #22c55e" }}
              >
                {flashOk}
              </div>
            )}
            {(flashErr || error) && (
              <div
                className="card surface card-padding"
                style={{ borderLeft: "3px solid #ef4444", color: "#ef4444" }}
              >
                {flashErr || "Erreur lors du chargement des catégories."}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-2" style={{ gap: "var(--space-6)", marginTop: "var(--space-6)" }}>
          {/* === Liste === */}
          <section className="card surface card-padding">
            <div className="field-row" style={{ justifyContent: "space-between" }}>
              <h3>Catégories</h3>
              {isFetching && <span className="muted">Rafraîchissement…</span>}
            </div>

            <div className="grid" style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
              {cats.map((c) => (
                <article
                  key={c.id_categorie}
                  className="card surface card-hover"
                  style={{
                    padding: "var(--space-4)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "var(--space-4)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{c.nom}</div>
                    <div className="muted" style={{ fontSize: "var(--step--1)" }}>
                      {c.slug}
                    </div>
                    {c.description && (
                      <p className="muted" style={{ marginTop: "4px" }}>
                        {c.description}
                      </p>
                    )}
                  </div>
                  <div className="field-row" style={{ flexWrap: "wrap" }}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setEditing(c)}
                    >
                      Éditer
                    </button>
                    <button className="btn" onClick={() => onDelete(c)}>
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}

              {cats.length === 0 && (
                <p className="muted">Aucune catégorie pour le moment.</p>
              )}
            </div>
          </section>

          {/* === Formulaire créer / éditer === */}
          <section className="card surface card-padding">
            <h3 style={{ marginBottom: "var(--space-3)" }}>{title}</h3>

            <form
              key={editing?.id_categorie || "new"}
              onSubmit={editing ? onUpdate : onCreate}
              className="grid"
              style={{ gap: "var(--space-4)" }}
            >
              <div className="field">
                <label htmlFor="nom">Nom *</label>
                <input
                  id="nom"
                  name="nom"
                  className="input"
                  placeholder="Ex : Web, Mobile, UI, Backend…"
                  defaultValue={editing?.nom || ""}
                />
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="textarea"
                  rows={3}
                  placeholder="Description optionnelle"
                  defaultValue={editing?.description || ""}
                />
              </div>

              <div className="field-row" style={{ justifyContent: "flex-end" }}>
                {editing && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setEditing(null)}
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {editing ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>

            {editing && (
              <p className="muted" style={{ marginTop: "var(--space-3)", fontSize: "var(--step--1)" }}>
                <strong>Slug :</strong> {editing.slug}
              </p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
