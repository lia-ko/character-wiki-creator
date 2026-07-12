<script>
  import { app, openProject, addProject, deleteProject, markDirty, toast, undo } from '../lib/store.svelte.js';
  import { coverOf } from '../lib/model.js';
  import ThemeBar from './ThemeBar.svelte';
  import FontSample from './FontSample.svelte';
  import Reorder from './Reorder.svelte';

  const heroCover = (p) => { const es = p.entries || []; for (const e of es){ const c = coverOf(e); if (c) return c; } return ''; };
  function del(e, id){ e.stopPropagation(); const proj = app.ws.projects.find(x => x.id === id); deleteProject(id); toast(`Deleted project “${proj?.name || ''}”`, { actionLabel: 'Undo', action: undo }); }
</script>

<div class="wrap">
  <div class="hero">
    <div>
      <div class="eyebrow">Workspace</div>
      <input class="htitle" bind:value={app.ws.title} oninput={markDirty} placeholder="World title" />
      <div class="count">{app.ws.projects.length} project{app.ws.projects.length === 1 ? '' : 's'} · nothing leaves your machine</div>
    </div>
    <ThemeBar target={app.ws} />
  </div>

  <FontSample />

  <div class="grid">
    {#each app.ws.projects as p, pi (p.id)}
      {@const es = p.entries || []}
      {@const hero = p.cover || heroCover(p)}
      <div class="pcard" onclick={() => openProject(p.id)}>
        <div class="cardctl">
          <Reorder horizontal list={app.ws.projects} i={pi} />
          <button class="kebab" onclick={(e) => del(e, p.id)} title="delete">✕</button>
        </div>
        <div class="phero" style={hero ? `background-image:url(${hero})` : ''}>
          {#if !hero}<span class="pini">{(p.name || '?').slice(0, 2)}</span>{/if}
        </div>
        <div class="pbody">
          <div class="pt">{p.name || 'Project'}</div>
          <div class="pmeta">{#if p.genre}{p.genre} · {/if}{es.length} entr{es.length === 1 ? 'y' : 'ies'}</div>
        </div>
      </div>
    {/each}
    <div class="newcard" onclick={addProject}><span class="plus">＋</span><small>New project</small></div>
  </div>
</div>

<style>
  .wrap{max-width:1180px;margin:0 auto;padding:40px 26px 90px}
  .hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--rule)}
  .eyebrow{font-family:var(--mono);font-size:.64rem;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
  .htitle{font-family:var(--head);font-weight:400;font-size:calc(clamp(2rem,5vw,3.2rem)*var(--hs,1));line-height:1;margin:0;color:var(--ink);background:none;border:none;outline:none;width:100%;max-width:640px}
  .htitle:focus{border-bottom:1px solid var(--rule)}
  .count{font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:11px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
  .pcard{position:relative;background:var(--panel);border:1px solid var(--rule);border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .12s,border-color .12s,box-shadow .12s;display:flex;flex-direction:column}
  .pcard:hover{transform:translateY(-3px);border-color:var(--accent);box-shadow:0 16px 36px rgba(0,0,0,.5)}
  .phero{position:relative;aspect-ratio:4/3;background:var(--panel-2) center/cover;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--rule)}
  .phero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.5))}
  .pini{font-family:var(--head);font-size:3.4rem;color:var(--line);text-transform:uppercase}
  .pbody{padding:15px 17px 17px}
  .pt{font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));line-height:1.08;color:var(--ink)}
  .pmeta{font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-soft);margin-top:8px}
  .cardctl{position:absolute;top:11px;right:11px;z-index:3;display:flex;align-items:center;gap:6px;opacity:0;transition:opacity .12s}
  .pcard:hover .cardctl{opacity:1}
  .kebab{width:24px;height:24px;border-radius:7px;border:none;background:rgba(0,0,0,.5);color:#fff;cursor:pointer;font-size:.9rem;line-height:1}
  .kebab:hover{background:var(--accent)}
  .newcard{border:1px dashed var(--rule);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted);cursor:pointer;min-height:200px}
  .newcard:hover{border-color:var(--accent);color:var(--ink);background:var(--line)}
  .plus{font-size:1.8rem;font-family:var(--head)}
  small{font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase}
</style>
