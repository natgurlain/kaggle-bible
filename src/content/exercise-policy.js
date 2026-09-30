export function exerciseReceiptErrors(metadata, receipt, digest, dataDigest) {
 const errors=[];
 if (receipt.schema_version !== 1 || receipt.exercise !== metadata.slug) errors.push('receipt identity does not match exercise');
 if (!/^[a-f0-9]{64}$/.test(receipt.data_sha256 ?? '') || receipt.data_sha256 !== dataDigest) errors.push('data fingerprint does not match the recorded input artifact');
 if (receipt.script_sha256 !== digest) errors.push('script changed after execution');
 if (receipt.data_scope !== metadata.data_scope) errors.push('data scope does not match recorded run');
 const date = /^\d{4}-\d{2}-\d{2}$/.test(receipt.executed_at ?? '') ? new Date(receipt.executed_at+'T00:00:00Z') : null;
 if (!date || Number.isNaN(date.valueOf()) || date.toISOString().slice(0,10)!==receipt.executed_at || !receipt.python || !receipt.platform || !receipt.dependencies) errors.push('execution environment or date is missing');
 if (!Number.isInteger(receipt.seed) || typeof receipt.split_definition!=='string' || !receipt.split_definition.trim()) errors.push('seed or fixed split definition is missing');
 for (const [field,declared] of [['python',metadata.python_version],['dependencies',metadata.dependencies],['seed',metadata.seed],['split_definition',metadata.split_definition],['metric',metadata.metric],['direction',metadata.direction],['memory_scope',metadata.memory_scope]]) if(receipt[field]!==declared) errors.push(`${field} does not match declared execution conditions`);
 if (!['traced-python-allocations','process-peak-rss'].includes(receipt.memory_scope)) errors.push('memory measurement scope is missing');
 if (!receipt.metric || !['minimize','maximize'].includes(receipt.direction) || !Array.isArray(receipt.fold_results) || !receipt.fold_results.length) errors.push('metric or split results are missing');
 if (!receipt.aggregate || !Object.keys(receipt.aggregate).length || Object.values(receipt.aggregate).some(value=>typeof value!=='number' || !Number.isFinite(value))) errors.push('finite measured results are missing');
 const methods=Object.keys(receipt.aggregate ?? {});
 const splits=Array.isArray(receipt.fold_results) ? receipt.fold_results : [];
 const validSplits=splits.length && splits.every(row=>row && typeof row.split==='string' && row.split.trim() && Number.isInteger(row.train_size) && row.train_size>0 && Number.isInteger(row.validation_size) && row.validation_size>0 && row.metrics && Object.keys(row.metrics).length===methods.length && methods.every(method=>typeof row.metrics[method]==='number' && Number.isFinite(row.metrics[method])));
 if(!validSplits) errors.push('per-split counts and measured metric values are missing');
 else for(const method of methods) if(Math.abs(splits.reduce((total,row)=>total+row.metrics[method],0)/splits.length-receipt.aggregate[method])>1e-12) errors.push('aggregate does not match the unweighted mean of split results');
 for (const key of ['wall_seconds','peak_memory_bytes']) if (typeof receipt[key] !== 'number' || !Number.isFinite(receipt[key]) || receipt[key] < 0) errors.push('measured resources are missing');
 if (!Array.isArray(receipt.limitations) || !receipt.limitations.length) errors.push('execution limits are missing');
 return errors;
}
