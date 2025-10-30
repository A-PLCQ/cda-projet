// app/middlewares/validate.js
// Utilisation : validate({ body: schemaBody, params: schemaParams, query: schemaQuery })
//
// - Chaque clé est optionnelle.
// - Les données validées sont accessibles via req.validated.{body|params|query}
// - On remplace aussi req.body / req.params / req.query par les versions "parses" (safe).

async function runParse(schema, value) {
  // Supporte à la fois .parseAsync (Zod) et fonction custom
  if (!schema) return null;
  if (typeof schema.parseAsync === 'function') {
    return await schema.parseAsync(value);
  }
  if (typeof schema === 'function') {
    return await schema(value);
  }
  throw new Error('Invalid schema provided to validate()');
}

function validate(schemas = {}) {
  return async (req, res, next) => {
    try {
      const out = {};

      if (schemas.body) {
        out.body = await runParse(schemas.body, req.body);
        req.body = out.body;
      }
      if (schemas.params) {
        out.params = await runParse(schemas.params, req.params);
        req.params = out.params;
      }
      if (schemas.query) {
        out.query = await runParse(schemas.query, req.query);
        req.query = out.query;
      }

      req.validated = out;
      return next();
    } catch (err) {
      // Laisse l’error handler central formater (statut 400)
      err.status = err.status || 400;
      return next(err);
    }
  };
}

module.exports = { validate };
