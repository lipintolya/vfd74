import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const articles = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
})

export const collections = { articles }
