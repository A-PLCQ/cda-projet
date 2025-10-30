import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="inner">
        <p>
          © {year} — <span className="font-medium">A-PLCQ</span> · Tous droits réservés.
        </p>
        <p className="mt-2">
          Conçu avec <span style={{ color: "#ff4d8d" }}>❤️</span> en React + Node.js ·{" "}
          <Link to="/mentions-legales">Mentions légales</Link>
        </p>
      </div>
    </footer>
  );
}
