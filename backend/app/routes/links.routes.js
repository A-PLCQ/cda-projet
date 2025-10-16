// app/routes/links.routes.js
const { Router } = require('express');
const ctrl = require('../controllers/link.controller');
const { authRequired, requireRole, authOptional } = require('../middlewares/auth');

const router = Router();

// Debug
router.get('/ping', (req, res) => res.json({ pong: true, from: 'links.routes' }));

// Liens d’un projet
router.get('/projets/:id_projet', authOptional, ctrl.listForProject);

// Ajout d’un lien
router.post('/projets/:id_projet', authRequired, requireRole('admin','editor'), ctrl.addForProject);

// Suppression d’un lien
router.delete('/:id_lien', authRequired, requireRole('admin','editor'), ctrl.remove);

module.exports = router;
