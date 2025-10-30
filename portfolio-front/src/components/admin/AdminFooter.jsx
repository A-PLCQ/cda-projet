import { ENV } from "../../config/env";

export default function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 py-4 mt-8 text-center text-sm opacity-70">
      <div className="max-w-6xl mx-auto px-4">
        <p>
          © {year} — A-PLCQ Backoffice • API v1.0 ({ENV.apiBaseUrl})
        </p>
      </div>
    </footer>
  );
}
