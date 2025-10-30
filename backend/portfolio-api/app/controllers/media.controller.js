const { z } = require('zod');
const { v4: uuid } = require('uuid');
const path = require('node:path');
const fs = require('node:fs');
const { ok, created, noContent } = require('../helpers/response');
const { listMediaForProject, addMedia, updateMedia, removeMedia } = require('../models/media.model');
const { env } = require('../config/env');

exports.listForProject = async (req, res, next) => {
  try {
    const rows = await listMediaForProject(req.params.id_projet);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.uploadForProject = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'Missing file' } });
    }

    const Schema = z.object({
      legende: z.string().optional().nullable(),
      type: z.enum(['image','video','doc']).optional().default('image'),
      position_: z.coerce.number().int().optional().default(0)
    });
    const body = await Schema.parseAsync(req.body);

    const id_media = uuid();

    // chemin public servi via app.use('/uploads', express.static(...))
    const filename = path.basename(req.file.path);
    const chemin = `/uploads/${filename}`;

    await addMedia({
      id_media,
      chemin,
      legende: body.legende || null,
      type: body.type,
      position_: body.position_,
      id_projet: req.params.id_projet
    });

    return created(res, { id_media, chemin: env.BASE_URL + chemin });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const Schema = z.object({
      legende: z.string().optional().nullable(),
      type: z.enum(['image','video','doc']).optional(),
      position_: z.coerce.number().int().optional()
    });
    const patch = await Schema.parseAsync(req.body);
    await updateMedia(req.params.id_media, patch);
    return ok(res, { id_media: req.params.id_media, ...patch });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    // Optionnel: supprimer aussi le fichier disque si présent
    const absUploads = env.UPLOAD_DIR;
    // on relit le chemin si besoin; si ton model ne l’expose pas, tu peux ignorer cette partie
    // const [rows] = await pool.query('SELECT chemin FROM media WHERE id_media=?', [req.params.id_media]);
    // const chemin = rows?.[0]?.chemin;

    await removeMedia(req.params.id_media);

    // if (chemin?.startsWith('/uploads/')) {
    //   const abs = path.join(process.cwd(), chemin);
    //   fs.unlink(abs, () => {});
    // }
    return noContent(res);
  } catch (e) { next(e); }
};
