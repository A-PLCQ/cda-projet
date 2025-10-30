// app/routes/users.routes.js (test inline)
const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const router = Router();

// auth inline minimal pour isoler le problème
function authInline(req, res, next) {
  const h = req.headers.authorization || '';
  const m = /^Bearer (.+)$/.exec(h);
  if (!m) return res.status(401).json({ error: { message: 'Missing token' } });
  try {
    const payload = jwt.verify(m[1], env.JWT.accessSecret);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

router.get('/ping', (req, res) => res.json({ pong: true, from: 'users.routes.js' }));
router.get('/me', authInline, (req, res) => res.json({ ok: true, user: req.user }));

module.exports = router;
