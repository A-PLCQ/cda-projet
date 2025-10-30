// app/routes/index.js
const { Router } = require('express');

const health = require('./health.routes');
const auth = require('./auth.routes');
const users = require('./users.routes');
const projects = require('./projects.routes');
const categories = require('./categories.routes');
const media = require('./media.routes');
const links = require('./links.routes');

const router = Router();

router.use('/health', health);
router.use('/auth', auth);
router.use('/users', users);
router.use('/projets', projects);
router.use('/categories', categories);
router.use('/media', media);
router.use('/liens', links);

module.exports = router;
