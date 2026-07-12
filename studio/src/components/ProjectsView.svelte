<script>
  import { app, openProject, addProject, deleteProject, markDirty } from '../lib/store.svelte.js';
  import { coverOf } from '../lib/model.js';
  import ThemeBar from './ThemeBar.svelte';

  function minis(project){
    const es = project.entries || [];
    const out = [];
    for (let i = 0; i < 4; i++){
      if (i === 3 && es.length > 4){ out.push({ more: es.length - 3 }); break; }
      const e = es[i];
      out.push(e ? { img: coverOf(e), label: (e.title || '?').slice(0, 2) } : { label: '' });
    }
    return out;
  }
  function del(e, id){ e.stopPropagation(); if (confirm('Delete this project and everything in it?')) deleteProject(id); }
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

  <div class="grid">
    {#each app.ws.projects as p (p.id)}
      <div class="pcard" onclick={() => openProject(p.id)}>
        <button class="kebab" onclick={(e) => del(e, p.id)} title="delete">✕</button>
        <div class="accent"></div>
        <div class="mosaic">
          {#each minis(p) as m}
            {#if m.more}<div class="m more">+{m.more}</div>
            {:else}<div class="m" style={m.img ? `background-image:url(${m.img})` : ''}>{m.img ? '' : m.label}</div>{/if}
          {/each}
        </div>
        <div class="pbody">
          <div><div class="pt">{p.name || 'Project'}</div><div class="pmeta">{p.genre || '—'}</div></div>
          <div class="pcount">{(p.entries || []).length} entr{(p.entries || []).length === 1 ? 'y' : 'ies'}</div>
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
  .accent{height:4px;background:var(--accent)}
  .mosaic{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;aspect-ratio:2/1;background:var(--rule)}
  .m{background:var(--panel-2) center/cover;display:flex;align-items:center;justify-content:center;font-family:var(--head);font-size:1.3rem;color:var(--line);text-transform:uppercase}
  .m.more{font-family:var(--mono);font-size:.7rem;color:var(--muted)}
  .pbody{padding:15px 17px 17px;display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
  .pt{font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));line-height:1.05;color:var(--ink)}
  .pmeta{font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);margin-top:6px}
  .pcount{font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
  .kebab{position:absolute;top:11px;right:11px;z-index:3;width:24px;height:24px;border-radius:7px;border:none;background:rgba(0,0,0,.5);color:#fff;cursor:pointer;opacity:0;transition:opacity .12s;font-size:.9rem;line-height:1}
  .pcard:hover .kebab{opacity:1}.kebab:hover{background:var(--accent)}
  .newcard{border:1px dashed var(--rule);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted);cursor:pointer;min-height:200px}
  .newcard:hover{border-color:var(--accent);color:var(--ink);background:var(--line)}
  .plus{font-size:1.8rem;font-family:var(--head)}
  small{font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase}
</style>
