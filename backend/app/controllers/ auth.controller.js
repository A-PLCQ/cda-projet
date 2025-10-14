import asyncHandler from '../helpers/asyncHandler.js';
import * as svc from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const tokens = await svc.register(req.body);
  res.status(201).json({ ok:true, ...tokens });
});
export const login = asyncHandler(async (req, res) => {
  const tokens = await svc.login(req.body);
  res.json({ ok:true, ...tokens });
});
