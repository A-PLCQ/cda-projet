import multer from 'multer';
import { v4 as uuid } from 'uuid';
import path from 'node:path';
import fs from 'node:fs';

const dir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive:true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => cb(null, uuid() + path.extname(file.originalname))
});
export default multer({ storage, limits:{ fileSize: 6*1024*1024 } }); // 6MB
