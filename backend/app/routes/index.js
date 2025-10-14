import { Router } from 'express';
import auth from './auth.routes.js';
import projet from './projet.routes.js';
// (ajouter categorie.routes.js, media.routes.js, admin.routes.js ...)

const router = Router();
router.use('/auth', auth);
router.use('/projects', projet);
export default router;
