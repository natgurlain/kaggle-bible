import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,readdir} from 'node:fs/promises';
import {parse} from 'yaml';
import {guideCardMetadata,renderGuideCardDetails} from '../src/content/guide-card-policy.js';
import {loadExerciseArtifacts} from '../src/content/project-artifacts.js';
const guides=await Promise.all((await readdir('src/content/competitions')).filter(x=>x.endsWith('.md')).map(async name=>{
 const raw=await readFile('src/content/competitions/'+name,'utf8');const data=parse(raw.match(/^---\n([\s\S]*?)\n---/)[1]);return {id:data.id,data};
}));
const exercises=await Promise.all((await readdir('src/content/exercises')).filter(x=>x.endsWith('.json')).map(async name=>{
 const data=JSON.parse(await readFile('src/content/exercises/'+name));const {receipt}=await loadExerciseArtifacts(data);return {entry:{id:data.id,data},receipt};
}));
test('all six authored guide cards have distinct outcomes and preserve actual-data access gaps',()=>{
 const cards=guides.map(guide=>guideCardMetadata(guide,exercises));
 assert.equal(cards.length,6);assert.equal(new Set(cards.map(card=>card.outcome)).size,6);
 for(const card of cards){assert.ok(card.prerequisites.length);assert.match(card.actual_data_access.url,/^https:\/\/www.kaggle.com\/competitions\/[^/]+\/data$/);assert.match(card.actual_data_access.instructions,/authorized/);assert.equal(card.actual_data_verified,false);}
 const credit=cards.find(card=>card.kaggle_slug==='home-credit-default-risk');assert.equal(credit.projects.length,0);assert.match(credit.readiness,/Guide only/);assert.match(renderGuideCardDetails(credit),/Unknown; no executed learner project/);
 assert.equal(cards.reduce((sum,card)=>sum+card.projects.length,0),5);
});
test('card resources come exclusively from the matching receipt and retain fixture and memory measurement scope',()=>{
 const guide=guides.find(guide=>guide.data.slug==='titanic');const card=guideCardMetadata(guide,exercises);const receipt=exercises.find(x=>x.entry.data.competition_id===guide.id).receipt;
 assert.equal(card.projects[0].measured.wall_seconds,receipt.wall_seconds);assert.equal(card.projects[0].measured.peak_memory_bytes,receipt.peak_memory_bytes);
 const html=renderGuideCardDetails(card);assert.match(html,/generated teaching fixture/);assert.match(html,/traced python allocations/);assert.match(html,/not a learner completion-time estimate/);assert.match(html,/Actual-data execution and its resource needs have not been verified/);
 const noReceipt=guideCardMetadata(guide,exercises.map(x=>({...x,receipt:null})));assert.match(renderGuideCardDetails(noReceipt),/Measured run resources are unknown/);
});
test('draft projects and unrelated receipts never appear in card metadata or its links',()=>{
 const guide=guides.find(guide=>guide.data.slug==='titanic');const poisoned=exercises.map(x=>({...x,entry:{...x.entry,data:{...x.entry.data,status:'draft'}}}));
 assert.equal(guideCardMetadata(guide,poisoned).projects.length,0);
 const foreign=exercises.filter(x=>x.entry.data.competition_id!==guide.id);assert.equal(guideCardMetadata(guide,foreign).projects.length,0);
 const card=guideCardMetadata(guide,exercises);assert.match(card.projects[0].href,/^\/competitions\/titanic\/#exercise-titanic-group-rules$/);
});
test('shared rendering escapes source text and both server and search renderers use the same card policy',async()=>{
 const card=guideCardMetadata(guides[0],[]);card.outcome='<script>bad()</script>';assert.match(renderGuideCardDetails(card),/&lt;script&gt;/);assert.doesNotMatch(renderGuideCardDetails(card),/<script>/);
 const [server,search,discovery,catalog]=await Promise.all(['src/components/PublishedLibrary.astro','src/pages/search.astro','src/pages/data/competition-discovery.json.ts','src/pages/competitions/index.astro'].map(path=>readFile(path,'utf8')));
 assert.match(server,/renderGuideCardDetails/);assert.match(search,/renderGuideCardDetails/);assert.match(discovery,/guide_cards/);assert.match(catalog,/presentation.guideHref \? renderGuideCardDetails/);assert.doesNotMatch(discovery,/learning_card:.*catalog/);
});
