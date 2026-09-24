import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import {
	competitionSchema,
	practiceSchema,
	reproductionSchema,
	solutionSchema,
	sourceSchema,
} from './content/schemas';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	competitions: defineCollection({
		loader: glob({
			base: './src/content/competitions',
			pattern: '**/*.md',
			generateId: ({ entry }) => entry.replace(/\.md$/, ''),
		}),
		schema: competitionSchema,
	}),
	solutions: defineCollection({
		loader: glob({ base: './src/content/solutions', pattern: '**/*.yaml' }),
		schema: solutionSchema,
	}),
	sources: defineCollection({
		loader: glob({ base: './src/content/sources', pattern: '**/*.yaml' }),
		schema: sourceSchema,
	}),
	practices: defineCollection({
		loader: glob({
			base: './src/content/practices',
			pattern: '**/*.md',
			generateId: ({ entry }) => entry.replace(/\.md$/, ''),
		}),
		schema: practiceSchema,
	}),
	reproductions: defineCollection({
		loader: glob({ base: './src/content/reproductions', pattern: '**/*.yaml' }),
		schema: reproductionSchema,
	}),
};
