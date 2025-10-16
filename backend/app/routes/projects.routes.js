const { Router } = require('express');
const ctrl = require('../controllers/project.controller');
const { authRequired, requireRole, authOptional } = require('../middlewares/auth');

const router = Router();

// Debug
router.get('/ping', (req, res) => res.json({ pong: true, from: 'projects.routes' }));

// Public
router.get('/', authOptional, ctrl.list);
router.get('/:id_or_slug', authOptional, ctrl.get);

// Écriture protégée
router.post('/', authRequired, requireRole('admin','editor'), ctrl.create);
router.patch('/:id', authRequired, requireRole('admin','editor'), ctrl.update);
router.delete('/:id', authRequired, requireRole('admin'), ctrl.remove);

// Catégories liées
router.get('/:id/categories', authOptional, ctrl.getCategories);
router.put('/:id/categories', authRequired, requireRole('admin','editor'), ctrl.setCategories);

module.exports = router;
