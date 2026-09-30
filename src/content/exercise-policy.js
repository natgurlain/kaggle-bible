export function exerciseReceiptErrors(metadata, receipt, digest) {
 const errors=[];
 if (receipt.schema_version !== 1 || receipt.exercise !== metadata.slug) errors.push('receipt identity does not match exercise');
 if (!/^[a-f0-9]{64}$/.test(receipt.data_sha256 ?? '')) errors.push('data fingerprint is missing');
 if (receipt.script_sha256 !== digest) errors.push('script changed after execution');
 if (receipt.data_scope !== metadata.data_scope) errors.push('data scope does not match recorded run');
 const date = /^\d{4}-\d{2}-\d{2}$/.test(receipt.executed_at ?? '') ? new Date(receipt.executed_at+'T00:00:00Z') : null;
 if (!date || Number.isNaN(date.valueOf()) || date.toISOString().slice(0,10)!==receipt.executed_at || !receipt.python || !receipt.platform || !receipt.dependencies) errors.push('execution environment or date is missing');
 if (!Number.isInteger(receipt.seed) || typeof receipt.split_definition!=='string' || !receipt.split_definition.trim()) errors.push('seed or fixed split definition is missing');
 if (!receipt.metric || !['minimize','maximize'].includes(receipt.direction) || !Array.isArray(receipt.fold_results) || !receipt.fold_results.length) errors.push('metric or split results are missing');
 if (!receipt.aggregate || !Object.keys(receipt.aggregate).length || Object.values(receipt.aggregate).some(value=>typeof value!=='number' || !Number.isFinite(value))) errors.push('finite measured results are missing');
 for (const key of ['wall_seconds','peak_python_memory_bytes']) if (typeof receipt[key] !== 'number' || !Number.isFinite(receipt[key]) || receipt[key] < 0) errors.push('measured resources are missing');
 if (!Array.isArray(receipt.limitations) || !receipt.limitations.length) errors.push('execution limits are missing');
 return errors;
}
