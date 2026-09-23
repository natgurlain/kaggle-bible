import { z } from 'astro/zod';

const entries = <T extends readonly { id: string }[]>(values: T) =>
	values.map(({ id }) => id) as [T[number]['id'], ...T[number]['id'][]];

export const taxonomy = {
	modalities: [
		{ id: 'tabular', label: 'Tabular', aliases: [], definition: 'Structured rows and columns are the primary input.' },
		{ id: 'text', label: 'Text', aliases: ['NLP'], definition: 'Natural-language or tokenized text is a primary input.' },
		{ id: 'image', label: 'Image', aliases: ['computer vision'], definition: 'Still images are a primary input.' },
		{ id: 'audio', label: 'Audio', aliases: ['speech'], definition: 'Audio signals or derived sound features are a primary input.' },
		{ id: 'video', label: 'Video', aliases: [], definition: 'Ordered video frames are a primary input.' },
		{ id: 'multimodal', label: 'Multimodal', aliases: [], definition: 'Two or more materially different input modalities are combined.' },
	],
	tasks: [
		{ id: 'binary-classification', label: 'Binary classification', aliases: [], definition: 'Predict one of two target classes.' },
		{ id: 'multiclass-classification', label: 'Multiclass classification', aliases: [], definition: 'Predict one of more than two mutually exclusive target classes.' },
		{ id: 'multilabel-classification', label: 'Multilabel classification', aliases: [], definition: 'Predict zero or more labels for each example.' },
		{ id: 'regression', label: 'Regression', aliases: [], definition: 'Predict a numeric target.' },
		{ id: 'forecasting', label: 'Forecasting', aliases: ['time-series forecasting'], definition: 'Predict future values from ordered observations.' },
		{ id: 'ranking', label: 'Ranking', aliases: [], definition: 'Order candidates by relevance or utility.' },
		{ id: 'segmentation', label: 'Segmentation', aliases: [], definition: 'Assign a class or value to each spatial element.' },
		{ id: 'detection', label: 'Detection', aliases: [], definition: 'Locate and classify objects or events.' },
		{ id: 'retrieval', label: 'Retrieval', aliases: [], definition: 'Find relevant items for a query.' },
		{ id: 'question-answering', label: 'Question answering', aliases: ['QA'], definition: 'Produce an answer conditioned on a question and its context.' },
	],
	datasetCharacteristics: [
		{ id: 'temporal', label: 'Temporal', aliases: [], definition: 'Observations have meaningful order or time boundaries.' },
		{ id: 'grouped-entities', label: 'Grouped entities', aliases: [], definition: 'Rows share entities or groups that constrain splitting or aggregation.' },
		{ id: 'hierarchical', label: 'Hierarchical', aliases: [], definition: 'Observations or targets have nested aggregation levels.' },
		{ id: 'imbalanced', label: 'Imbalanced', aliases: [], definition: 'Target frequencies or relevant outcomes are materially uneven.' },
		{ id: 'high-cardinality', label: 'High cardinality', aliases: [], definition: 'Categorical or identifier-like fields have many distinct values.' },
		{ id: 'sparse', label: 'Sparse', aliases: [], definition: 'Most measured values or feature entries are absent or zero.' },
		{ id: 'distribution-shift', label: 'Distribution shift', aliases: [], definition: 'Train and evaluation data differ in a relevant distribution.' },
		{ id: 'small-labeled-set', label: 'Small labeled set', aliases: [], definition: 'The labeled sample constrains model fitting or validation.' },
		{ id: 'external-data', label: 'External data', aliases: [], definition: 'A solution uses data outside the competition-provided files.' },
	],
	validationStrategies: [
		{ id: 'random-kfold', label: 'Random K-fold', aliases: [], definition: 'Randomly partition examples into K folds.' },
		{ id: 'stratified-kfold', label: 'Stratified K-fold', aliases: [], definition: 'Partition folds while approximately preserving target proportions.' },
		{ id: 'group-kfold', label: 'Group K-fold', aliases: [], definition: 'Keep each group entirely within one fold.' },
		{ id: 'temporal-holdout', label: 'Temporal holdout', aliases: [], definition: 'Train on earlier observations and validate on a later period.' },
		{ id: 'rolling-origin', label: 'Rolling origin', aliases: [], definition: 'Evaluate multiple expanding or sliding historical cutoffs.' },
		{ id: 'custom', label: 'Custom', aliases: [], definition: 'Use a documented split that does not fit another listed strategy.' },
	],
	topics: [
		{ id: 'validation', label: 'Validation', aliases: [], definition: 'Design and interpretation of out-of-sample evaluation.' },
		{ id: 'leakage', label: 'Leakage', aliases: [], definition: 'Prevent information unavailable at prediction time entering a model.' },
		{ id: 'feature-engineering', label: 'Feature engineering', aliases: [], definition: 'Transform inputs into useful model features.' },
		{ id: 'modeling', label: 'Modeling', aliases: [], definition: 'Choose, fit, or tune predictive models.' },
		{ id: 'ensembling', label: 'Ensembling', aliases: [], definition: 'Combine predictions or models.' },
		{ id: 'experiment-tracking', label: 'Experiment tracking', aliases: [], definition: 'Record experiments, configurations, and outcomes.' },
		{ id: 'compute-efficiency', label: 'Compute efficiency', aliases: [], definition: 'Plan or reduce measured computational resources.' },
		{ id: 'submissions', label: 'Submissions', aliases: [], definition: 'Prepare, validate, and submit prediction files.' },
	],
	techniques: [
		{ id: 'out-of-fold', label: 'Out-of-fold predictions', aliases: ['OOF'], definition: 'Predictions for training rows generated without fitting on those rows.' },
		{ id: 'gradient-boosting', label: 'Gradient boosting', aliases: [], definition: 'Sequentially fit weak learners to optimize a loss.' },
		{ id: 'target-encoding', label: 'Target encoding', aliases: [], definition: 'Represent categories using target-derived statistics with leakage-safe fitting.' },
		{ id: 'test-time-augmentation', label: 'Test-time augmentation', aliases: ['TTA'], definition: 'Combine predictions across transformed inference inputs.' },
		{ id: 'groupby-aggregation', label: 'Group-by aggregation', aliases: [], definition: 'Aggregate observations by one or more entity keys.' },
		{ id: 'rank-averaging', label: 'Rank averaging', aliases: [], definition: 'Average prediction ranks rather than raw prediction values.' },
		{ id: 'stacking', label: 'Stacking', aliases: [], definition: 'Fit a model over predictions from component models.' },
		{ id: 'blending', label: 'Blending', aliases: [], definition: 'Combine model predictions using a fixed or fitted rule.' },
		{ id: 'hierarchical-reconciliation', label: 'Hierarchical reconciliation', aliases: [], definition: 'Adjust forecasts to satisfy aggregation relationships.' },
		{ id: 'stratified-cross-validation', label: 'Stratified cross-validation', aliases: [], definition: 'Estimate generalization with folds that preserve target proportions.' },
	],
} as const;

export const modalitySchema = z.enum(entries(taxonomy.modalities));
export const taskSchema = z.enum(entries(taxonomy.tasks));
export const datasetCharacteristicSchema = z.enum(entries(taxonomy.datasetCharacteristics));
export const validationStrategySchema = z.enum(entries(taxonomy.validationStrategies));
export const topicSchema = z.enum(entries(taxonomy.topics));
export const techniqueSchema = z.enum(entries(taxonomy.techniques));

