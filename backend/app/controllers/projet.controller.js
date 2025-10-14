import asyncHandler from '../helpers/asyncHandler.js';
import { listProjets, createProjet } from '../services/projet.service.js';

export const list = asyncHandler(async (_req, res) => {
  res.json({ ok:true, data: await listProjets() });
});
export const create = asyncHandler(async (req, res) => {
  const created = await createProjet(req.user.sub, req.body);
  res.status(201).json({ ok:true, data: created });
});
