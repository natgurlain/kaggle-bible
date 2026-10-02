import { projectReadiness } from './exercise-policy.js';
const scopeLabels={'generated-teaching-fixture':'generated teaching fixture','open-teaching-data':'open teaching data','competition-data':'competition data'};
const published=({entry})=>entry.data.status==='published';
// These presentation helpers consume learningLibrary's validated public records.
const actualVerified=project=>published(project) && projectReadiness(project.entry.data)==='actual-data-verified' && project.entry.data.data_scope!=='generated-teaching-fixture' && project.receipt?.data_scope===project.entry.data.data_scope && project.receipt?.evidence_type==='actual-data' && project.receipt?.execution_status==='succeeded';

export function libraryEvidenceCounts(library) {
 return {guides:library.guides.filter(x=>x.data.status==='published').length,
  fixtures:library.exercises.filter(x=>published(x) && x.entry.data.data_scope==='generated-teaching-fixture' && x.receipt?.data_scope==='generated-teaching-fixture').length,
  actual:library.exercises.filter(actualVerified).length,
  approaches:library.solutions.length,practices:library.practices.length};
}
export function recommendedFirstProject(library) {
 const guide=library.guides.find(x=>x.data.status==='published' && x.data.slug==='titanic');
 if(!guide) return null;
 const candidates=library.exercises.filter(x=>published(x) && (x.entry.data.competition_id.id ?? x.entry.data.competition_id)===guide.id);
 const selected=candidates.find(actualVerified) ?? candidates.find(x=>projectReadiness(x.entry.data)==='runnable' && x.entry.data.data_scope==='generated-teaching-fixture' && x.receipt?.data_scope==='generated-teaching-fixture');
 if(!selected) return null;
 const data=selected.entry.data;const actual=actualVerified(selected);
 return {id:selected.entry.id,actual,title:actual ? 'First project: Titanic' : 'Titanic fixture warmup',
  label:actual ? `Actual-data verified · ${scopeLabels[data.data_scope]}` : 'Runnable · generated teaching fixture',
  href:`/competitions/${guide.data.slug}/#exercise-${data.slug}`,
  outcome:data.project?.outcome ?? data.summary,
  requirements:[data.environment,...(data.project?.prerequisites ?? []),data.project?.access.authorization].filter(Boolean).join(' '),
  action:actual ? 'Start the verified project' : 'Start the fixture warmup',
  limit:actual ? 'Verification covers this recorded input and evaluation scope; it does not establish a competition score or reader learning.' : 'This fixture teaches the workflow. Actual Titanic execution remains unverified; generated passengers are separate from competition data.',
 };
}
