// server.js
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cors = require('cors');

// ---- Charge env et pool ----
const { env } = require('./app/config/env');
const { pool } = require('./app/config/db');

// ---- Routes globales ----
const routes = require('./app/routes');

const app = express();

// --- Trust proxy (Apache/Passenger) ---
if (env.TRUST_PROXY) app.set('trust proxy', Number(env.TRUST_PROXY) || 1);

// --- CORS multi-origines ---
const allowList = env.CORS_ORIGINS;
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // autorise curl / serveur interne
      if (allowList.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// -- anti-crash global (log + r��ponse 500 sans tuer le process) --
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

// --- Body parsers ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Static uploads ---
if (!fs.existsSync(env.UPLOAD_DIR)) {
  try {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.error('[UPLOAD] cannot create directory', e.message);
  }
}
app.use('/uploads', express.static(env.UPLOAD_DIR));

// --- Servir /public (docs, assets) ---
// permet de charger automatiquement docs.html sur /docs
app.use(
  express.static(path.join(process.cwd(), 'public'), {
    extensions: ['html'],   // /docs -> docs.html
    index: false            // ��vite de servir index.html par d��faut
  })
);

// --- Page d'accueil HTML ---
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Portfolio A-PLCQ</title>
    <style>
      body {
        font-family: 'Segoe UI', Roboto, sans-serif;
        background:#0d1117; color:#e6edf3;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        height:100vh; margin:0;
      }
      h1 { font-size:2rem; color:#58a6ff; margin-bottom:0.5rem; }
      p { margin:0.25rem 0; font-size:1rem; }
      a {
        color:#58a6ff; text-decoration:none; border-bottom:1px solid #58a6ff;
      }
      a:hover { color:#79c0ff; border-color:#79c0ff; }
      footer {
        position:absolute; bottom:10px; font-size:0.85rem; color:#8b949e;
      }
    </style>
  </head>
  <body>
    <h1>API Portfolio A-PLCQ</h1>
    <p>Statut : <strong style="color:#3fb950;">en ligne</strong></p>
    <p>Base de donnéees : <strong>${env.DB.database}</strong></p>
    <p>Version Node.js : <strong>${process.version}</strong></p>
    <p><a href="/api/health"> Voir /api/health</a></p>
    <p><a href="/docs"> Consulter la doc</a></p>
    <footer>�0�8 ${new Date().getFullYear()} a-plcq.com</footer>
  </body>
  </html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
});

// --- Routes API principales ---
app.use('/api', routes);

// --- 404 & Erreur handler ---
app.use((req, res) => res.status(404).json({ error: { message: 'Not Found' } }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: { message: err.message || 'Internal Server Error' } });
});

// --- Start ---
app.listen(env.PORT, () => {
  console.log(`[API] listening on :${env.PORT} (${env.NODE_ENV})`);
});
