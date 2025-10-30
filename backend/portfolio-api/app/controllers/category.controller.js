// app/controllers/category.controller.js
const { z } = require('zod');
const slugify = require('slugify');
const { v4: uuid } = require('uuid');
const { ok, created, noContent } = require('../helpers/response');
const {
  listCategories, getCategoryById, getCategoryBySlug,
  createCategory, updateCategory, deleteCategory
} = require('../models/category.model');

exports.list = async (req, res, next) => {
  try {
    const rows = await listCategories();
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const { id_or_slug } = req.params;
    
    const isUuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id_or_slug);
     
    const data = id_or_slug.includes('-')
      ? await getCategoryById(id_or_slug)
      : await getCategoryBySlug(id_or_slug);
    return ok(res, data || null);S
  } catch (e) { next(e); }
};


exports.create = async (req, res, next) => {
  try {
    const CreateSchema = z.object({
      nom: z.string().min(2),
      slug: z.string().optional(),
      description: z.string().optional().nullable()
    });
    const body = await CreateSchema.parseAsync(req.body);
    const id_categorie = uuid();
    const slug = body.slug || slugify(body.nom, { lower: true, strict: true });
    await createCategory({ id_categorie, nom: body.nom, slug, description: body.description || null });
    const data = await getCategoryById(id_categorie);
    return created(res, data);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const UpdateSchema = z.object({
      nom: z.string().min(2).optional(),
      slug: z.string().optional(),
      description: z.string().optional().nullable()
    });
    const patch = await UpdateSchema.parseAsync(req.body);
    if (patch.nom && !patch.slug) patch.slug = slugify(patch.nom, { lower: true, strict: true });
    await updateCategory(req.params.id, patch);
    const data = await getCategoryById(req.params.id);
    return ok(res, data);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    return noContent(res);
  } catch (e) { next(e); }
};
