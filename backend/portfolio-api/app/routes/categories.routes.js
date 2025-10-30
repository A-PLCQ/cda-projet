const { Router } = require('express');
const ctrl = require('../controllers/category.controller');
const { authRequired, requireRole, authOptional } = require('../middlewares/auth');

const router = Router();

// Debug
router.get('/ping', (req, res) => res.json({ pong: true, from: 'categories.routes' }));

// Public
router.get('/', authOptional, ctrl.list);
router.get('/:id_or_slug', authOptional, ctrl.get);

// Admin only
router.post('/', authRequired, requireRole('admin'), ctrl.create);
router.patch('/:id', authRequired, requireRole('admin'), ctrl.update);
router.delete('/:id', authRequired, requireRole('admin'), ctrl.remove);

module.exports = router;
