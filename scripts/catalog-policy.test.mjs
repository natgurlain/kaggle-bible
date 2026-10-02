import { renderGuideCardDetails } from '../src/content/guide-card-policy.js';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	catalogGuideMatchesRecord,
	getCatalogCardPresentation,
	readCatalogFilters,
	serializeCatalogFilters,
    serializeCatalogState,
    usesArchiveView,
    filterCatalog,
} from '../src/content/catalog-policy.js';

test('unreviewed guide metadata never upgrades a catalog card or exposes a guide link', () => {
	for (const editorialStatus of ['queued', 'in-progress', 'in-review']) {
		assert.deepEqual(
			getCatalogCardPresentation({
				completeness_level: '2',
				completeness_label: 'evidence-map',
				editorial_status: editorialStatus,
				guide_slug: 'home-credit-default-risk',
			}),
			{ completenessLevel: '1', completenessLabel: 'Catalog', guideHref: null },
		);
	}
});

test('Level 2 and Level 3 appear only for published entries with a guide route', () => {
	assert.deepEqual(
		getCatalogCardPresentation({
			completeness_level: '2',
			editorial_status: 'published',
			guide_slug: 'home-credit-default-risk',
			reviewed_by: 'GPT-6 Luna Max',
			reviewed_at: '2026-09-23',
		}),
		{
			completenessLevel: '2',
			completenessLabel: 'Evidence map',
			guideHref: '/competitions/home-credit-default-risk/',
		},
	);
	assert.deepEqual(
		getCatalogCardPresentation({
			completeness_level: '3',
			editorial_status: 'published',
			guide_slug: 'm5-forecasting-accuracy',
			reviewed_by: 'GPT-6 Luna Max',
			reviewed_at: '2026-09-23',
		}),
		{
			completenessLevel: '3',
			completenessLabel: 'Full guide',
			guideHref: '/competitions/m5-forecasting-accuracy/',
		},
	);
});

test('missing guide route keeps even a published Level 2 entry at Guide pending', () => {
	assert.deepEqual(
		getCatalogCardPresentation({
			completeness_level: '2',
			editorial_status: 'published',
			guide_slug: '',
	}),
	{ completenessLevel: '1', completenessLabel: 'Catalog', guideHref: null },
	);
});

test('published evidence guides require valid evidence-review metadata', () => {
	for (const receipt of [
		{},
		{ reviewed_by: 'GPT-6 Luna Max', reviewed_at: '' },
		{ reviewed_by: 'GPT-6 Luna Max', reviewed_at: '2026-02-30' },
	]) {
		assert.deepEqual(
			getCatalogCardPresentation({
				completeness_level: '2',
				editorial_status: 'published',
				guide_slug: 'home-credit-default-risk',
				...receipt,
			}),
			{ completenessLevel: '1', completenessLabel: 'Catalog', guideHref: null },
		);
	}
});

test('catalog guide mapping must match the exact Meta Kaggle competition identity', () => {
	const homeCreditRow = { id: '9120', slug: 'home-credit-default-risk', guide_slug: 'home-credit-default-risk' };
	const homeCreditGuide = { meta_kaggle_id: '9120', kaggle_slug: 'home-credit-default-risk', slug: 'home-credit-default-risk' };
	const m5Row = { id: '18599', slug: 'm5-forecasting-accuracy', guide_slug: 'm5-forecasting-accuracy' };
	const m5Guide = { meta_kaggle_id: '18599', kaggle_slug: 'm5-forecasting-accuracy', slug: 'm5-forecasting-accuracy' };

	assert.equal(catalogGuideMatchesRecord(homeCreditRow, homeCreditGuide), true);
	assert.equal(catalogGuideMatchesRecord(m5Row, m5Guide), true);
	assert.equal(catalogGuideMatchesRecord({ ...homeCreditRow, guide_slug: m5Row.guide_slug }, m5Guide), false);
	assert.equal(catalogGuideMatchesRecord({ ...m5Row, id: homeCreditRow.id }, m5Guide), false);
	assert.equal(catalogGuideMatchesRecord({ ...homeCreditRow, slug: m5Row.slug }, homeCreditGuide), false);
});

test('catalog filters restore from and round-trip to shareable URLs', () => {
	const filters = readCatalogFilters('?q=WRMSSE+validation&category=Featured&state=closed&level=2');
	assert.deepEqual(filters, {
		query: 'WRMSSE validation',
		category: 'Featured',
		state: 'closed',
		level: '2',
	});
	assert.equal(serializeCatalogFilters(filters), 'q=WRMSSE+validation&category=Featured&state=closed&level=2');
	assert.equal(serializeCatalogFilters({ query: '  ', category: '', state: '', level: '' }), '');
});

test('the catalog page uses the shared publication and URL filter policies', async () => {
	const page = await readFile(new URL('../src/pages/competitions/index.astro', import.meta.url), 'utf8');
	assert.match(page, /getCatalogCardPresentation\(competition\)/);
	assert.match(page, /readCatalogFilters\(window\.location\.search\)/);
	assert.match(page, /serializeCatalogState\(/);
});

const publishedTitanic = {
 id: '1', title: 'Titanic', slug: 'titanic', category: 'Getting Started', record_state: 'active',
 completeness_level: '2', editorial_status: 'published', guide_slug: 'titanic',
 reviewed_by: 'GPT-6 Luna Max', reviewed_at: '2026-10-01',
};
const rows = [publishedTitanic,
 {...publishedTitanic, id: '2', title: 'Titanic archive', editorial_status: 'queued'},
 {...publishedTitanic, id: '3', title: 'Titanic draft', editorial_status: 'in-review'},
 {...publishedTitanic, id: '4', title: 'House Prices', slug: 'house-prices', guide_slug: 'house-prices'},
];

test('typing, filtering and clearing never widen available-guide scope', () => {
 for (const query of ['T', 'Ti', 'Tit', 'Titanic', '']) {
  const filters = {query, category: '', state: '', level: ''};
  const url = serializeCatalogState(filters, false);
  assert.equal(usesArchiveView(url), false);
  const restored = readCatalogFilters(url);
  assert.deepEqual(filterCatalog(rows, restored, usesArchiveView(url)).map(row=>row.id), query ? ['1'] : ['1', '4']);
 }
 for (const search of ['?category=Getting+Started', '?state=active', '?level=2', '?page=2&q=Titanic']) {
  assert.equal(usesArchiveView(search), false);
 }
});

test('only an explicit archive action widens scope and retains filters', () => {
 const filters = {query:'Titanic', category:'Getting Started', state:'active', level:''};
 const url = serializeCatalogState(filters, true, 2);
 assert.equal(usesArchiveView(url), true);
 assert.equal(new URLSearchParams(url).get('page'), '2');
 assert.deepEqual(readCatalogFilters(url), filters);
 assert.deepEqual(filterCatalog(rows, readCatalogFilters(url), true).map(row=>row.id), ['1', '2', '3']);
 assert.equal(new URLSearchParams(serializeCatalogState(filters, false, 2)).has('page'), false);
 assert.deepEqual(filterCatalog(rows, {...filters, level:'2'}, true).map(row=>row.id), ['1']);
});

test('guide-empty results remain empty until archive is explicitly selected', () => {
 const archiveOnly = {...publishedTitanic, title:'Unpublished lesson', editorial_status:'draft'};
 const filters = {query:'Unpublished', category:'', state:'', level:''};
 assert.deepEqual(filterCatalog([archiveOnly], filters, false), []);
 assert.deepEqual(filterCatalog([archiveOnly], filters, true), [archiveOnly]);
});

// Execute the page's real event handlers with a deterministic DOM, history and fetch.
// This catches wiring errors that URL-policy-only tests cannot see.
async function catalogPageHarness(fetchRequest) {
 const { default: ts } = await import('typescript');
 const { runInNewContext } = await import('node:vm');
 const { compactCatalog, expandCatalog, paginateCatalog } = await import('../src/content/discovery-index.js');
 const { createLatestTask } = await import('../src/content/loading-policy.js');
 const source = await readFile(new URL('../src/pages/competitions/index.astro', import.meta.url), 'utf8');
 const script = source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace(/import[\s\S]*?from ['"][^'"]+['"];\s*/g, '');
 const archive = [publishedTitanic, rows[3], ...Array.from({length: 249}, (_,index) => ({...rows[1], id:String(index+5)}))];
 class Element {
  value = ''; hidden = false; disabled = false; textContent = ''; innerHTML = ''; dataset = {}; attrs = {}; listeners = {};
  addEventListener(event, callback) { this.listeners[event] = callback; }
  setAttribute(name,value) { this.attrs[name] = value; }
  getAttribute(name) { return this.attrs[name]; }
  emit(event) { this.listeners[event]?.(); }
 }
 const elements = Object.fromEntries(['query','category','state','level','summary','results','published-guides','result-region','retry','pagination','previous','next','last','page-label','guide-records','archive-view','guide-view'].map(id=>['#'+id,new Element()]));
 elements['#guide-records'].textContent = JSON.stringify([publishedTitanic, rows[3]]);
 const cards = [publishedTitanic, rows[3]].map(row=> {
  const card = new Element();
  card.querySelector = () => ({getAttribute:()=>getCatalogCardPresentation(row).guideHref});
  return card;
 });
 elements['#published-guides'].querySelectorAll = () => cards;
 elements['.catalog-shell'] = {dataset:{catalogAsset:'/data/competition-discovery.json'}};
 const location = new URL('http://local.test/competitions/');
 const entries = [location.href]; let cursor = 0;
 const listeners = {};
 const setUrl = url => { location.href = new URL(url,location).href; };
 const history = {
  pushState(_state,_title,url) { entries.splice(cursor+1); setUrl(url); entries.push(location.href); cursor++; },
  replaceState(_state,_title,url) { setUrl(url); entries[cursor] = location.href; },
  go(delta) { cursor += delta; setUrl(entries[cursor]); listeners.popstate(); },
 };
 const timers = new Map(); let timerId = 0; let fetchCount = 0;
 runInNewContext(ts.transpileModule(script, {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText, {
  document:{querySelector:selector=>elements[selector], documentElement:{dataset:{}}},
  window:{location,history,addEventListener:(event,callback)=>{listeners[event]=callback;}}, location,
  URLSearchParams, Intl, Date, setTimeout:callback=>{timers.set(++timerId,callback);return timerId;}, clearTimeout:id=>timers.delete(id),
  fetch:async()=>{fetchCount++; if (fetchRequest) await fetchRequest(fetchCount); return {ok:true,json:async()=>compactCatalog(archive,'2026-10-02')};},
  createLatestTask, expandCatalog, paginateCatalog, getCatalogCardPresentation, readCatalogFilters, serializeCatalogState, usesArchiveView, filterCatalog, renderGuideCardDetails,
 });
 const flush = async()=>{ for(const callback of [...timers.values()]) {timers.clear();callback();} await new Promise(resolve=>setImmediate(resolve)); };
 return {elements,cards,entries,location,history,flush,fetchCount:()=>fetchCount};
}

test('page handlers group typing and restore guide query/filter/results through Back and Forward', async()=>{
 const h = await catalogPageHarness();
 const {elements:e} = h;
 assert.equal(e['#summary'].textContent,'Showing 1–2 of 2 available guides.');
 for(const value of ['T','Ti','Titanic']) {e['#query'].value=value;e['#query'].emit('input');}
 assert.equal(h.entries.length,1,'keystrokes must not replace or append committed history');
 assert.equal(h.location.search,'');
 await h.flush();
 assert.equal(h.entries.length,2);
 assert.equal(h.location.search,'?q=Titanic');
 assert.equal(e['#summary'].textContent,'Showing 1–1 of 1 available guides.');
 assert.deepEqual(h.cards.map(card=>card.hidden),[false,true]);
 e['#category'].value='Featured';e['#category'].emit('change');
 assert.equal(h.entries.length,3);
 assert.equal(e['#summary'].textContent,'No available guides match these filters.');
 assert.match(e['#results'].innerHTML,/view=all/);
 h.history.go(-1);await h.flush();
 assert.equal(e['#query'].value,'Titanic');assert.equal(e['#category'].value,'');
 assert.equal(e['#summary'].textContent,'Showing 1–1 of 1 available guides.');
 h.history.go(1);await h.flush();
 assert.equal(e['#category'].value,'Featured');
 assert.equal(e['#summary'].textContent,'No available guides match these filters.');
 assert.equal(h.entries.length,3,'restoring history must not append entries');
 assert.equal(h.fetchCount(),0,'guide filtering must not request the archive');
 e['#category'].value='';e['#category'].emit('change');
 e['#query'].value='';e['#query'].emit('input');await h.flush();
 assert.equal(e['#summary'].textContent,'Showing 1–2 of 2 available guides.');
 h.history.go(-1);await h.flush();
 assert.equal(e['#query'].value,'Titanic');
 assert.equal(e['#summary'].textContent,'Showing 1–1 of 1 available guides.');
 h.history.go(1);await h.flush();
 assert.equal(e['#query'].value,'');
 assert.deepEqual(h.cards.map(card=>card.hidden),[false,false]);
});

test('page handlers retain explicit archive scope and restore archive counts/pages in both directions',async()=>{
 const h=await catalogPageHarness(), e=h.elements;
 // Following a scope link performs browser navigation, represented here by its URL.
 h.history.pushState({},'',e['#archive-view'].href);h.history.go(0);await h.flush();
 assert.equal(h.fetchCount(),1);
 assert.equal(e['#summary'].textContent,'Showing 1–100 of 251 archive matches.');
 e['#next'].emit('click');
 assert.equal(e['#page-label'].textContent,'Page 2 of 3');
 assert.equal(new URLSearchParams(h.location.search).get('page'),'2');
 e['#query'].value='House';e['#query'].emit('input');await h.flush();
 assert.equal(e['#page-label'].textContent,'Page 1 of 1');
 assert.equal(e['#summary'].textContent,'Showing 1–1 of 1 archive matches.');
 h.history.go(-1);await h.flush();
 assert.equal(e['#query'].value,'');assert.equal(e['#page-label'].textContent,'Page 2 of 3');
 assert.equal(e['#summary'].textContent,'Showing 101–200 of 251 archive matches.');
 assert.equal(e['#previous'].disabled,false);assert.equal(e['#next'].disabled,false);
 h.history.go(1);await h.flush();
 assert.equal(e['#query'].value,'House');assert.equal(e['#page-label'].textContent,'Page 1 of 1');
 assert.equal(e['#summary'].textContent,'Showing 1–1 of 1 archive matches.');
 assert.equal(usesArchiveView(h.location.search),true);
 assert.equal(h.entries.length,4);
 h.history.go(-3);await h.flush();
 assert.equal(usesArchiveView(h.location.search),false);
 assert.equal(e['#guide-view'].attrs['aria-current'],'page');
 assert.equal(e['#summary'].textContent,'Showing 1–2 of 2 available guides.');
 h.history.go(3);await h.flush();
 assert.equal(usesArchiveView(h.location.search),true);
 assert.equal(e['#query'].value,'House');
 assert.equal(e['#summary'].textContent,'Showing 1–1 of 1 archive matches.');
 assert.equal(h.fetchCount(),1);
});


test('history restoration cancels a pending archive result and its late failure',async()=>{
 let reject;
 const delayed = new Promise((_resolve,onReject)=>{reject=onReject;});
 const h=await catalogPageHarness(count=>count===1 ? delayed : Promise.resolve()), e=h.elements;
 h.history.pushState({},'',e['#archive-view'].href);h.history.go(0);await h.flush();
 assert.equal(e['#result-region'].attrs['aria-busy'],'true');
 e['#query'].value='Titanic';e['#query'].emit('input');
 h.history.go(-1);await h.flush();
 assert.equal(e['#summary'].textContent,'Showing 1–2 of 2 available guides.');
 assert.equal(e['#result-region'].attrs['aria-busy'],'false');
 reject(new Error('late offline failure'));await h.flush();
 assert.equal(e['#summary'].textContent,'Showing 1–2 of 2 available guides.');
 assert.equal(e['#retry'].hidden,true);
 h.history.go(1);await h.flush();
 assert.equal(e['#summary'].textContent,'Showing 1–100 of 251 archive matches.');
 assert.equal(h.fetchCount(),2);
});


test('scope links capture the latest typed query before the debounce commits history',async()=>{
 const h=await catalogPageHarness(), e=h.elements;
 e['#query'].value='Titanic';e['#query'].emit('input');
 assert.equal(h.entries.length,1);
 assert.equal(h.location.search,'');
 assert.equal(new URLSearchParams(e['#archive-view'].href).get('q'),'Titanic');
 assert.equal(new URLSearchParams(e['#guide-view'].href).get('q'),'Titanic');
 // Follow the archive link immediately, without flushing the pending typing timer.
 h.history.pushState({},'',e['#archive-view'].href);h.history.go(0);await h.flush();
 assert.equal(e['#query'].value,'Titanic');
 assert.equal(usesArchiveView(h.location.search),true);
 assert.equal(e['#summary'].textContent,'Showing 1–100 of 250 archive matches.');
 assert.equal(h.entries.length,2);
});
