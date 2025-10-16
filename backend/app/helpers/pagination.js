// app/helpers/pagination.js

/**
 * Extrait et normalise la pagination depuis les query params.
 * @example
 *   const { limit, page, offset } = getPagination(req.query);
 */
function getPagination(query = {}) {
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const offset = (page - 1) * limit;
  const sort = query.sort || 'date_creation';
  const order = (query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { limit, page, offset, sort, order };
}

/**
 * Construit un objet meta de pagination cohérent pour les réponses JSON.
 * @param {number} total nombre total d’enregistrements
 * @param {number} page page actuelle
 * @param {number} limit limite par page
 */
function buildMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

module.exports = { getPagination, buildMeta };
