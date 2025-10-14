import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { createProjetSchema } from '../validators/projet.schema.js';
import * as ctrl from '../controllers/projet.controller.js';

const r = Router();
r.get('/', ctrl.list); // public: liste de projets
r.post('/', requireAuth, validate(createProjetSchema), ctrl.create); // backoffice: créer
export default r;
