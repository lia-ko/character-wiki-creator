<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import { embedInfo, EMBED_SANDBOX, EMBED_ALLOW } from '../../lib/embed.js';
  let { entry, sec } = $props();
  $effect(() => { if (!Array.isArray(entry.data[sec.key])) entry.data[sec.key] = []; });
  const list = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);
  function add(){ list.push({ url: '', caption: '' }); markDirty(); }
  async function del(i){ const r = list[i]; if (r.url && !(await confirmDelete(true, 'this embed'))) return; list.splice(i, 1); markDirty(); }
</script>

<div class="emb">
  {#each list as e, i (i)}
    {@const info = embedInfo(e.url)}
    <div class="row">
      <div class="top">
        <input class="url" bind:value={e.url} oninput={markDirty} placeholder="paste a link — YouTube, Vimeo, Spotify, a map or 3D embed URL…" />
        {#if e.url}<span class="badge" class:bad={!info.ok}>{info.ok ? info.kind : 'can’t embed'}</span>{/if}
        <button class="del" onclick={() => del(i)} title="remove" aria-label="remove embed">✕</button>
      </div>
      {#if info.ok}
        <div class="frame" style={info.height ? `height:${info.height}px` : `aspect-ratio:${info.aspect || '16 / 9'}`}>
          <iframe src={info.src} title="embed" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow={EMBED_ALLOW} allowfullscreen sandbox={info.generic ? EMBED_SANDBOX : null}></iframe>
        </div>
      {:else if e.url && e.url.trim()}
        <div class="badnote">That link can’t be embedded directly. Paste a YouTube/Vimeo/Spotify link, or the provider’s <em>embed</em> URL.</div>
      {/if}
      <input class="cap" bind:value={e.caption} oninput={markDirty} placeholder="caption (optional)" />
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add embed</button>
</div>

<style>
  .emb{display:flex;flex-direction:column;gap:14px}
  .row{border:1px solid var(--rule);border-radius:11px;background:var(--panel);padding:11px 12px;display:flex;flex-direction:column;gap:8px}
  .top{display:flex;align-items:center;gap:8px}
  .url{flex:1;min-width:0;background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;color:var(--ink);font:inherit;font-size:.86rem;padding:7px 9px;outline:none}
  .url:focus{border-color:var(--accent)}
  .url::placeholder{color:var(--faint)}
  .badge{font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--accent-soft);border:1px solid color-mix(in srgb,var(--accent) 40%,var(--rule));border-radius:20px;padding:2px 8px;white-space:nowrap}
  .badge.bad{color:#c9704a;border-color:color-mix(in srgb,#c9704a 40%,var(--rule))}
  .del{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .frame{position:relative;width:100%;border:1px solid var(--rule);border-radius:9px;overflow:hidden;background:#000}
  .frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .badnote{font-family:var(--sans);font-size:.78rem;color:var(--faint);border:1px dashed var(--rule);border-radius:8px;padding:9px 11px}
  .cap{background:none;border:none;border-top:1px solid var(--rule-soft,var(--rule));outline:none;color:var(--muted);font:inherit;font-size:.82rem;padding:6px 2px 0}
  .cap::placeholder{color:var(--faint)}
  .addbtn{align-self:flex-start;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
