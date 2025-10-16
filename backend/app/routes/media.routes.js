const { Router } = require('express');
const ctrl = require('../controllers/media.controller');
const { authRequired, requireRole, authOptional } = require('../middlewares/auth');
const { upload } = require('../config/upload');

const router = Router();

// Debug rapide
router.get('/ping', (req, res) => res.json({ pong: true, from: 'media.routes' }));

// Lister les médias d’un projet (public)
router.get('/projets/:id_projet', authOptional, ctrl.listForProject);

// ➜ Upload d’un média pour un projet (admin|editor)
//    ATTENTION: chemin EXACT attendu par Postman
router.post(
  '/projets/:id_projet',
  authRequired,
  requireRole('admin', 'editor'),
  upload.single('file'),           // la clé du form-data doit s’appeler "file"
  ctrl.uploadForProject
);

// Mettre à jour un média (admin|editor)
router.patch('/:id_media', authRequired, requireRole('admin','editor'), ctrl.update);

// Supprimer un média (admin)
router.delete('/:id_media', authRequired, requireRole('admin'), ctrl.remove);

module.exports = router;
