import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import QueryProvider from "./providers/QueryProvider";

// ⚠️ Import NOMMÉ des fragments
import { PublicRoutes } from "./router/PublicRoutes";
import { AdminRoutes } from "./router/AdminRoutes";

/* Scroll en haut à chaque navigation (version simple) */
function ScrollToTop() {
  return null; // tu peux garder ta version si tu veux
}

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="p-6">Chargement de l’application…</div>}>
          <Routes>
            {PublicRoutes}
            {AdminRoutes}
            {/* Sécu globale */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryProvider>
  );
}
