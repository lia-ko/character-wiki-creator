<script>
  import { app, curProject, openEntry, addEntry, deleteEntry, markDirty } from '../lib/store.svelte.js';
  import { coverOf, entriesByType } from '../lib/model.js';
  import { ENTRY_TYPES, templateFor } from '../lib/templates.js';
  import ThemeBar from './ThemeBar.svelte';

  const p = $derived(curProject());
  const groups = $derived(entriesByType(p));

  function del(e, id){ e.stopPropagation(); if (confirm('Delete this entry?')) deleteEntry(id); }
</script>

<div class="wrap">
  <div class="hero">
    <div>
      <div class="eyebrow">Project</div>
      <input class="htitle" bind:value={p.name} oninput={markDirty} placeholder="Project name" />
      <div class="count">
        <input class="genre" bind:value={p.genre} oninput={markDirty} placeholder="genre / setting" />
        · {(p.entries || []).length} {(p.entries || []).length === 1 ? 'entry' : 'entries'}
      </div>
    </div>
    <ThemeBar target={p} />
  </div>

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
          {#each list as e (e.id)}
            {@const cover = coverOf(e)}
            <div class="card" onclick={() => openEntry(e.id)}>
              <button class="kebab" onclick={(ev) => del(ev, e.id)} title="delete">✕</button>
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
  .eyebrow{font-family:var(--mono);font-size:.64rem;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
  .htitle{font-family:var(--head);font-weight:400;font-size:calc(clamp(2rem,5vw,3.2rem)*var(--hs,1));line-height:1;margin:0;color:var(--ink);background:none;border:none;outline:none;width:100%;max-width:640px}
  .count{font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:11px;display:flex;align-items:center;gap:8px}
  .genre{background:none;border:none;outline:none;color:var(--muted);font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid transparent}
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
  .kebab{position:absolute;top:9px;right:9px;z-index:3;width:24px;height:24px;border-radius:7px;border:none;background:rgba(0,0,0,.5);color:#fff;cursor:pointer;opacity:0;transition:opacity .12s;font-size:.9rem;line-height:1}
  .card:hover .kebab{opacity:1}.kebab:hover{background:var(--accent)}
  .empty{color:var(--faint);font-style:italic;font-size:.85rem}
</style>
