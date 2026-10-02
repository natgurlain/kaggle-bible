import catalog from '../../../public/data/competition-catalog.json';
import { type CollectionEntry } from 'astro:content';
import { learningLibrary } from '../../content/learning-library';
import { compactCatalog } from '../../content/discovery-index.js';
import manifest from '../../../data/competition-inventory.manifest.json';
export async function GET() {
 const library=await learningLibrary();
 const guides=new Map<string,CollectionEntry<'competitions'>['data']>(library.guides.map(entry=>[entry.data.kaggle_slug,entry.data]));
 const cards=new Map(library.guideCards.map(card=>[card.kaggle_slug,card]));
 const rows = catalog;
 const reconciled = rows.map((row: Record<string,string>) => {
  const guide = guides.get(row.slug);
  if (!guide || String(guide.meta_kaggle_id) !== String(row.id)) return {...row,slug:row.slug,editorial_status:'unstarted',guide_slug:'',completeness_level:'1',completeness_label:'Catalog',reviewed_by:'',reviewed_at:''};
  return {...row,slug:row.slug,guide_slug:guide.slug,editorial_status:guide.editorial_status,completeness_level:String(guide.kaggle_bible_completeness_level),reviewed_by:guide.reviewed_by,reviewed_at:guide.reviewed_at};
 });
 return new Response(JSON.stringify({...compactCatalog(reconciled,manifest.inventory.snapshot_date),guide_cards:Object.fromEntries(reconciled.filter(row=>row.guide_slug && cards.has(row.slug)).map(row=>[row.slug,cards.get(row.slug)]))}),{headers:{'Content-Type':'application/json'}});
}
