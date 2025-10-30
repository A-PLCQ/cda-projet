import { Route } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";

// Pages publiques
import Home from "../../pages/public/Home";
import Health from "../../pages/public/Health";
import Projects from "../../pages/public/Projects";
import ProjectDetail from "../../pages/public/ProjectDetail";
import NotFound from "../../pages/public/NotFound";

/* ⚠️ On exporte un FRAGMENT, pas un composant */
export const PublicRoutes = (
  <>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/projets" element={<Projects />} />
      <Route path="/projets/:slug" element={<ProjectDetail />} />
      <Route path="/health" element={<Health />} />
      <Route path="/404" element={<NotFound />} />
    </Route>
  </>
);
