const { z } = require('zod');
const { ok } = require('../helpers/response');
const { findById, updateUserProfile } = require('../models/user.model');

exports.me = async (req, res, next) => {
  try {
    const user = await findById(req.user.sub);
    return ok(res, user ? {
      id_utilisateur: user.id_utilisateur,
      email: user.email,
      role: user.role_nom || 'user',
      nom_affiche: user.nom_affiche,
      statut: user.statut
    } : null);
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await findById(req.params.id);
    return ok(res, user || null);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const Schema = z.object({
      nom_affiche: z.string().min(2).optional(),
      statut: z.string().optional(),
      id_role: z.string().optional()
    });
    const body = await Schema.parseAsync(req.body);
    await updateUserProfile({ id_utilisateur: req.params.id, ...body });
    const updated = await findById(req.params.id);
    return ok(res, updated);
  } catch (e) { next(e); }
};
