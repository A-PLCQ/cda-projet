// app/helpers/response.js

/**
 * Réponse standard de succès (200)
 * @param {Response} res 
 * @param {any} data 
 * @param {object} [meta] - données additionnelles (pagination, etc.)
 */
function ok(res, data = null, meta = null) {
  const payload = { data };
  if (meta) payload.meta = meta;
  return res.status(200).json(payload);
}

/**
 * Réponse création réussie (201)
 */
function created(res, data = null) {
  return res.status(201).json({ data });
}

/**
 * Réponse sans contenu (204)
 */
function noContent(res) {
  return res.status(204).send();
}

/**
 * Réponse d’erreur contrôlée (ex. validations métiers)
 * @param {Response} res
 * @param {number} status
 * @param {string} message
 * @param {any} [details]
 */
function fail(res, status = 400, message = 'Bad request', details = null) {
  return res.status(status).json({
    error: { message, details }
  });
}

module.exports = { ok, created, noContent, fail };
