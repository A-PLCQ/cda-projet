// app/middlewares/error.js
const multer = require('multer');

/**
 * 404
 */
function notFound(req, res, next) {
  res.status(404).json({ error: { message: 'Not Found' } });
}

/**
 * Handler d'erreurs centralisé.
 * Gère ZodError, MulterError, SyntaxError JSON, erreurs MySQL, JWT, conflits (duplicate key), etc.
 */
function errorHandler(err, req, res, next) {
  // Par défaut
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let details;

  // Zod
  if (err.name === 'ZodError') {
    status = 400;
    message = 'Validation error';
    details = err.issues || err.errors;
  }

  // Multer (upload)
  if (err instanceof multer.MulterError) {
    status = 400;
    message = `Upload error: ${err.message}`;
  }

  // JSON invalide (body-parser)
  if (err instanceof SyntaxError && 'body' in err) {
    status = 400;
    message = 'Invalid JSON payload';
  }

  // MySQL (mysql2)
  // err.code exemples: 'ER_DUP_ENTRY', 'ER_NO_REFERENCED_ROW_2'
  if (err && err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        status = 409;
        message = 'Conflict: duplicate entry';
        break;
      case 'ER_NO_REFERENCED_ROW_2':
      case 'ER_ROW_IS_REFERENCED_2':
        status = 409;
        message = 'Conflict: foreign key constraint';
        break;
      default:
        // laisse 500 / message mysql
        break;
    }
  }

  // JWT (lib renvoie souvent JsonWebTokenError / TokenExpiredError)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  // Log côté serveur (évite d’inonder en prod si besoin)
  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ error: { message, details } });
}

module.exports = { notFound, errorHandler };
