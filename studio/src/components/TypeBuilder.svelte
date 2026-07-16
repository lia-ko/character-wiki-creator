<script>
  import { app, curProject, openProject, touchCustomTypes, deleteCustomType, confirmDelete, exportType } from '../lib/store.svelte.js';
  import { ENTRY_TYPES, templateFor } from '../lib/templates.js';
  import { FEATURE_GROUPS, FEATURE_BY_TYPE, LAYOUTS, layoutId, sectionFromFeature, configFor } from '../lib/features.js';
  import { dismissable } from '../lib/dismissable.js';
  import { createEntry } from '../lib/model.js';
  import { renderEntry, docShell } from '../lib/render.js';
  import { readerMaps, baseCtx } from '../lib/readerctx.js';

  const t = $derived((app.ws.typeLibrary || []).find(x => x.type === app.builderTypeId) || null);
  let selKey = $state(null);
  let paletteOpen = $state(false);
  let palQuery = $state('');
  const palQ = $derived(palQuery.trim().toLowerCase());
  const filteredPalette = $derived(palQ ? FEATURE_GROUPS.map(g => ({ ...g, features: g.features.filter(f => (f.name + ' ' + f.desc).toLowerCase().includes(palQ)) })).filter(g => g.features.length) : FEATURE_GROUPS);
  function focusOnMount(node){ node.focus(); }
  $effect(() => { if (!paletteOpen) palQuery = ''; });
  const sel = $derived(t ? t.sections.find(s => s.key === selKey) : null);
  const curLayout = $derived(t ? layoutId(t) : 'hero-none');

  const featOf = (type) => FEATURE_BY_TYPE[type] || { icon: '◆', color: '#9aa1a8', name: type, group: '' };
  const allLinkTypes = $derived([...ENTRY_TYPES, ...(app.ws.typeLibrary || []).map(x => x.type).filter(x => t && x !== t.type)]);

  function touch(){ touchCustomTypes(); }
  function addFeature(feat){ const sec = sectionFromFeature(feat, t.sections.map(s => s.key)); t.sections.push(sec); selKey = sec.key; paletteOpen = false; touch(); }
  async function removeSec(key){ const s = t.sections.find(x => x.key === key); if (!(await confirmDelete(true, '“' + (s?.label || 'this feature') + '”'))) return; t.sections = t.sections.filter(x => x.key !== key); if (selKey === key) selKey = null; touch(); }
  function move(key, dir){ const i = t.sections.findIndex(s => s.key === key); const j = i + dir; if (j < 0 || j >= t.sections.length) return; const a = t.sections; [a[i], a[j]] = [a[j], a[i]]; touch(); }
  function setLayout(l){ t.layout = l.layout; if (l.media) t.media = l.media; else delete t.media; touch(); }
  function toggleLink(s, ty){ const cur = s.linkTypes || []; s.linkTypes = cur.includes(ty) ? cur.filter(x => x !== ty) : [...cur, ty]; if (!s.linkTypes.length) delete s.linkTypes; touch(); }
  async function del(){ if (!(await confirmDelete(true, '“' + t.label + '” and its structure (existing entries keep their data)'))) return; const id = t.type; deleteCustomType(id); openProject(curProject()?.id); }
  function done(){ openProject(curProject()?.id); }

  // representative sample content per field type, so the preview shows EVERY feature you
  // added (fields that render nothing when empty — timeline, gallery, arc… — would vanish).
  const SAMPLE_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#2a3138"/><text x="400" y="262" fill="#6a7480" font-family="sans-serif" font-size="26" text-anchor="middle">sample image</text></svg>');
  function sampleFor(s){
    const L = s.label || 'Field';
    switch (s.type){
      case 'richline': return s.lead ? ('A sample ' + (t.label || 'entry').toLowerCase() + '.') : 'A sample line.';
      case 'richsections': return [{ h: L, body: 'Sample prose for “' + L + '”. This is where the write-up goes.' }];
      case 'excerpts': return [{ title: 'A passage', body: '“A sample quotation from the work.”', source: '— attribution' }];
      case 'stats': return (s.defaults && s.defaults.length ? s.defaults : ['Field']).map(k => ({ k, v: 'sample' }));
      case 'deflist': return [{ term: 'A term', def: 'its meaning', note: '' }, { term: 'Another term', def: 'its meaning', note: '' }];
      case 'gauges': return [{ label: 'A gauge', levels: ['Low', 'Mid', 'High', 'Max'], at: 2 }, { label: 'A value', text: true, value: 'sample' }];
      case 'meter': return { levels: (s.levels && s.levels.length ? s.levels : ['Low', 'Mid', 'High']).slice(), at: 1 };
      case 'gallery': return [SAMPLE_IMG];
      case 'relations': return [{ name: 'A linked entry', role: 'role', body: 'A short note about the link.' }];
      case 'ties': return [{ name: 'A connection', targetId: '', kind: (s.kinds && s.kinds[0] && s.kinds[0].v) || 'ally', note: 'how they relate' }];
      case 'taggroups': return [{ name: 'A group', items: [{ name: 'tag one' }, { name: 'tag two' }, { name: 'tag three' }] }];
      case 'catalog': return [{ name: 'An entry', group: 'Group', kind: 'kind', level: 2, badge: 'Uncommon', targetId: '', img: '', body: 'A description of this catalog entry.' }];
      case 'timeline': return { eras: [{ id: 'e1', name: 'An era', span: '' }], entries: [{ id: 'b1', eraId: 'e1', date: 'Year 1', title: 'A first beat', body: 'What happened.', key: true, links: [] }, { id: 'b2', eraId: 'e1', date: 'Year 2', title: 'A later beat', body: 'And then this.', key: false, links: [] }], threads: [], view: 'chronicle' };
      case 'history': return [{ date: 'Year 1', title: 'A beat', body: 'What happened.', key: true }, { date: 'Year 2', title: 'Another beat', body: 'And then this.', key: false }];
      case 'chronology': return [{ date: 'Year 1', text: 'A dated event', targetId: '' }];
      case 'table': return { cols: ['Column A', 'Column B', 'Column C'], rows: [['row 1', 'a value', 'a value'], ['row 2', 'a value', 'a value']] };
      case 'embed': return [{ url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', caption: 'A sample embed' }];
      case 'matrix': return { people: [{ id: 'a', targetId: '', name: 'Ada' }, { id: 'b', targetId: '', name: 'Bran' }, { id: 'c', targetId: '', name: 'Cass' }], pairs: { 'a|b': 'ally', 'b|c': 'enemy', 'a|c': 'rival' } };
      case 'statchart': return { stats: [{ label: 'STR', value: 8 }, { label: 'DEX', value: 5 }, { label: 'CON', value: 7 }, { label: 'INT', value: 3 }, { label: 'WIS', value: 6 }, { label: 'CHA', value: 9 }], max: 10, view: 'radar' };
      case 'abilityscores': return { mode: s.mod || 'value', rows: ((s.abils && s.abils.length) ? s.abils : ['Cool', 'Hard', 'Hot', 'Sharp', 'Weird']).map((l, i) => ({ label: l, value: s.mod === 'dnd' ? [16, 12, 14, 10, 13][i] ?? 10 : ['+2', '+1', '0', '-1', '+1'][i] ?? '+0' })) };
      case 'rolltable': return { die: 6, rows: [{ range: '1-2', text: 'A common result' }, { range: '3-4', text: 'An uncommon result' }, { range: '5', text: 'A rare find' }, { range: '6', text: 'Something wild' }] };
      case 'checklist': return [{ done: true, text: 'A finished step' }, { done: false, text: 'A step still to do' }, { done: false, text: 'Another open item' }];
      case 'orgchart': return { nodes: [{ id: 'r', targetId: '', name: '', title: 'Commander', parentId: '' }, { id: 'a', targetId: '', name: '', title: 'First officer', parentId: 'r' }, { id: 'b', targetId: '', name: '', title: 'Quartermaster', parentId: 'r' }, { id: 'c', targetId: '', name: '', title: 'Sergeant', parentId: 'a' }] };
      case 'arc': return { type: 'positive', pos: null, believes: 'Where it begins', is: 'the starting state', turn: 'the crucible', learns: 'where it ends', becomes: 'the new state', want: 'the drive', need: 'the truth' };
      case 'dialectic': return { left: 'One position, stated.', right: 'The counter-position.' };
      case 'rulelist': return s.variant === 'cancant' ? [{ text: 'Something it can do', kind: 'can' }, { text: 'Something it can’t', kind: 'cant' }] : [{ text: 'A first rule', kind: '' }, { text: 'A second rule', kind: '' }];
      case 'references': return [{ kind: 'book', title: 'A reference', url: '', level: 3, note: '' }];
      case 'ledger': return [{ claim: 'A detail', verdict: 'real', note: 'as it happened' }];
      case 'crew': return [{ targetId: '', name: 'A member', role: 'role', cover: '', job: 'their part', angle: 'why they fit', status: 'in', readin: false }];
      case 'dyad': return { a: { targetId: '', role: 'one' }, b: { targetId: '', role: 'the other' }, dynamic: 'their dynamic', status: 'status', tension: 'the tension between them.', sides: { a: { wants: 'wants', fears: 'fears', hides: 'won’t admit', sees: 'sees them as' }, b: { wants: 'wants', fears: 'fears', hides: 'won’t admit', sees: 'sees them as' } } };
      case 'suspects': return [{ targetId: '', name: 'A suspect', motive: 'a motive', means: 'the means', opportunity: 'the chance', alibi: 'their alibi', alibiStatus: 'unc', suspicion: 2, guilty: false }];
      case 'clues': return [{ name: 'A clue', kind: 'genuine', reads: 'what it seems to say', means: 'what it really means', implicates: '', planted: 'ch. 1', targetId: '' }];
      case 'sourcenotes': return { chapters: [{ id: 'c1', title: 'Chapter 1', pages: '', summary: 'A chapter summary.', state: 'now', notes: [{ id: 'n1', type: 'fact', page: '1', body: 'A sample note.', tags: [] }] }] };
      default: return undefined;   // leave the seeded empty value (shows a heading + placeholder)
    }
  }
  // live preview: render a throwaway sample entry of this type (not saved) in a new tab
  function preview(){
    const p = curProject(); if (!p) return;
    const e = createEntry(t.type, t.label + ' — preview'); e.hidden = [];   // show every section
    for (const s of t.sections){ const v = sampleFor(s); if (v !== undefined) e.data[s.key] = v; }
    const ctx = baseCtx(p, readerMaps(p), { href: () => null, entry: e });
    const html = docShell({ title: e.title, palette: p.palette, headFont: p.headFont, bodyFont: p.bodyFont, headScale: p.headScale, bodyScale: p.bodyScale, portraitScale: p.portraitScale, fontPrefix: location.origin + '/fonts/', bodyHTML: renderEntry(e, ctx) });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 6000);
  }

  // small list editors for stats defaults / meter levels
  function addItem(arrName){ if (!Array.isArray(sel[arrName])) sel[arrName] = []; sel[arrName].push('New'); touch(); }
  function delItem(arrName, i){ sel[arrName].splice(i, 1); touch(); }
  const labelOf = (ty) => templateFor(ty).label;
</script>

{#if t}
<div class="tbwrap">
  <div class="tbbar">
    <button class="back" onclick={done}>← Done</button>
    <span class="crumb">Sheet-type builder</span>
    <span class="grow"></span>
    <button class="prev" onclick={() => exportType(t.type)} title="download this type as a shareable file">Export ↓</button>
    <button class="prev" onclick={preview}>Preview ↗</button>
    <button class="del" onclick={del}>Delete type</button>
  </div>

  <div class="tbhead">
    <input class="icon" bind:value={t.icon} oninput={touch} maxlength="2" aria-label="icon" />
    <div class="names">
      <input class="label" bind:value={t.label} oninput={touch} placeholder="Type name" />
      <input class="plural" bind:value={t.plural} oninput={touch} placeholder="plural (e.g. Starships)" />
    </div>
    <div class="layouts">
      <span class="ll">Layout</span>
      {#each LAYOUTS as l}
        <button class="lopt" class:on={curLayout === l.id} onclick={() => setLayout(l)} title={l.hint}>{l.name}</button>
      {/each}
    </div>
  </div>

  <div class="tbmain">
    <!-- sections list -->
    <div class="secs">
      {#each t.sections as s, i (s.key)}
        {@const f = featOf(s.type)}
        <div class="secrow" class:sel={selKey === s.key} onclick={() => selKey = s.key} role="button" tabindex="0" onkeydown={(e) => (e.key === 'Enter') && (selKey = s.key)}>
          <span class="reord" onclick={(e) => e.stopPropagation()} role="presentation">
            <button onclick={() => move(s.key, -1)} disabled={i === 0} aria-label="up">▲</button>
            <button onclick={() => move(s.key, 1)} disabled={i === t.sections.length - 1} aria-label="down">▼</button>
          </span>
          <span class="fic" style="background:{f.color}">{f.icon}</span>
          <span class="smid"><span class="slabel">{s.label || '(untitled)'}</span><span class="stype">{f.name}</span></span>
          <span class="spill">{s.slot === 'aside' ? 'sidebar' : s.slot === 'band' ? 'band' : 'main'}</span>
          <span class="spill" class:core={!s.optional}>{s.optional ? 'opt-in' : 'core'}</span>
          <button class="sx" onclick={(e) => { e.stopPropagation(); removeSec(s.key); }} title="remove">✕</button>
        </div>
      {/each}
      <div class="addwrap" use:dismissable={() => paletteOpen = false}>
        <button class="addfeat" onclick={() => paletteOpen = !paletteOpen}>＋ Add a feature</button>
        {#if paletteOpen}
          <div class="palette">
            <input class="palsearch" use:focusOnMount bind:value={palQuery} placeholder="Filter features — timeline, radar, table…" spellcheck="false" />
            {#each filteredPalette as g}
              <div class="pgh" style="color:{g.color}">{g.group}</div>
              <div class="pgrid">
                {#each g.features as feat}
                  <button class="pcard" onclick={() => addFeature(feat)}>
                    <span class="pic" style="background:{g.color}">{feat.icon}</span>
                    <span class="pmid"><span class="pn">{feat.name}</span><span class="pd">{feat.desc}</span></span>
                  </button>
                {/each}
              </div>
            {/each}
            {#if !filteredPalette.length}<div class="palnone">No features match “{palQuery}”.</div>{/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- config panel -->
    <div class="config">
      {#if sel}
        {@const cfg = configFor(sel.type)}
        <div class="ch">Configure · {featOf(sel.type).name}</div>
        <div class="cf"><label>Label</label><input bind:value={sel.label} oninput={touch} /></div>
        <div class="cf"><label>Where it sits</label><div class="seg">
          <button class:on={sel.slot !== 'aside'} onclick={() => { sel.slot = 'main'; touch(); }}>Main</button>
          <button class:on={sel.slot === 'aside'} onclick={() => { sel.slot = 'aside'; touch(); }}>Sidebar</button>
        </div></div>
        <div class="cf"><label>On a new sheet</label><div class="seg">
          <button class:on={!sel.optional} onclick={() => { delete sel.optional; touch(); }}>Core (shown)</button>
          <button class:on={sel.optional} onclick={() => { sel.optional = true; touch(); }}>Opt-in</button>
        </div></div>
        {#if sel.type === 'richline'}
          <div class="cf"><label>Role</label><div class="seg">
            <button class:on={sel.lead} onclick={() => { sel.lead = true; touch(); }}>Lead / summary</button>
            <button class:on={!sel.lead} onclick={() => { delete sel.lead; touch(); }}>Normal line</button>
          </div></div>
        {/if}

        {#if cfg.includes('defaults')}
          <div class="cf"><label>Default fields</label>
            {#each (sel.defaults || []) as d, i}<div class="li"><input bind:value={sel.defaults[i]} oninput={touch} /><button onclick={() => delItem('defaults', i)}>✕</button></div>{/each}
            <button class="addli" onclick={() => addItem('defaults')}>＋ field</button>
          </div>
        {/if}
        {#if cfg.includes('levels')}
          <div class="cf"><label>Levels (low → high)</label>
            {#each (sel.levels || []) as d, i}<div class="li"><input bind:value={sel.levels[i]} oninput={touch} /><button onclick={() => delItem('levels', i)}>✕</button></div>{/each}
            <button class="addli" onclick={() => addItem('levels')}>＋ level</button>
          </div>
        {/if}
        {#if cfg.includes('placeholders')}
          <div class="cf"><label>Column prompts</label>
            <input class="mb" bind:value={sel.termPh} oninput={touch} placeholder="term prompt" />
            <input class="mb" bind:value={sel.defPh} oninput={touch} placeholder="meaning prompt" />
            <input bind:value={sel.notePh} oninput={touch} placeholder="note prompt (optional)" />
          </div>
        {/if}
        {#if cfg.includes('scale')}
          <div class="cf"><label>Scale label</label><input bind:value={sel.scale} oninput={touch} placeholder="e.g. Rarity" /></div>
        {/if}
        {#if cfg.includes('dialecticLabels')}
          <div class="cf"><label>Column headings</label>
            <input class="mb" bind:value={sel.leftLabel} oninput={touch} placeholder="left heading" />
            <input bind:value={sel.rightLabel} oninput={touch} placeholder="right heading" />
          </div>
        {/if}
        {#if cfg.includes('ruleVariant')}
          <div class="cf"><label>Style</label><div class="seg">
            <button class:on={sel.variant !== 'cancant'} onclick={() => { sel.variant = 'laws'; touch(); }}>Numbered laws</button>
            <button class:on={sel.variant === 'cancant'} onclick={() => { sel.variant = 'cancant'; touch(); }}>Can / can’t</button>
          </div></div>
          {#if sel.variant === 'cancant'}
            <div class="cf"><label>Column labels</label>
              <input class="mb" bind:value={sel.canLabel} oninput={touch} placeholder="left (e.g. It can)" />
              <input bind:value={sel.cantLabel} oninput={touch} placeholder="right (e.g. It can’t)" />
            </div>
          {/if}
        {/if}
        {#if cfg.includes('display')}
          <div class="cf"><label>Card style</label><div class="seg">
            <button class:on={sel.display !== 'expand'} onclick={() => { delete sel.display; touch(); }}>List</button>
            <button class:on={sel.display === 'expand'} onclick={() => { sel.display = 'expand'; touch(); }}>Expandable</button>
          </div></div>
        {/if}
        {#if cfg.includes('linkTypes')}
          <div class="cf"><label>Links to <span class="hint">(empty = any)</span></label>
            <div class="chips">
              {#each allLinkTypes as ty}<button class="chip" class:on={(sel.linkTypes || []).includes(ty)} onclick={() => toggleLink(sel, ty)}>{labelOf(ty)}</button>{/each}
            </div>
          </div>
        {/if}
      {:else}
        <div class="ch">Configure</div>
        <p class="empty">Select a feature on the left to configure it — its label, whether it sits in the main column or the sidebar, whether it shows by default or is opt-in, and its own options.</p>
        <p class="empty">Add features from the palette to compose your sheet. It’ll appear in <b>New entry ▸ Your types</b> and work like any built-in — editable, linkable, backlinked, exported.</p>
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
  .tbwrap{max-width:1040px;margin:0 auto;padding:18px 22px 80px}
  .tbbar{display:flex;align-items:center;gap:12px;margin-bottom:16px}
  .back{border:1px solid var(--rule);background:var(--panel-2);color:var(--ink);border-radius:8px;padding:7px 13px;cursor:pointer;font:inherit;font-size:.82rem}
  .back:hover{border-color:var(--accent)}
  .crumb{font-family:var(--mono);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .grow{flex:1}
  .prev{border:1px solid var(--rule);background:var(--panel-2);color:var(--ink);border-radius:8px;padding:7px 13px;cursor:pointer;font:inherit;font-size:.8rem}
  .prev:hover{border-color:var(--accent)}
  .del{border:1px solid var(--rule);background:none;color:var(--muted);border-radius:8px;padding:7px 13px;cursor:pointer;font:inherit;font-size:.8rem}
  .del:hover{border-color:#b0413a;color:#e88}

  .tbhead{display:flex;align-items:center;gap:14px;border:1px solid var(--rule);border-radius:14px;background:var(--panel);padding:14px 16px;flex-wrap:wrap}
  .icon{width:48px;height:48px;text-align:center;font-size:1.5rem;background:var(--panel-2);border:1px solid var(--rule);border-radius:11px;color:var(--accent-soft);outline:none}
  .icon:focus{border-color:var(--accent)}
  .names{display:flex;flex-direction:column;gap:3px;min-width:180px}
  .label{font-family:var(--head);font-size:1.5rem;color:var(--ink);background:none;border:none;border-bottom:1px dashed var(--rule);outline:none;padding:0 0 2px}
  .label:focus{border-bottom-color:var(--accent)}
  .plural{font-family:var(--mono);font-size:.62rem;letter-spacing:.04em;color:var(--faint);background:none;border:none;outline:none}
  .layouts{margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .ll{font-family:var(--mono);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin-right:2px}
  .lopt{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:8px;padding:6px 10px;font:inherit;font-size:.74rem;cursor:pointer}
  .lopt.on{border-color:var(--accent);color:var(--ink);background:color-mix(in srgb,var(--accent) 12%,var(--panel-2))}

  .tbmain{display:grid;grid-template-columns:1fr 320px;gap:14px;margin-top:14px}
  .secs{border:1px solid var(--rule);border-radius:14px;background:var(--panel);padding:12px}
  .secrow{display:flex;align-items:center;gap:9px;border:1px solid var(--rule);border-radius:10px;background:var(--panel-2);padding:8px 10px;margin-bottom:7px;cursor:pointer}
  .secrow.sel{border-color:var(--accent);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 30%,transparent)}
  .reord{display:flex;flex-direction:column;gap:1px}
  .reord button{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.5rem;line-height:1;padding:1px}
  .reord button:disabled{opacity:.3;cursor:default}
  .fic{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#fff;flex:0 0 auto}
  .smid{flex:1;min-width:0}
  .slabel{font-family:var(--head);font-size:1.02rem;color:var(--ink);display:block;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .stype{font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
  .spill{font-family:var(--mono);font-size:.5rem;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);border:1px solid var(--rule);border-radius:20px;padding:2px 8px}
  .spill.core{color:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 35%,var(--rule))}
  .sx{border:1px solid var(--rule);background:var(--panel);color:var(--faint);border-radius:6px;cursor:pointer;padding:3px 7px;font-size:.7rem}
  .sx:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addwrap{position:relative;margin-top:4px}
  .addfeat{width:100%;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:10px;padding:11px;cursor:pointer;font:inherit;font-size:.82rem}
  .addfeat:hover{border-color:var(--accent);color:var(--ink)}
  .palette{position:absolute;z-index:40;left:0;right:0;top:calc(100% + 6px);max-height:56vh;overflow:auto;background:var(--panel);border:1px solid var(--rule);border-radius:12px;box-shadow:0 18px 44px rgba(0,0,0,.5);padding:12px 14px}
  .palsearch{position:sticky;top:-12px;z-index:1;margin:-12px -14px 8px;padding:10px 14px;background:var(--panel);border:none;border-bottom:1px solid var(--rule);color:var(--ink);font:inherit;font-size:.86rem;outline:none}
  .palsearch::placeholder{color:var(--faint)}
  .palnone{padding:8px 2px;color:var(--faint);font-size:.82rem}
  .pgh{font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;margin:10px 0 7px}.pgh:first-child{margin-top:0}
  .pgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  .pcard{display:flex;gap:9px;align-items:flex-start;border:1px solid var(--rule);border-radius:9px;background:var(--panel-2);padding:8px 10px;cursor:pointer;text-align:left}
  .pcard:hover{border-color:var(--accent)}
  .pic{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.76rem;color:#fff;flex:0 0 auto}
  .pn{font-family:var(--head);font-size:.98rem;color:var(--ink);display:block;line-height:1.1}
  .pd{color:var(--muted);font-size:.74rem;line-height:1.3}

  .config{border:1px solid var(--rule);border-radius:14px;background:var(--panel-3,#20262d);padding:14px 15px;align-self:start;position:sticky;top:16px}
  .ch{font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:12px}
  .cf{margin-bottom:13px}
  .config label{display:block;font-family:var(--mono);font-size:.52rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin-bottom:5px}
  .config label .hint{text-transform:none;letter-spacing:0;color:var(--faint);opacity:.7}
  .config input{width:100%;background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;color:var(--ink);font:inherit;font-size:.86rem;padding:7px 9px;outline:none}
  .config input:focus{border-color:var(--accent)}
  .config input.mb{margin-bottom:6px}
  .seg{display:flex;gap:6px}
  .seg button{flex:1;border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:7px;padding:6px;font:inherit;font-size:.76rem;cursor:pointer}
  .seg button.on{border-color:var(--accent);color:var(--ink);background:color-mix(in srgb,var(--accent) 12%,var(--panel-2))}
  .li{display:flex;gap:5px;margin-bottom:5px}
  .li input{flex:1}
  .li button{border:1px solid var(--rule);background:var(--panel-2);color:var(--faint);border-radius:6px;cursor:pointer;padding:0 9px}
  .li button:hover{background:var(--accent);color:#fff}
  .addli{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:7px;padding:6px 10px;cursor:pointer;font:inherit;font-size:.74rem}
  .addli:hover{border-color:var(--accent);color:var(--ink)}
  .chips{display:flex;flex-wrap:wrap;gap:5px}
  .chip{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:20px;padding:3px 9px;font:inherit;font-size:.72rem;cursor:pointer}
  .chip.on{border-color:var(--accent);color:var(--ink);background:color-mix(in srgb,var(--accent) 14%,var(--panel-2))}
  .empty{color:var(--faint);font-size:.84rem;line-height:1.5}.empty b{color:var(--muted);font-weight:400}
  @media(max-width:760px){.tbmain{grid-template-columns:1fr}.config{position:static}.pgrid{grid-template-columns:1fr}}
</style>
