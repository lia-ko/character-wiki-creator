<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import { uid, imgSrc } from '../../lib/model.js';
  import { resolveImg } from '../../lib/imagepool.js';
  import { pickImages } from '../../lib/images.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';

  let { entry, sec } = $props();
  // guarantee shape for entries that predate this field
  $effect(() => {
    const v = entry.data[sec.key];
    if (!v || typeof v !== 'object' || !Array.isArray(v.chapters)) entry.data[sec.key] = { chapters: [] };
  });
  const nb = $derived(entry.data[sec.key] || { chapters: [] });

  const NOTE_TYPES = [
    { k: 'quote',    label: 'Quote',    c: 'var(--accent-soft)' },
    { k: 'fact',     label: 'Fact',     c: '#4aa579' },
    { k: 'summary',  label: 'Summary',  c: 'var(--muted)' },
    { k: 'question', label: 'Question', c: 'var(--accent)' },
    { k: 'idea',     label: 'Idea',     c: '#b9853a' },
    { k: 'plate',    label: 'Plate',    c: '#5f8fb0' },
  ];
  const tinfo = (k) => NOTE_TYPES.find(t => t.k === k) || NOTE_TYPES[1];

  // chapter collapse — default open the "reading now" one and the first
  let openCh = $state({});
  const isOpen = (c, i) => openCh[c.id] ?? (c.state === 'now' || i === 0);
  function toggleCh(c, i){ openCh[c.id] = !isOpen(c, i); }

  // themes = every tag used, with counts (the cross-cut index)
  const themes = $derived.by(() => {
    const m = {};
    for (const c of nb.chapters) for (const n of (c.notes || [])) for (const t of (n.tags || [])) m[t] = (m[t] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  });
  const noteTotal = $derived(nb.chapters.reduce((s, c) => s + (c.notes ? c.notes.length : 0), 0));

  /* ---- chapters ---- */
  function addChapter(){ nb.chapters.push({ id: uid(), title: 'New chapter', pages: '', summary: '', state: 'todo', notes: [] }); openCh[nb.chapters[nb.chapters.length - 1].id] = true; markDirty(); }
  async function delChapter(i){
    const c = nb.chapters[i]; const has = (c.title && c.title !== 'New chapter') || (c.notes && c.notes.length);
    if (!(await confirmDelete(has, c.title ? '“' + c.title + '”' : 'this chapter'))) return;
    nb.chapters.splice(i, 1); markDirty();
  }
  const STATES = ['todo', 'now', 'done'];
  const STATE_TITLE = { todo: 'to read', now: 'reading now', done: 'worked through' };
  function cycleState(c){ c.state = STATES[(STATES.indexOf(c.state) + 1) % 3]; markDirty(); }

  /* ---- notes ---- */
  function addNote(c, type){
    const n = { id: uid(), type, page: '', body: '', tags: [] };
    if (type === 'plate'){ n.images = []; n.placement = 'top'; }
    c.notes.push(n); markDirty();
  }
  async function delNote(c, i){
    const n = c.notes[i]; const has = (n.body && n.body.trim()) || (n.images && n.images.length) || (n.tags && n.tags.length);
    if (!(await confirmDelete(has, 'this note'))) return;
    c.notes.splice(i, 1); markDirty();
  }
  function setType(n, k){ n.type = k; if (k === 'plate' && !Array.isArray(n.images)){ n.images = []; n.placement = n.placement || 'top'; } markDirty(); }
  function setBody(n, v){ n.body = v; markDirty(); }
  const tagStr = (n) => (n.tags || []).join(', ');
  function setTags(n, s){ n.tags = s.split(',').map(x => x.trim()).filter(Boolean); markDirty(); }

  /* ---- plate images ---- */
  async function addImg(n){ const u = await pickImages(true); if (u && u.length){ n.images.push(...u); markDirty(); } }
  async function delImg(n, i){ if (!(await confirmDelete(true, 'this image'))) return; n.images.splice(i, 1); markDirty(); }
  const PLACE = [{ p: 'top', g: '⬒', t: 'image on top' }, { p: 'left', g: '◧', t: 'image on left' }, { p: 'right', g: '◨', t: 'image on right' }];
  function setPlace(n, p){ n.placement = p; markDirty(); }
</script>

<div class="sn">
  {#if themes.length}
    <div class="themes">
      <span class="thlbl">Themes</span>
      {#each themes as [t, n] (t)}<span class="thm">{t} <span class="c">{n}</span></span>{/each}
    </div>
  {/if}

  {#each nb.chapters as c, ci (c.id)}
    <div class="chap" class:open={isOpen(c, ci)}>
      <div class="chhead">
        <button class="state {c.state}" onclick={() => cycleState(c)} title={STATE_TITLE[c.state]} aria-label="reading state: {STATE_TITLE[c.state]}"></button>
        <div class="chmid">
          <input class="chtitle" bind:value={c.title} oninput={markDirty} placeholder="Chapter / section" />
          <div class="chsubrow">
            <input class="chpp" bind:value={c.pages} oninput={markDirty} placeholder="pages (e.g. 288–320)" />
            <input class="chsum" bind:value={c.summary} oninput={markDirty} placeholder="one-line summary…" />
          </div>
        </div>
        <span class="chn">{(c.notes || []).length} notes</span>
        <Reorder list={nb.chapters} i={ci} />
        <button class="cmini" onclick={() => toggleCh(c, ci)} title={isOpen(c, ci) ? 'collapse' : 'expand'}>{isOpen(c, ci) ? '▾' : '▸'}</button>
        <button class="cmini del" onclick={() => delChapter(ci)} title="delete chapter">✕</button>
      </div>

      {#if isOpen(c, ci)}
        <div class="chbody">
          {#each c.notes as n, ni (n.id)}
            <div class="note type-{n.type}" class:plate={n.type === 'plate'} style={`--nc:${tinfo(n.type).c}`}>
              <div class="ntop">
                <select class="ntype" bind:value={n.type} onchange={() => setType(n, n.type)} style={`color:${tinfo(n.type).c}`}>
                  {#each NOTE_TYPES as t}<option value={t.k}>{t.label}</option>{/each}
                </select>
                <input class="npage" bind:value={n.page} oninput={markDirty} placeholder="p." />
                <input class="ntags" value={tagStr(n)} oninput={(e) => setTags(n, e.target.value)} placeholder="themes, comma-separated" />
                {#if n.type === 'plate'}
                  <span class="place">
                    {#each PLACE as pl}<button class="pl" class:active={(n.placement || 'top') === pl.p} onclick={() => setPlace(n, pl.p)} title={pl.t}>{pl.g}</button>{/each}
                  </span>
                {/if}
                <Reorder list={c.notes} i={ni} />
                <button class="cmini del" onclick={() => delNote(c, ni)} title="delete note">✕</button>
              </div>

              {#if n.type === 'plate'}
                <div class="pcontent place-{n.placement || 'top'}">
                  <div class="pfig">
                    {#each (n.images || []) as im, ii (ii)}
                      <div class="pthumb" style={`background-image:url(${resolveImg(imgSrc(im))})`}><button class="ix" onclick={() => delImg(n, ii)} title="remove image">✕</button></div>
                    {/each}
                    <button class="paddimg" onclick={() => addImg(n)}><span>＋</span><small>{(n.images || []).length ? 'add' : 'add image(s)'}</small></button>
                  </div>
                  <div class="ptext">
                    <RichEditor value={n.body} multiline placeholder="Caption / notes on this figure…" oninput={(v) => setBody(n, v)} />
                  </div>
                </div>
              {:else}
                <RichEditor value={n.body} multiline placeholder="{tinfo(n.type).label}…" oninput={(v) => setBody(n, v)} />
              {/if}
            </div>
          {/each}

          <div class="addnote">
            <span class="al">Add note</span>
            {#each NOTE_TYPES as t}<button class="ab" style={`--ac:${t.c}`} onclick={() => addNote(c, t.k)}>{t.label}</button>{/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}

  <button class="addchap" onclick={addChapter}>＋ Add chapter / section</button>
  {#if nb.chapters.length}<p class="snhint">{nb.chapters.length} chapters · {noteTotal} notes. Chapters mirror the source; tag notes to build the theme index above.</p>{/if}
</div>

<style>
  .sn{display:flex;flex-direction:column;gap:11px}
  /* theme index */
  .themes{display:flex;flex-wrap:wrap;gap:7px;align-items:center;padding:2px 0 4px}
  .thlbl{font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-right:4px}
  .thm{font-family:var(--mono);font-size:.6rem;letter-spacing:.04em;color:var(--muted);border:1px solid var(--rule);background:var(--panel);border-radius:20px;padding:4px 10px}
  .thm .c{color:var(--faint)}

  /* chapter */
  .chap{border:1px solid var(--rule);border-radius:12px;background:var(--panel);overflow:hidden}
  .chap.open{border-color:color-mix(in srgb,var(--accent) 35%,var(--rule))}
  .chhead{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto auto auto;gap:11px;align-items:center;padding:11px 13px}
  .state{width:12px;height:12px;border-radius:50%;border:1px solid var(--faint);background:none;cursor:pointer;flex:none;padding:0}
  .state.now{background:var(--accent);border-color:var(--accent)}
  .state.done{background:#4aa579;border-color:#4aa579}
  .chmid{min-width:0}
  .chtitle{width:100%;background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.15rem*var(--hs,1));color:var(--ink)}
  .chsubrow{display:flex;gap:10px;margin-top:3px;flex-wrap:wrap}
  .chpp{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--accent-soft);padding:3px 8px;field-sizing:content;min-width:7em;max-width:16em}
  .chsum{flex:1;min-width:8em;background:none;border:none;outline:none;font-family:var(--body);font-size:.92rem;color:var(--muted)}
  .chpp::placeholder,.chsum::placeholder{color:var(--faint)}
  .chn{font-family:var(--mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);white-space:nowrap}
  .cmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .cmini:hover{border-color:var(--accent);color:var(--ink)}
  .cmini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}

  .chbody{border-top:1px solid var(--rule);padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px}

  /* note */
  .note{border:1px solid var(--rule);border-left:3px solid var(--nc,var(--rule));border-radius:9px;background:var(--panel-2);padding:9px 12px}
  .ntop{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
  .ntype{font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;background:var(--panel);border:1px solid var(--rule);border-radius:6px;padding:3px 6px;cursor:pointer;outline:none}
  .npage{width:4.5em;background:var(--panel);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;color:var(--faint);padding:3px 7px}
  .ntags{flex:1;min-width:7em;background:var(--panel);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.03em;color:var(--muted);padding:3px 8px}
  .npage::placeholder,.ntags::placeholder{color:var(--faint)}
  .ntags:focus,.npage:focus{border-color:var(--accent)}
  .place{display:inline-flex;border:1px solid var(--rule);border-radius:6px;overflow:hidden}
  .pl{background:var(--panel);border:none;border-right:1px solid var(--rule);color:var(--faint);cursor:pointer;font-size:.8rem;line-height:1;padding:3px 7px}
  .pl:last-child{border-right:none}
  .pl:hover{color:var(--ink)}
  .pl.active{background:#5f8fb0;color:#0c1216}
  .note.type-quote :global(.ce){font-style:italic}

  /* plate */
  .pcontent{margin-top:2px}
  .pcontent.place-left,.pcontent.place-right{display:grid;gap:14px;align-items:start}
  .pcontent.place-left{grid-template-columns:minmax(130px,40%) 1fr}
  .pcontent.place-right{grid-template-columns:1fr minmax(130px,40%)}
  .pcontent.place-right .pfig{order:2}
  .pfig{display:flex;flex-wrap:wrap;gap:8px;align-content:start}
  .pthumb{position:relative;width:74px;height:74px;border-radius:8px;border:1px solid var(--rule);background:var(--panel) center/cover}
  .ix{position:absolute;top:3px;right:3px;width:18px;height:18px;border:none;border-radius:5px;background:rgba(0,0,0,.6);color:#fff;cursor:pointer;font-size:.62rem;opacity:0;transition:opacity .1s}
  .pthumb:hover .ix{opacity:1}.ix:hover{background:var(--accent)}
  .paddimg{width:74px;height:74px;border:1px dashed var(--rule);border-radius:8px;background:none;color:var(--muted);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
  .paddimg:hover{border-color:var(--accent);color:var(--ink)}
  .paddimg span{font-size:1.2rem;font-family:var(--head)}
  .paddimg small{font-family:var(--mono);font-size:.5rem;letter-spacing:.08em;text-transform:uppercase}
  .ptext{min-width:0}

  /* add note / chapter */
  .addnote{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:2px}
  .al{font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-right:2px}
  .ab{font-family:var(--mono);font-size:.58rem;letter-spacing:.05em;color:var(--ac);border:1px solid var(--rule);background:var(--panel);border-radius:20px;padding:4px 11px;cursor:pointer}
  .ab:hover{border-color:var(--ac)}
  .addchap{width:100%;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:9px;padding:11px;cursor:pointer;font-family:var(--body);font-size:.92rem}
  .addchap:hover{border-color:var(--accent);color:var(--ink)}
  .snhint{margin:0;font-family:var(--sans);font-size:.72rem;color:var(--faint)}
  @media(max-width:640px){.pcontent.place-left,.pcontent.place-right{grid-template-columns:1fr}.pcontent.place-right .pfig{order:0}}
</style>
