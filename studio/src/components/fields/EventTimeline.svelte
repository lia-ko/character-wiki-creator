<script>
  import { curProject, openEntry } from '../../lib/store.svelte.js';
  let { entry } = $props();

  // Read an event's "Date" (or Year/When) stat value.
  function dateOf(e){
    const stats = (e.data && e.data.stats) || [];
    const hit = stats.find(s => /date|year|when/i.test(s.k)) || stats[0];
    return hit ? hit.v : '';
  }
  // Best-effort sortable year: last number in the string (so "Dec 13, 1471" → 1471).
  function yearOf(str){
    const m = String(str || '').match(/-?\d+/g);
    return m ? parseInt(m[m.length - 1], 10) : null;
  }

  const events = $derived.by(() => {
    const p = curProject();
    const list = (p?.entries || []).filter(e => e.type === 'event')
      .map((e, idx) => ({ id: e.id, title: e.title, date: dateOf(e), year: yearOf(dateOf(e)), idx }));
    return list.sort((a, b) => {
      const au = a.year == null, bu = b.year == null;
      if (au && bu) return a.idx - b.idx;      // both undated: keep authoring order
      if (au) return 1; if (bu) return -1;      // undated go last
      return a.year - b.year || a.idx - b.idx;  // by year
    });
  });
</script>

<div class="etl">
  {#if events.length <= 1}
    <p class="hint">Add more <b>Events</b> to this project (give each a <b>Date</b>) and they'll line up here in order.</p>
  {:else}
    <div class="track">
      <div class="line"></div>
      {#each events as ev (ev.id)}
        <button class="node" class:current={ev.id === entry.id} onclick={() => openEntry(ev.id)} title={ev.title}>
          <span class="date">{ev.date || '—'}</span>
          <span class="dot"></span>
          <span class="ttl">{ev.title || 'Untitled'}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .etl{border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:14px 12px}
  .hint{margin:0;font-size:.82rem;color:var(--faint)}
  .hint b{color:var(--muted)}
  .track{position:relative;display:flex;gap:8px;overflow-x:auto;padding:6px 4px 2px}
  .line{position:absolute;left:8px;right:8px;top:50%;height:2px;background:var(--rule)}
  .node{position:relative;z-index:1;background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:96px;padding:2px}
  .date{font-family:var(--mono);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);white-space:nowrap}
  .dot{width:12px;height:12px;border-radius:50%;background:var(--panel-2);border:2px solid var(--rule);transition:.12s}
  .node:hover .dot{border-color:var(--accent-soft)}
  .node.current .dot{background:var(--accent);border-color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 22%,transparent)}
  .ttl{font-family:var(--body);font-size:.78rem;color:var(--muted);text-align:center;line-height:1.25;max-width:120px}
  .node.current .ttl{color:var(--ink)}
</style>
