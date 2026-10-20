import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Emnefilerne ligger i content/<fag>/emner/ uden for site/. Filnavnet (uden .md) bliver id = slug.
const emner = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../content/otp/emner' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    fag: z.string(),
    forelaesning: z.array(z.number()),
    kategori: z.string(),
    relevans: z.number().min(1).max(5),
    kort: z.string().max(160),
    blik: z.string(),
    blik_detalje: z.string().optional(),
    teoretikere: z.array(z.string()),
    interesse: z.string(),
    faenomener: z.string(),
    nøgleord: z.array(z.string()).default([]),
    kilder: z.array(z.string()).default([]),
    relaterede: z.array(z.string()).default([]),
  }),
});

export const collections = { emner };
