import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <style>{`
        .footer{
          border-top:1px solid var(--color-border);
          background:var(--color-bg);
        }
        .footer .inner{
          max-width:var(--container);
          margin-inline:auto;
          padding: var(--space-8) var(--space-4);
          display:flex; align-items:center; justify-content:center;
          text-align:center;
        }
        .footer p{ color:var(--color-muted) }
        .footer .font-medium{ color:var(--color-text); font-weight:600 }
      `}</style>

      <div className="inner">
        <p>
          © {year} — <span className="font-medium">A-PLCQ</span> · Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
