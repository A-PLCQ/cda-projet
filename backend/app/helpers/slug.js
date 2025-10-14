import slugify from 'slugify';
export const toSlug = (s) => slugify(s, { lower:true, strict:true, locale:'fr' });
