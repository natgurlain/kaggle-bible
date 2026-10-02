import { projectReadiness, projectReadinessLabels } from './exercise-policy.js';
const scopeLabels={'generated-teaching-fixture':'generated teaching fixture','open-teaching-data':'open teaching data','competition-data':'competition data'};
export function guideCardMetadata(guide, exercises) {
 const data=guide.data ?? guide;
 const projects=exercises.filter(({entry})=>entry.data.status==='published' && (entry.data.competition_id.id ?? entry.data.competition_id)===data.id).map(({entry,receipt})=>{
  const exercise=entry.data;const readiness=projectReadiness(exercise);
  const measured=receipt ? {executed_at:receipt.executed_at,wall_seconds:receipt.wall_seconds,peak_memory_bytes:receipt.peak_memory_bytes,memory_scope:receipt.memory_scope,hardware_scope:receipt.hardware_scope ?? 'Hardware not recorded',python:receipt.python,platform:receipt.platform,data_scope:receipt.data_scope,receipt_href:exercise.receipt_path} : null;
  return {id:exercise.id,title:exercise.title,href:`/competitions/${data.slug}/#exercise-${exercise.slug}`,readiness,readiness_label:projectReadinessLabels[readiness],data_scope:exercise.data_scope,scope_label:scopeLabels[exercise.data_scope],outcome:exercise.project?.outcome ?? exercise.summary,prerequisites:exercise.project?.prerequisites ?? [],access:exercise.project?.access.instructions ?? 'Project input access is not recorded.',measured};
 });
 return {id:data.id,kaggle_slug:data.kaggle_slug,title:data.title,guide_href:`/competitions/${data.slug}/`,outcome:data.learning_card?.outcome ?? data.learning_goals?.[0] ?? data.summary,prerequisites:[...new Set([...(data.learning_card?.prerequisites ?? ['Prerequisites are not recorded.']),...projects.flatMap(project=>project.prerequisites)])],actual_data_access:data.learning_card?.actual_data_access ?? {instructions:'Actual-data access requirements are not recorded; check the official competition.',url:data.competition_url},projects,readiness:projects.length ? projects.map(project=>`${project.readiness_label} · ${project.scope_label}`).join('; ') : 'Guide only · actual-data execution not available',actual_data_verified:projects.some(project=>project.readiness==='actual-data-verified')};
}
const escape = value => String(value ?? '').replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderGuideCardDetails(card) {
 if(!card) return '';
 const projects=card.projects.map(project=>{
  const measured=project.measured;
  const resources=measured ? `${measured.wall_seconds.toFixed(3)} s wall time; ${(measured.peak_memory_bytes/1024/1024).toFixed(3)} MiB (${measured.memory_scope.replaceAll('-',' ')}${measured.memory_scope==='traced-python-allocations' ? '; excludes total process memory' : ''}). ${measured.hardware_scope}. Python ${measured.python}, ${measured.platform}; ${measured.executed_at}. Recorded ${project.scope_label} run only; not a learner completion-time estimate.` : 'Measured run resources are unknown.';
  return `<li><a href="${escape(project.href)}">${escape(project.title)}</a> — ${escape(project.readiness_label)} · ${escape(project.scope_label)}.<p><strong>Measured compute:</strong> ${escape(resources)}${measured ? ` <a href="${escape(measured.receipt_href)}">Run receipt</a>` : ''}</p></li>`;
 }).join('');
 return `<div class="guide-learning-details" data-guide-card="${escape(card.id)}"><p><strong>Outcome:</strong> ${escape(card.outcome)}</p><p><strong>Prerequisites:</strong> ${escape(card.prerequisites.join(' '))}</p><p><strong>Actual-data access:</strong> ${escape(card.actual_data_access.instructions)} <a href="${escape(card.actual_data_access.url)}">Official data page</a></p><p><strong>Project readiness:</strong> ${escape(card.readiness)}</p>${projects ? `<ul class="guide-projects">${projects}</ul>` : '<p><strong>Measured compute:</strong> Unknown; no executed learner project is published.</p>'}<p>${card.actual_data_verified ? 'Measured actual-data resources cover their recorded scope only.' : 'Actual-data execution and its resource needs have not been verified.'} Completion time and difficulty are unknown. Historical solution hardware is not a learner exercise budget.</p></div>`;
}
