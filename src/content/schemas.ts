import { reference } from 'astro:content';
import { z } from 'astro/zod';
import { isHttpUrl } from './url-validation.js';
import {
	datasetCharacteristicSchema,
	modalitySchema,
	taskSchema,
	techniqueSchema,
	topicSchema,
	validationStrategySchema,
} from './taxonomy';

const dateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/)
	.refine((value) => {
		const date = new Date(`${value}T00:00:00Z`);
		return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
	}, 'Expected a real calendar date in YYYY-MM-DD format');

const idString = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected a lowercase kebab-case ID');
const webUrl = z.url().refine(isHttpUrl, 'Expected an HTTP(S) URL');
const nullableUrl = webUrl.nullable();
const nonNegativeNumber = z.number().nonnegative();

const contentSchema = z.object({
	schema_version: z.literal(1),
	id: idString,
	status: z.enum(['draft', 'in-review', 'published']),
	title: z.string().min(1),
	summary: z.string().min(1),
	reviewed_by: z.string().nullable(),
	reviewed_at: dateString.nullable(),
	editorial_approval_type: z.literal('human').nullable().default(null),
	editorial_approved_by: z.string().nullable().default(null),
	editorial_approved_at: dateString.nullable().default(null),
});

const evidenceSchema = z.object({
	source_id: reference('sources'),
	locator: z.string().min(1),
	support_summary: z.string().min(1),
});

const claimSchema = z.object({
	id: idString,
	statement: z.string().min(1),
	kind: z.enum(['source-reported', 'reproduced', 'editorial-inference']),
	evidence: z.array(evidenceSchema),
	supports_claim_refs: z.array(z.string()),
	reproduction_ids: z.array(reference('reproductions')),
	conditions: z.string(),
	limitations: z.string(),
});

const metricSchema = z.object({
	id: idString,
	name: z.string().min(1),
	direction: z.enum(['minimize', 'maximize']),
	aggregation: z.string().min(1),
	source_id: reference('sources'),
});

const resourceSchema = z.object({
	id: idString,
	scope: z.enum(['training', 'inference', 'full-pipeline']),
	hardware_class: z.enum(['cpu-only', 'single-gpu', 'multi-gpu', 'tpu', 'unknown']),
	accelerator_model: z.string().nullable(),
	accelerator_count: z.number().int().nonnegative().nullable(),
	vram_gb_per_device: nonNegativeNumber.nullable(),
	ram_gb: nonNegativeNumber.nullable(),
	wall_hours: nonNegativeNumber.nullable(),
	accelerator_hours: nonNegativeNumber.nullable(),
	basis: z.enum(['source-reported', 'reproduced', 'unknown']),
	claim_id: idString.nullable(),
});

const reproducibilitySchema = z.object({
	code_url: nullableUrl,
	code_revision: z.string().nullable(),
	status: z.enum(['not-assessed', 'code-available', 'attempted', 'partial', 'reproduced', 'blocked']),
	reproduction_ids: z.array(reference('reproductions')),
	notes: z.string(),
});

const validationSchema = z.object({
	strategy: validationStrategySchema.nullable(),
	details: z.string().nullable(),
	source_ids: z.array(reference('sources')),
});

const solutionScoreSchema = z.object({
	metric_id: idString,
	value: z.number(),
	split: z.enum(['local-cv', 'public-lb', 'private-lb']),
	configuration: z.string().min(1),
	fold_summary: z.string().nullable(),
	claim_id: idString,
});

export const competitionSchema = contentSchema.extend({
	id: z.string().regex(/^competition-[a-z0-9]+(?:-[a-z0-9]+)*$/),
	slug: idString,
	meta_kaggle_id: z.string().regex(/^\d+$/).optional(),
	kaggle_slug: idString,
	competition_url: webUrl,
	end_date: dateString.nullable(),
	coverage: z.enum(['partial', 'reviewed']),
	modalities: z.array(modalitySchema),
	tasks: z.array(taskSchema),
	dataset_characteristics: z.array(datasetCharacteristicSchema),
	metrics: z.array(metricSchema),
	solution_ids: z.array(reference('solutions')),
	practice_ids: z.array(reference('practices')),
	source_ids: z.array(reference('sources')),
	claims: z.array(claimSchema),
	kaggle_bible_completeness_level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
	kaggle_bible_completeness_label: z.enum(['catalog', 'evidence-map', 'full-guide']),
	editorial_status: z.enum(['unstarted', 'queued', 'in-progress', 'blocked', 'in-review', 'published']),
});

export const solutionSchema = contentSchema.extend({
	id: z.string().regex(/^solution-[a-z0-9]+(?:-[a-z0-9]+)*$/),
	competition_id: reference('competitions'),
	team: z.string().min(1),
	authors: z.array(z.string()),
	source_ids: z.array(reference('sources')),
	rank: z.object({
		value: z.number().int().positive().nullable(),
		basis: z.enum(['unknown', 'author-report', 'official-final-private']),
		source_id: reference('sources').nullable(),
	}),
	scores: z.array(solutionScoreSchema),
	validation: validationSchema,
	techniques: z.array(techniqueSchema),
	resources: z.array(resourceSchema),
	reproducibility: reproducibilitySchema,
	claims: z.array(claimSchema),
	unsuccessful_attempts: z.array(z.object({
		description: z.string().min(1),
		claim_id: idString,
		conditions: z.string(),
	})),
	transfer_limits: z.array(z.string()),
});

export const practiceSchema = contentSchema.extend({
	id: z.string().regex(/^practice-[a-z0-9]+(?:-[a-z0-9]+)*$/),
	slug: idString,
	topic: topicSchema,
	evidence_scope: z.enum(['single-case', 'recurring', 'foundational']),
	modalities: z.array(modalitySchema),
	tasks: z.array(taskSchema),
	dataset_characteristics: z.array(datasetCharacteristicSchema),
	techniques: z.array(techniqueSchema),
	evidence_claim_refs: z.array(z.string()),
	source_ids: z.array(reference('sources')),
	claims: z.array(claimSchema),
});

export const sourceSchema = z.object({
	schema_version: z.literal(1),
	id: z.string().regex(/^source-[a-z0-9]+(?:-[a-z0-9]+)*$/),
	title: z.string().min(1),
	url: webUrl,
	kind: z.enum(['official-competition', 'author-writeup', 'code', 'paper', 'documentation', 'discovery-index']),
	authors: z.array(z.string()),
	published_at: dateString.nullable(),
	accessed_at: dateString,
	revision: z.string().nullable(),
	locator_notes: z.string().nullable(),
	access_status: z.enum(['accessible', 'login-required', 'unavailable', 'unchecked']),
	content_reviewed: z.boolean(),
	license: z.string().nullable(),
	notes: z.string(),
});

export const reproductionSchema = z.object({
	schema_version: z.literal(1),
	id: z.string().regex(/^reproduction-[a-z0-9]+(?:-[a-z0-9]+)*$/),
	solution_id: reference('solutions'),
	claim_ids: z.array(idString),
	status: z.enum(['planned', 'running', 'completed', 'failed', 'blocked']),
	scope: z.string().min(1),
	code: z.object({
		url: nullableUrl,
		revision: z.string().nullable(),
		local_changes: z.string().nullable(),
		snapshot_ref: z.string().trim().min(1).nullable().default(null),
	}),
	data: z.object({
		source_url: nullableUrl,
		version_or_fingerprint: z.string().nullable(),
		split_definition: z.string().nullable(),
		access_requirements: z.string().nullable(),
	}),
	environment: z.object({
		dependency_lock_or_image: z.string().nullable(),
		operating_system: z.string().nullable(),
		hardware: z.string().nullable(),
		seeds: z.array(z.union([z.string(), z.number().int()])),
	}),
	command: z.string().nullable(),
	expected: z.object({
		metric_id: idString.nullable(),
		split: z.enum(['local-cv', 'public-lb', 'private-lb']).nullable(),
		value: z.number().nullable(),
		tolerance: nonNegativeNumber.nullable(),
		tolerance_rationale: z.string().nullable(),
	}),
	observed: z.object({
		value: z.number().nullable(),
		fold_results: z.array(z.number()),
		wall_hours: nonNegativeNumber.nullable(),
		peak_memory_gb: nonNegativeNumber.nullable(),
	}),
	artifacts: z.array(z.string().trim().min(1)),
	executed_by: z.string().nullable(),
	executed_at: dateString.nullable(),
	limitations: z.array(z.string()),
});
