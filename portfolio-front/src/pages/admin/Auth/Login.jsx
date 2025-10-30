import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../store/auth.store";
import { ENV } from "../../../config/env";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(4, "Mot de passe trop court"),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const login = useAuth((s) => s.login);
  const isAuth = useAuth((s) => s.isAuthenticated());
  const loading = useAuth((s) => s.loading);
  const error = useAuth((s) => s.error);
  const bootstrap = useAuth((s) => s.bootstrap);

  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || `/${ENV.adminSlug}/dashboard`;

  useEffect(() => {
    bootstrap();
  }, []);
  useEffect(() => {
    if (isAuth) nav(from, { replace: true });
  }, [isAuth, from, nav]);

  const onSubmit = async (values) => {
    try {
      await login(values);
      nav(from, { replace: true });
    } catch {
      /* Erreur déjà gérée dans le store */
    }
  };

  return (
    <section
      className="section"
      style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}
    >
      <div
        className="card surface card-padding"
        style={{
          maxWidth: "420px",
          width: "100%",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <h1 className="mb-4">Connexion admin</h1>
        <p className="muted mb-6">
          Accédez au tableau de bord de <strong>{ENV.appName}</strong>
        </p>

        {error && (
          <div
            style={{
              color: "#ef4444",
              background: "rgba(239,68,68,.1)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius)",
              marginBottom: "var(--space-4)",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid"
          style={{ gap: "var(--space-4)" }}
        >
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="exemple@domaine.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="muted" style={{ color: "#ef4444", fontSize: "var(--step--1)" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="muted" style={{ color: "#ef4444", fontSize: "var(--step--1)" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 muted" style={{ textAlign: "center" }}>
          Retour au site public :{" "}
          <Link to="/" className="link">
            Accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
