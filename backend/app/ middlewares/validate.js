import { badRequest } from '../helpers/httpErrors.js';
export default schema => (req, _res, next) => {
  const r = schema.safeParse({ body:req.body, params:req.params, query:req.query });
  if (!r.success) throw badRequest(r.error.issues.map(i=>i.message).join(' | '));
  Object.assign(req, r.data);
  next();
};
