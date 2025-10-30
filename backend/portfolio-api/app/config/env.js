// app/config/env.js
const fs = require('node:fs');
const path = require('node:path'); 
const dotenv = require('dotenv');

// 1) Charge depuis DOTENV_CONFIG_PATH si présent
if (process.env.DOTENV_CONFIG_PATH && fs.existsSync(process.env.DOTENV_CONFIG_PATH)) {
  dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
} else {
  // 2) sinon depuis .env à la racine de l'app (optionnel)
  const local = path.join(process.cwd(), '.env');
  if (fs.existsSync(local)) dotenv.config({ path: local });
  else dotenv.config(); // fallback no-op
}

// Helpers
const parseOrigins = (s) =>
  (s || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

// Exporte un objet env propre
const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: Number(process.env.PORT || 8888),
  TRUST_PROXY: Number(process.env.TRUST_PROXY || 1),
  BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8888}`,
  CORS_ORIGINS: parseOrigins(process.env.CORS_ORIGINS),

  DB: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: (process.env.DB_USER || '').trim(),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
  },

  JWT: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads'),
};

module.exports = { env };
