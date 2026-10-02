export function exerciseReceiptErrors(metadata, receipt, digest, dataDigest) {
 const errors=[];
 if (receipt.schema_version !== 1 || receipt.exercise !== metadata.slug) errors.push('receipt identity does not match exercise');
 if (!/^[a-f0-9]{64}$/.test(receipt.data_sha256 ?? '') || receipt.data_sha256 !== dataDigest) errors.push('data fingerprint does not match the recorded input artifact');
 if (receipt.script_sha256 !== digest) errors.push('script changed after execution');
 if (receipt.data_scope !== metadata.data_scope) errors.push('data scope does not match recorded run');
 const date = /^\d{4}-\d{2}-\d{2}$/.test(receipt.executed_at ?? '') ? new Date(receipt.executed_at+'T00:00:00Z') : null;
 if (!date || Number.isNaN(date.valueOf()) || date.toISOString().slice(0,10)!==receipt.executed_at || !receipt.python || !receipt.platform || !receipt.dependencies) errors.push('execution environment or date is missing');
 if (!Number.isInteger(receipt.seed) || typeof receipt.split_definition!=='string' || !receipt.split_definition.trim()) errors.push('seed or fixed split definition is missing');
 for (const [field,declared] of [['platform',metadata.platform],['python',metadata.python_version],['dependencies',metadata.dependencies],['seed',metadata.seed],['split_definition',metadata.split_definition],['metric',metadata.metric],['direction',metadata.direction],['memory_scope',metadata.memory_scope]]) if(receipt[field]!==declared) errors.push(`${field} does not match declared execution conditions`);
 if (!['traced-python-allocations','process-peak-rss'].includes(receipt.memory_scope)) errors.push('memory measurement scope is missing');
 if (!receipt.metric || !['minimize','maximize'].includes(receipt.direction) || !Array.isArray(receipt.fold_results) || !receipt.fold_results.length) errors.push('metric or split results are missing');
 if (!receipt.aggregate || !Object.keys(receipt.aggregate).length || Object.values(receipt.aggregate).some(value=>typeof value!=='number' || !Number.isFinite(value))) errors.push('finite measured results are missing');
 const methods=Object.keys(receipt.aggregate ?? {});
 const splits=Array.isArray(receipt.fold_results) ? receipt.fold_results : [];
 const expected=metadata.expected_splits;
 if(!Array.isArray(expected) || !expected.length || new Set(expected).size!==expected.length || splits.length!==expected.length || new Set(splits.map(row=>row?.split)).size!==splits.length || !expected.every(id=>splits.some(row=>row?.split===id))) errors.push('split identifiers do not uniquely cover the declared run');
 const validSplits=splits.length && splits.every(row=>row && typeof row.split==='string' && row.split.trim() && Number.isInteger(row.train_size) && row.train_size>0 && Number.isInteger(row.validation_size) && row.validation_size>0 && row.metrics && Object.keys(row.metrics).length===methods.length && methods.every(method=>typeof row.metrics[method]==='number' && Number.isFinite(row.metrics[method])));
 if(!validSplits) errors.push('per-split counts and measured metric values are missing');
 else for(const method of methods) if(Math.abs(splits.reduce((total,row)=>total+row.metrics[method],0)/splits.length-receipt.aggregate[method])>1e-12) errors.push('aggregate does not match the unweighted mean of split results');
 for (const key of ['wall_seconds','peak_memory_bytes']) if (typeof receipt[key] !== 'number' || !Number.isFinite(receipt[key]) || receipt[key] < 0) errors.push('measured resources are missing');
 if (!Array.isArray(receipt.limitations) || !receipt.limitations.length) errors.push('execution limits are missing');
 return errors;
}

export const projectReadinessLabels = Object.freeze({planned:'Planned',runnable:'Runnable', 'actual-data-verified':'Actual-data verified',blocked:'Blocked'});
/** @returns {keyof typeof projectReadinessLabels} */
export function projectReadiness(metadata) { return metadata.project?.readiness ?? 'runnable'; }
const text = value => typeof value==='string' && value.trim().length>0;
const hash = value => /^[a-f0-9]{64}$/.test(value ?? '');
export const safeProjectAsset = value => /^\/exercises\/[a-z0-9-]+\.(?:py|ipynb|txt|json)$/.test(value ?? '');
export function projectTransitionErrors(previous,next) {
 const allowed={planned:['planned','runnable','blocked'],runnable:['runnable','actual-data-verified','blocked'], 'actual-data-verified':['actual-data-verified','runnable','blocked'],blocked:['blocked','planned','runnable']};
 return allowed[previous]?.includes(next) ? [] : ['invalid project readiness transition'];
}
const exactObject = (value, allowed, required=allowed) => value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).every(key=>allowed.includes(key)) && required.every(key=>Object.hasOwn(value,key));
const actualReceiptFields = ['schema_version','exercise','data_scope','data_sha256','script_sha256','executed_at','python','platform','dependencies','seed','split_definition','metric','direction','memory_scope','fold_results','aggregate','wall_seconds','peak_memory_bytes','limitations','hardware_scope','execution_status','evidence_type','input_manifest','provenance_url','authorization','code_fingerprints','configuration','diagnostics'];
const actualRequiredFields = actualReceiptFields.filter(key=>key!=='hardware_scope');
export function actualReceiptShapeErrors(receipt, hasHelper=false) {
 const errors=[];
 if(!exactObject(receipt,actualReceiptFields,actualRequiredFields)) return ['actual-data receipt has missing or unsupported fields'];
 for(const field of ['exercise','data_scope','data_sha256','script_sha256','executed_at','python','platform','dependencies','split_definition','metric','direction','memory_scope','execution_status','evidence_type','provenance_url','authorization']) if(!text(receipt[field])) errors.push(`actual-data receipt ${field} must be text`);
 if(receipt.schema_version!==1 || !Number.isInteger(receipt.seed) || !['wall_seconds','peak_memory_bytes'].every(key=>typeof receipt[key]==='number' && Number.isFinite(receipt[key]) && receipt[key]>=0)) errors.push('actual-data receipt identity or measured resource types are invalid');
 if(receipt.hardware_scope!==undefined && !text(receipt.hardware_scope)) errors.push('hardware scope must be text');
 if(!Array.isArray(receipt.limitations) || !receipt.limitations.length || !receipt.limitations.every(text)) errors.push('receipt limitations must contain only nonempty text');
 const manifest=receipt.input_manifest;
 if(!exactObject(manifest,['kind','files']) || manifest.kind!=='fingerprint-only' || !Array.isArray(manifest.files) || !manifest.files.length || !manifest.files.every(file=>exactObject(file,['name','sha256','bytes']) && text(file.name) && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(file.name) && hash(file.sha256) && Number.isInteger(file.bytes) && file.bytes>0)) errors.push('input manifest has unsupported fields or invalid fingerprints');
 if(!exactObject(receipt.configuration,['baseline','controlled_change']) || !text(receipt.configuration.baseline) || !text(receipt.configuration.controlled_change)) errors.push('configuration has unsupported fields or missing baseline/change');
 const fingerprints=['script_sha256','notebook_sha256','environment_sha256',...(hasHelper ? ['helper_sha256'] : [])];
 if(!exactObject(receipt.code_fingerprints,fingerprints) || !fingerprints.every(key=>hash(receipt.code_fingerprints[key]))) errors.push('code fingerprints have unsupported fields or missing pins');
 if(!Array.isArray(receipt.diagnostics) || !receipt.diagnostics.length || !receipt.diagnostics.every(row=>exactObject(row,['question','path','sha256']) && text(row.question) && safeProjectAsset(row.path) && row.path.endsWith('.json') && hash(row.sha256))) errors.push('diagnostic references have unsupported fields or invalid pins');
 const methods=receipt.aggregate && typeof receipt.aggregate==='object' && !Array.isArray(receipt.aggregate) ? Object.keys(receipt.aggregate) : [];
 if(methods.length!==2 || !methods.every(key=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key) && typeof receipt.aggregate[key]==='number' && Number.isFinite(receipt.aggregate[key]))) errors.push('actual-data aggregate needs exactly two named finite method metrics');
 if(!Array.isArray(receipt.fold_results) || !receipt.fold_results.length || !receipt.fold_results.every(row=>exactObject(row,['split','train_size','validation_size','metrics']) && text(row.split) && Number.isInteger(row.train_size) && row.train_size>0 && Number.isInteger(row.validation_size) && row.validation_size>0 && exactObject(row.metrics,methods) && methods.every(key=>typeof row.metrics[key]==='number' && Number.isFinite(row.metrics[key])))) errors.push('split results have unsupported fields or invalid metrics');
 return errors;
}
// Artifacts are supplied by the filesystem/build adapter, never inferred from a URL.
export function projectContractErrors(metadata,receipt,artifacts={}) {
 const p=metadata.project; const errors=[];
 const pkg=p?.package;
 const hasHelper=pkg?.helper_path!==undefined || pkg?.helper_sha256!==undefined;
 const actualInput=receipt?.evidence_type==='actual-data' || metadata.data_scope!=='generated-teaching-fixture';
 if(actualInput && ['planned','blocked'].includes(projectReadiness(metadata)) && (metadata.data_path!==undefined || metadata.receipt_path!==undefined)) errors.push('nonfixture planned/blocked projects must omit public data and receipt artifact references');
 if(actualInput && receipt) {
  errors.push(...actualReceiptShapeErrors(receipt,hasHelper));
  if(metadata.data_scope==='generated-teaching-fixture' || receipt.data_scope!==metadata.data_scope || receipt.evidence_type!=='actual-data') errors.push('actual-data evidence and input scope must agree');
  if(artifacts.diagnostics_valid!==true) errors.push('diagnostic artifact must contain only nonempty summary, observations and limitations');
 }
 if(actualInput && (receipt || ['runnable','actual-data-verified'].includes(projectReadiness(metadata)))) {
  if(!receipt) errors.push('nonfixture runnable project needs a matching actual-data receipt');
  if(artifacts.fingerprint_only_input!==true) errors.push('actual-data inputs must use a matching fingerprint-only public artifact');
  if(artifacts.input_manifest_matches_receipt!==true) errors.push('public input manifest must exactly match the receipt input manifest');
 }
 if(!p) return errors; // Version-1 legacy generated-fixture receipts remain valid.
 const state=p.readiness;
 if(!Object.hasOwn(projectReadinessLabels,state)) errors.push('unknown project readiness');
 const history=p.readiness_history;
 if(!Array.isArray(history) || !history.length || history.at(-1)!==state || history[0]==='actual-data-verified') errors.push('readiness history must end at the current state and cannot start verified');
 else for(let i=1;i<history.length;i++) errors.push(...projectTransitionErrors(history[i-1],history[i]));
 for(const field of ['outcome','baseline','controlled_change']) if(!text(p[field])) errors.push(`project ${field} is missing`);
 for(const field of ['prerequisites','diagnostics']) if(!Array.isArray(p[field]) || !p[field].length || !p[field].every(text)) errors.push(`project ${field} is missing`);
 if(!p.access || !['public-input','private-input'].includes(p.access.redistribution) || !['instructions','provenance_url','authorization'].every(key=>text(p.access[key]))) errors.push('authorized access and provenance are missing');
 if(!/^https?:\/\//.test(p.access?.provenance_url ?? '')) errors.push('provenance must be an HTTP source URL');
 if(!Array.isArray(p.troubleshooting) || !p.troubleshooting.length || !p.troubleshooting.every(row=>text(row?.symptom)&&text(row?.recovery))) errors.push('troubleshooting and recovery are missing');
 if(!text(p.next_lesson?.title) || !text(p.next_lesson?.experiment) || !/^\/(?!\/)[a-z0-9/#-]+$/.test(p.next_lesson?.url ?? '')) errors.push('next lesson and experiment are missing');
 if(state==='blocked' && !['reason','owner','next_action'].every(key=>text(p.blocker?.[key]))) errors.push('blocked project needs reason, owner and next action');
 if(!['runnable','actual-data-verified'].includes(state)) return errors;
 if(!pkg || !safeProjectAsset(pkg.notebook_path) || !pkg.notebook_path.endsWith('.ipynb') || !safeProjectAsset(pkg.environment_path) || !pkg.environment_path.endsWith('.txt')) errors.push('pinned notebook/environment package paths are missing');
 for(const field of ['script','notebook','environment']) if(!hash(pkg?.[`${field}_sha256`]) || artifacts[`${field}_sha256`]!==pkg?.[`${field}_sha256`]) errors.push(`${field} package fingerprint is missing or stale`);
 if(!artifacts.environment_matches) errors.push('environment artifact does not match declared execution conditions');
 if(!artifacts.notebook_shared_script) errors.push('notebook must delegate all computation to the shared script');
 if(hasHelper && (!safeProjectAsset(pkg?.helper_path) || !pkg.helper_path.endsWith('.py') || !hash(pkg?.helper_sha256) || artifacts.helper_sha256!==pkg?.helper_sha256)) errors.push('declared helper path/fingerprint pair is missing or stale');
 if(receipt && actualInput && hasHelper && receipt.code_fingerprints?.helper_sha256!==pkg?.helper_sha256) errors.push('receipt helper fingerprint does not match package');
 if(state!=='actual-data-verified') return errors;
 if(metadata.data_scope==='generated-teaching-fixture') errors.push('fixture cannot be actual-data verified');
 if(!receipt || receipt.execution_status!=='succeeded' || receipt.evidence_type!=='actual-data') errors.push('successful actual-data receipt is required');
 if(!receipt) return errors;
 if(!receipt.input_manifest || receipt.input_manifest.kind!=='fingerprint-only' || !Array.isArray(receipt.input_manifest.files) || !receipt.input_manifest.files.length || !receipt.input_manifest.files.every(row=>text(row?.name)&&!/[\\/]/.test(row.name)&&hash(row.sha256)&&Number.isInteger(row.bytes)&&row.bytes>0)) errors.push('private-safe input fingerprint manifest is missing');
 if(receipt.provenance_url!==p.access?.provenance_url || !text(receipt.authorization)) errors.push('receipt provenance or authorization is missing');
 if(!receipt.configuration || Object.keys(receipt.configuration).length!==2 || receipt.configuration.baseline!==p.baseline || receipt.configuration.controlled_change!==p.controlled_change) errors.push('baseline/change configuration does not match project');
 for(const field of ['script','notebook','environment']) if(receipt.code_fingerprints?.[`${field}_sha256`]!==pkg?.[`${field}_sha256`]) errors.push('receipt package fingerprints do not match project');
 if(!Array.isArray(receipt.diagnostics) || !receipt.diagnostics.length || !p.diagnostics.every(question=>receipt.diagnostics.some(row=>row?.question===question)) || !receipt.diagnostics.every(row=>text(row?.question)&&safeProjectAsset(row.path)&&hash(row.sha256)&&artifacts.diagnostics?.[row.path]===row.sha256)) errors.push('durable diagnostic outputs are missing or stale');
 if(!metadata.receipt_path || !metadata.data_path) errors.push('verified project receipt and manifest references are required');
 return errors;
}
