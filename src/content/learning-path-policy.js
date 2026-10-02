import { projectReadiness, projectReadinessLabels } from './exercise-policy.js';

const lessons = [
 {slug:'titanic',group:'core',title:'1. Titanic: learn the validation loop',before:'Start with a binary target, accuracy, and separate training and validation rows.',explain:'Explain why held-out labels cannot determine a passenger rule, and what the fixture cannot establish about real passengers.'},
 {slug:'house-prices-advanced-regression-techniques',group:'core',title:'2. House Prices: change the target and error',before:'After Titanic, explain the fixed split and train-only fitting before moving from classification to regression.',explain:'Explain log-price error, how neighborhood statistics fit training rows only, and why the same folds are needed for the comparison.'},
 {slug:'nlp-getting-started',group:'core',title:'3. Disaster Tweets: change the representation',before:'After House Prices, explain the baseline and one controlled change before introducing text features.',explain:'Explain where vocabulary is fitted, what word pairs change, and why generated template text does not establish real tweet quality.'},
 {slug:'digit-recognizer',group:'vision',title:'Vision branch: Digit Recognizer',before:'After the core validation loop, read flattened image arrays, class means and vector length.',explain:'Explain the 784-pixel shape check, training-only class centroids, zero-vector handling and the limits of a generated-pattern split.'},
 {slug:'m5-forecasting-accuracy',group:'forecast',title:'Forecasting progression: M5',before:'After the core loop, distinguish past information, forecast horizons and time-based validation.',explain:'Explain why future observations cannot enter either method, how the same 28-day windows compare forecasts, and why this fixture is not an M5 system.'},
];
const scopes={'generated-teaching-fixture':'generated teaching fixture','open-teaching-data':'open teaching data','competition-data':'competition data'};

// The caller supplies the validated public library. Drafts still fail closed here.
export function learningPathSteps(guides, exercises) {
 return lessons.map(lesson=>{
  const guide=guides.find(x=>x.data.slug===lesson.slug && x.data.status==='published');
  const candidates=guide ? exercises.filter(({entry})=>entry.data.status==='published' && (entry.data.competition_id.id ?? entry.data.competition_id)===guide.id) : [];
  const ready=candidates.filter(({entry})=>['runnable','actual-data-verified'].includes(projectReadiness(entry.data)));
  const verified=ready.find(({entry})=>projectReadiness(entry.data)==='actual-data-verified');
  const primary=verified ?? ready[0];
  const project=primary ? {
   id:primary.entry.id,href:`/competitions/${lesson.slug}/#exercise-${primary.entry.data.slug}`,
   title:primary.entry.data.title,outcome:primary.entry.data.project?.outcome ?? primary.entry.data.summary,
   prerequisites:primary.entry.data.project?.prerequisites ?? [],
   readiness:projectReadiness(primary.entry.data),scope:scopes[primary.entry.data.data_scope],
   label:projectReadinessLabels[projectReadiness(primary.entry.data)],
   baseline:primary.entry.data.project?.baseline,change:primary.entry.data.project?.controlled_change,
  } : null;
  const blocked=candidates.find(({entry})=>entry.data.data_scope!=='generated-teaching-fixture' && entry.data.project?.blocker)?.entry.data.project.blocker;
  return {...lesson,guide_href:guide ? `/competitions/${lesson.slug}/` : null,project,
   actual_data_verified:Boolean(verified),
   actual_status:verified ? 'Actual-data verified for its recorded input and evaluation scope; explain its limits before advancing.' : 'Actual-data project unavailable: authorized local inputs and a reviewed safe execution receipt are still required.',
   actual_blocker:blocked ? `${blocked.reason} Owner: ${blocked.owner} Next action: ${blocked.next_action}` : null,
  };
 });
}
