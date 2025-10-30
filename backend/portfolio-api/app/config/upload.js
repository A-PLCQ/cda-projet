// app/config/upload.js
const multer = require('multer');
const fs = require('node:fs');
const path = require('node:path');
const { env } = require('./env');

if (!fs.existsSync(env.UPLOAD_DIR)) {
  try { fs.mkdirSync(env.UPLOAD_DIR, { recursive: true }); } catch (e) {
    console.error('[UPLOAD] cannot create upload dir:', e.message);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const clean = (file.originalname || 'file')
      .replace(/\s+/g, '-')
      .replace(/[^\w.\-]+/g, '')
      .toLowerCase();
    cb(null, `${Date.now()}-${clean}`);
  }
});

const upload = multer({ storage });

module.exports = { upload };
