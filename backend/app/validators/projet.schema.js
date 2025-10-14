import { z } from 'zod';
export const createProjetSchema = z.object({
  body: z.object({
    titre: z.string().min(2),
    extrait: z.string().optional(),
    description: z.string().optional(),
    client: z.string().optional(),
    date_debut: z.string().optional(),
    date_fin: z.string().optional(),
    statut: z.string().min(2),
    est_mis_en_avant: z.coerce.boolean().optional(),
    categories: z.array(z.string()).default([]), // ids de catégories
    liens: z.array(z.object({ libelle:z.string(), url:z.string().url(), type:z.string() })).default([]),
  })
});
