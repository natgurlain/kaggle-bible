import catalog from '../../../public/data/competition-catalog.json';
import { getCollection, type CollectionEntry } from 'astro:content';
import { compactCatalog } from '../../content/discovery-index.js';
import { filterPublicGuides } from '../../content/publication-policy.js';
import manifest from '../../../data/competition-inventory.manifest.json';
export async function GET() {
 const [competitions,solutions,sources,practices] = await Promise.all([getCollection('competitions'),getCollection('solutions'),getCollection('sources'),getCollection('practices')]);
 const context = {solutions:new Map(solutions.map(x=>[x.id,x])),sources:new Map(sources.map(x=>[x.id,x])),practices:new Map(practices.map(x=>[x.id,x]))};
 const guides = new Map<string,CollectionEntry<'competitions'>['data']>(filterPublicGuides(competitions,context).map((entry: CollectionEntry<'competitions'>) => [entry.data.kaggle_slug,entry.data]));
 const rows = catalog;
 const reconciled = rows.map((row: Record<string,string>) => {
  const guide = guides.get(row.slug);
  if (!guide || String(guide.meta_kaggle_id) !== String(row.id)) return {...row,editorial_status:'unstarted',guide_slug:'',completeness_level:'1',completeness_label:'Catalog',reviewed_by:'',reviewed_at:''};
  return {...row,guide_slug:guide.slug,editorial_status:guide.editorial_status,completeness_level:String(guide.kaggle_bible_completeness_level),reviewed_by:guide.reviewed_by,reviewed_at:guide.reviewed_at};
 });
 return new Response(JSON.stringify(compactCatalog(reconciled,manifest.inventory.snapshot_date)),{headers:{'Content-Type':'application/json'}});
}
