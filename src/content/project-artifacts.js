import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { safeProjectAsset } from './exercise-policy.js';
const canonical = value => JSON.stringify(value, function(_key, item) { return item && typeof item==='object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))) : item; });
const sha = data => createHash('sha256').update(data).digest('hex');
export async function loadExerciseArtifacts(metadata, base='public') {
 const read = async path => {
  if(!safeProjectAsset(path)) throw new Error('unsafe project artifact path');
  return readFile(`${base}${path}`);
 };
 if(metadata.project && ['planned','blocked'].includes(metadata.project.readiness)) return {receipt:null,artifacts:{script_sha256:null,data_sha256:null}};
 const script=await read(metadata.script_path);
 const receipt=metadata.receipt_path ? JSON.parse(await read(metadata.receipt_path)) : null;
 const input=metadata.data_path ? await read(metadata.data_path) : null;
 const artifacts={script_sha256:sha(script),data_sha256:input ? sha(input) : null};
 if(metadata.project && ['runnable','actual-data-verified'].includes(metadata.project.readiness)) {
  const pkg=metadata.project.package;
  const notebook=await read(pkg.notebook_path); const environment=await read(pkg.environment_path);
  artifacts.notebook_sha256=sha(notebook); artifacts.environment_sha256=sha(environment);
  const parsed=JSON.parse(notebook); const cells=parsed.cells?.filter(cell=>cell.cell_type==='code') ?? [];
  const basename=metadata.script_path.split('/').at(-1);
  const code=cells.length===1 ? cells[0].source.join('') : '';
  // Exactly a wrapper: no second fit, split, metric, or diagnostic implementation.
  const lines=code.trimEnd().split('\n');
  let argsValid=true;
  if(lines.length===3) {
   try { const args=JSON.parse(lines[1].replace(/^sys\.argv = /,'')); argsValid=lines[1].startsWith('sys.argv = ') && Array.isArray(args) && args.length>0 && args.every(arg=>typeof arg==='string') && args[0]===basename; }
   catch { argsValid=false; }
  }
  artifacts.notebook_shared_script=[2,3].includes(lines.length) && lines[0]==='import runpy, sys' && lines.at(-1)===`runpy.run_path("${basename}", run_name="__main__")` && argsValid;
  artifacts.environment_matches=environment.toString().includes(`Python==${metadata.python_version}\n`) && environment.toString().includes(`Dependencies: ${metadata.dependencies}\n`) && environment.toString().includes(`Recorded platform: ${metadata.platform}\n`);
  artifacts.diagnostics={}; artifacts.diagnostics_valid=true;
  for(const item of receipt?.diagnostics ?? []) {
   const raw=await read(item.path); artifacts.diagnostics[item.path]=sha(raw);
   const output=JSON.parse(raw);
   if(!output || Array.isArray(output) || !Object.keys(output).every(key=>['summary','observations','limitations'].includes(key)) || typeof output.summary!=='string' || !output.summary.trim() || !['observations','limitations'].every(key=>Array.isArray(output[key]) && output[key].length && output[key].every(value=>typeof value==='string' && value.trim()))) artifacts.diagnostics_valid=false;
  }
  if(input) {
   const manifest=JSON.parse(input);
   artifacts.fingerprint_only_input=manifest.kind==='fingerprint-only' && Object.keys(manifest).every(key=>['kind','files'].includes(key)) && Array.isArray(manifest.files) && manifest.files.every(file=>Object.keys(file).every(key=>['name','sha256','bytes'].includes(key)));
   if(receipt?.input_manifest && canonical(receipt.input_manifest)!==canonical(manifest)) artifacts.fingerprint_only_input=false;
  }
 }
 return {receipt,artifacts};
}
