import { useEffect, useState } from "react";
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

  const [showPwd, setShowPwd] = useState(false);

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
    <section className="section s-auth">
      <style>{`
        .s-auth{
          min-height:100vh;
          display:flex; align-items:center; justify-content:center;
          padding-block:var(--space-16);
        }

        .auth-card{
          width:100%; max-width:480px;
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius-lg);
          box-shadow:var(--shadow-2);
          padding:var(--space-6);
        }

        .auth-head{display:flex; flex-direction:column; gap:.35rem; margin-bottom:var(--space-6)}
        .auth-title{margin:0}
        .auth-sub{color:var(--color-muted)}

        form.auth-form{display:flex; flex-direction:column; gap:var(--space-4)}

        .field{display:flex; flex-direction:column; gap:.35rem}
        .field label{font-weight:600}
        .field .input-wrap{display:flex; align-items:center; gap:.5rem}
        .input{flex:1}

        .pwd-toggle{
          display:inline-flex; align-items:center; justify-content:center;
          border:1px solid var(--color-border);
          background:var(--color-surface);
          border-radius:var(--radius);
          padding:.55rem .7rem;
          cursor:pointer;
          transition:transform var(--duration) var(--ease), border-color var(--duration) var(--ease);
        }
        .pwd-toggle:hover{ transform:translateY(-1px); border-color:var(--color-primary) }

        .error{
          color:#ef4444; font-size:var(--step--1);
          background:rgba(239,68,68,.08);
          border:1px solid rgba(239,68,68,.25);
          padding:var(--space-3);
          border-radius:var(--radius);
        }

        .auth-footer{
          margin-top:var(--space-6);
          text-align:center; color:var(--color-muted)
        }
      `}</style>

      <div className="auth-card">
        <header className="auth-head">
          <h1 className="auth-title">Connexion admin</h1>
          <p className="auth-sub">
            Accédez au tableau de bord de <strong>{ENV.appName}</strong>
          </p>
        </header>

        {error && <div className="error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="exemple@domaine.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="error" style={{ background: "transparent", border: 0, padding: 0 }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrap">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                className="pwd-toggle"
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShowPwd((v) => !v)}
                title={showPwd ? "Masquer" : "Afficher"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <p className="error" style={{ background: "transparent", border: 0, padding: 0 }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="auth-footer">
          Retour au site public : <Link to="/" className="link">Accueil</Link>
        </div>
      </div>
    </section>
  );
}
