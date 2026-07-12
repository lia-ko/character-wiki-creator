<script>
  import { app, curProject, openEntry, addEntry, deleteEntry, markDirty } from '../lib/store.svelte.js';
  import { coverOf, entriesByType } from '../lib/model.js';
  import { ENTRY_TYPES, templateFor } from '../lib/templates.js';
  import ThemeBar from './ThemeBar.svelte';
  import FontSample from './FontSample.svelte';
  import Reorder from './Reorder.svelte';
  import { pickImages } from '../lib/images.js';

  const fallbackCover = $derived.by(() => { for (const e of (p.entries || [])){ const c = coverOf(e); if (c) return c; } return ''; });
  async function setCover(){ const u = await pickImages(false); if (u && u[0]){ p.cover = u[0]; markDirty(); } }
  function clearCover(){ p.cover = ''; markDirty(); }

  // move an entry earlier/later within its own type (entries share one array across types)
  function moveEntry(e, dir){
    const arr = p.entries; const same = [];
    arr.forEach((x, k) => { if (x.type === e.type) same.push(k); });
    const pos = same.findIndex(k => arr[k].id === e.id); const target = pos + dir;
    if (target < 0 || target >= same.length) return;
    const a = same[pos], b = same[target]; const t = arr[a]; arr[a] = arr[b]; arr[b] = t; markDirty();
  }

  const p = $derived(curProject());
  const groups = $derived(entriesByType(p));

  function del(e, id){ e.stopPropagation(); if (confirm('Delete this entry?')) deleteEntry(id); }
</script>

<div class="wrap">
  <div class="hero">
    <div class="hleft">
      <div class="covwrap">
        <button class="covpick" style={(p.cover || fallbackCover) ? `background-image:url(${p.cover || fallbackCover})` : ''} onclick={setCover} title="set project cover">
          {#if !(p.cover || fallbackCover)}<span class="covph">＋<br>cover</span>{/if}
        </button>
        {#if p.cover}<button class="covclear" onclick={clearCover} title="clear cover (use first entry)">✕</button>{/if}
      </div>
    <div>
      <div class="eyebrow">Project</div>
      <input class="htitle" bind:value={p.name} oninput={markDirty} placeholder="Project name" />
      <div class="count">
        <input class="genre" bind:value={p.genre} oninput={markDirty} placeholder="genre / setting" />
        · {(p.entries || []).length} {(p.entries || []).length === 1 ? 'entry' : 'entries'}
      </div>
    </div>
    </div>
    <ThemeBar target={p} showPortrait />
  </div>

  <FontSample />

  {#each ENTRY_TYPES as type}
    {@const tpl = templateFor(type)}
    {@const list = groups[type] || []}
    <section class="typesec">
      <div class="typehead">
        <h2><span class="ic">{tpl.icon}</span> {tpl.plural}</h2>
        <button class="addbtn" onclick={() => addEntry(type)}>＋ {tpl.label}</button>
      </div>
      {#if list.length}
        <div class="grid">
          {#each list as e, ei (e.id)}
            {@const cover = coverOf(e)}
            <div class="card" onclick={() => openEntry(e.id)}>
              <div class="cardctl">
                <Reorder horizontal onmove={(d) => moveEntry(e, d)} first={ei === 0} last={ei === list.length - 1} />
                <button class="kebab" onclick={(ev) => del(ev, e.id)} title="delete">✕</button>
              </div>
              <div class="portrait" style={cover ? `background-image:url(${cover})` : ''}>
                {#if !cover}<span class="ini">{(e.title || '?').slice(0, 2)}</span>{/if}
              </div>
              <div class="meta">
                <div class="nm">{e.title || 'Untitled'}</div>
                {#if e.subtitle}<div class="sub">{e.subtitle}</div>{/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty">No {tpl.plural.toLowerCase()} yet.</p>
      {/if}
    </section>
  {/each}
</div>

<style>
  .wrap{max-width:1180px;margin:0 auto;padding:40px 26px 90px}
  .hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--rule)}
  .hleft{display:flex;align-items:flex-start;gap:20px;min-width:0}
  .covwrap{position:relative;flex:none}
  .covpick{width:96px;aspect-ratio:4/3;border-radius:10px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center}
  .covpick:hover{border-color:var(--accent);color:var(--ink)}
  .covph{font-family:var(--mono);font-size:.54rem;letter-spacing:.1em;text-transform:uppercase;text-align:center;line-height:1.5}
  .covclear{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;border:1px solid var(--rule);background:var(--panel);color:var(--muted);cursor:pointer;font-size:.65rem;line-height:1}
  .covclear:hover{border-color:var(--accent);color:#fff;background:var(--accent)}
  .eyebrow{font-family:var(--mono);font-size:.64rem;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
  .htitle{font-family:var(--head);font-weight:400;font-size:calc(clamp(2rem,5vw,3.2rem)*var(--hs,1));line-height:1;margin:0;color:var(--ink);background:none;border:none;outline:none;width:100%;max-width:640px}
  .count{font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:11px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;max-width:100%}
  .genre{background:none;border:none;outline:none;color:var(--muted);font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid transparent;field-sizing:content;min-width:9em;max-width:100%}
  .genre:focus{border-bottom-color:var(--rule)}
  .typesec{margin:30px 0}
  .typehead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--line)}
  h2{font-family:var(--head);font-weight:400;font-size:calc(1.4rem*var(--hs,1));color:var(--ink);margin:0;display:flex;align-items:center;gap:10px}
  .ic{color:var(--accent-soft)}
  .addbtn{font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:8px;padding:6px 12px;cursor:pointer}
  .addbtn:hover{border-color:var(--accent)}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
  .card{position:relative;background:var(--panel);border:1px solid var(--rule);border-radius:14px;overflow:hidden;cursor:pointer;transition:transform .12s,border-color .12s,box-shadow .12s}
  .card:hover{transform:translateY(-3px);border-color:var(--accent);box-shadow:0 14px 32px rgba(0,0,0,.4)}
  .portrait{aspect-ratio:3/4;background:var(--panel-2) center/cover;position:relative;display:flex;align-items:center;justify-content:center}
  .portrait::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.72))}
  .ini{font-family:var(--head);font-size:2.6rem;color:var(--line);text-transform:uppercase}
  .meta{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:12px 13px}
  .nm{font-family:var(--head);font-size:calc(1.2rem*var(--hs,1));line-height:1.05;color:#fff}
  .sub{font-family:var(--mono);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);margin-top:5px}
  .cardctl{position:absolute;top:9px;right:9px;z-index:3;display:flex;align-items:center;gap:6px;opacity:0;transition:opacity .12s}
  .card:hover .cardctl{opacity:1}
  .kebab{width:24px;height:24px;border-radius:7px;border:none;background:rgba(0,0,0,.5);color:#fff;cursor:pointer;font-size:.9rem;line-height:1}
  .kebab:hover{background:var(--accent)}
  .empty{color:var(--faint);font-style:italic;font-size:.85rem}
</style>
