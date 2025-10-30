import { ENV } from "../config/env";

/** Construit l'URL absolue vers un fichier uploadé */
export function buildUploadUrl(path) {
  if (!path) return "";

  // déjà une URL absolue (http ou https)
  if (/^https?:\/\//i.test(path)) return path;

  const api = new URL(ENV.apiBaseUrl);

  // on force /uploads/ si manquant
  const normalized =
    path.startsWith("/uploads/") ? path : `/uploads/${path.replace(/^\/+/, "")}`;

  return `${api.origin}${normalized}`;
}
