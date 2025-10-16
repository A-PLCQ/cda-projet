// app/controllers/project.controller.js
const { z } = require('zod');
const slugify = require('slugify');
const { v4: uuid } = require('uuid');
const { ok, created, noContent } = require('../helpers/response');
const { getPagination, buildMeta } = require('../helpers/pagination');
const {
  listProjects, countProjects, getProjectById, getProjectBySlug,
  createProject, updateProject, deleteProject,
  setProjectCategories, getProjectCategories
} = require('../models/project.model');

// helpers de date tolérants : string vide -> null, sinon string conservée
const NullableStringDate = z.string().optional().nullable().transform(v => (v === '' ? null : v ?? null));

exports.list = async (req, res, next) => {
  try {
    const { limit, page, offset, sort, order } = getPagination(req.query);
    const filters = {
      q: req.query.q,
      categorie_slug: req.query.categorie,
      statut: req.query.statut,
      mise_en_avant: typeof req.query.mise_en_avant !== 'undefined'
        ? Number(req.query.mise_en_avant) : undefined,
      limit, offset, sort, order
    };
    const [rows, total] = await Promise.all([
      listProjects(filters),
      countProjects(filters)
    ]);
    return ok(res, rows, buildMeta(total, page, limit));
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const { id_or_slug } = req.params;

    const isUuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id_or_slug);

    const data = isUuidV4
      ? await getProjectById(id_or_slug)
      : await getProjectBySlug(id_or_slug);

    return ok(res, data || null);
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try {
    const CreateSchema = z.object({
      titre: z.string().min(2),
      slug: z.string().optional(),
      extrait: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      client: z.string().optional().nullable(),
      date_debut: NullableStringDate,
      date_fin: NullableStringDate,
      statut: z.enum(['brouillon', 'publie', 'archive']).optional().default('brouillon'),
      est_mis_en_avant: z.boolean().optional().default(false),
      categories: z.array(z.string()).optional()
    });
    const body = await CreateSchema.parseAsync(req.body);

    const id_projet = uuid();
    const slug = body.slug || slugify(body.titre, { lower: true, strict: true });
    await createProject({
      id_projet,
      titre: body.titre,
      slug,
      extrait: body.extrait || null,
      description: body.description || null,
      client: body.client || null,
      date_debut: body.date_debut || null,
      date_fin: body.date_fin || null,
      statut: body.statut,
      est_mis_en_avant: !!body.est_mis_en_avant,
      id_utilisateur: req.user?.sub || null
    });

    if (Array.isArray(body.categories) && body.categories.length) {
      await setProjectCategories(id_projet, body.categories);
    }
    const proj = await getProjectById(id_projet);
    return created(res, proj);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const UpdateSchema = z.object({
      titre: z.string().min(2).optional(),
      slug: z.string().optional(),
      extrait: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      client: z.string().optional().nullable(),
      date_debut: NullableStringDate,
      date_fin: NullableStringDate,
      statut: z.enum(['brouillon', 'publie', 'archive']).optional(),
      est_mis_en_avant: z.boolean().optional(),
      categories: z.array(z.string()).optional()
    });
    const patch = await UpdateSchema.parseAsync(req.body);

    if (patch.titre && !patch.slug) {
      patch.slug = slugify(patch.titre, { lower: true, strict: true });
    }
    await updateProject(req.params.id, patch);
    if (Array.isArray(patch.categories)) {
      await setProjectCategories(req.params.id, patch.categories);
    }
    const proj = await getProjectById(req.params.id);
    return ok(res, proj);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await deleteProject(req.params.id);
    return noContent(res);
  } catch (e) { next(e); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const rows = await getProjectCategories(req.params.id);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.setCategories = async (req, res, next) => {
  try {
    const Body = z.object({ categories: z.array(z.string()) });
    const { categories } = await Body.parseAsync(req.body);
    await setProjectCategories(req.params.id, categories);
    const rows = await getProjectCategories(req.params.id);
    return ok(res, rows);
  } catch (e) { next(e); }
};
