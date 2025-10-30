// app/controllers/link.controller.js
const { z } = require('zod');
const { v4: uuid } = require('uuid');
const { ok, created, noContent } = require('../helpers/response');
const { listLinksForProject, addLink, removeLink } = require('../models/link.model');

exports.listForProject = async (req, res, next) => {
  try {
    const rows = await listLinksForProject(req.params.id_projet);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.addForProject = async (req, res, next) => {
  try {
    const Schema = z.object({
      libelle: z.string().min(2),
      url: z.string().url(),
      type: z.enum(['demo','github','doc','autre']).optional().default('autre')
    });
    const body = await Schema.parseAsync(req.body);

    const id_lien = uuid();
    await addLink({ id_lien, ...body, id_projet: req.params.id_projet });
    return created(res, { id_lien, ...body });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await removeLink(req.params.id_lien);
    return noContent(res);
  } catch (e) { next(e); }
};
