export const EVENT_NAME = 'kaggle-bible:learning-event';
const names = new Set(['guide_discovery', 'exercise_start', 'self_reported_completion', 'completion_withdrawn']);

// Return a newly constructed allowlisted payload; never spread caller-provided data.
export function learningEvent(name, id, known) {
  if (!names.has(name) || typeof id !== 'string') return null;
  const isGuide = name === 'guide_discovery';
  if (!(isGuide ? known.guides : known.exercises).includes(id)) return null;
  return Object.freeze({ version: 1, name, ...(isGuide ? { guide: id } : { exercise: id }) });
}

export function completionTransition(current, action) {
  if (action === 'report' && !current) return { completed: true, event: 'self_reported_completion' };
  if (action === 'undo' && current) return { completed: false, event: 'completion_withdrawn' };
  return { completed: current, event: null };
}
