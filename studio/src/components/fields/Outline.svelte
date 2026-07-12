<script>
  import { markDirty } from '../../lib/store.svelte.js';
  import { uid } from '../../lib/model.js';
  let { entry, sec, others } = $props();
  const outline = $derived(entry.data[sec.key]);

  function titleOf(id){ const o = others.find(x => x.id === id); return o ? (o.title || 'Untitled') : '⚠ missing'; }

  function addAct(){ outline.acts.push({ id: uid(), title: 'New act', chapters: [] }); markDirty(); }
  function delAct(ai){ outline.acts.splice(ai, 1); markDirty(); }
  function addChapter(ai){ outline.acts[ai].chapters.push({ id: uid(), title: 'New chapter', beats: [] }); markDirty(); }
  function delChapter(ai, ci){ outline.acts[ai].chapters.splice(ci, 1); markDirty(); }
  function addBeat(ai, ci){ outline.acts[ai].chapters[ci].beats.push({ id: uid(), text: '', links: [] }); markDirty(); }
  function delBeat(ai, ci, bi){ outline.acts[ai].chapters[ci].beats.splice(bi, 1); markDirty(); }
  function addLink(beat, id){ if (id && !beat.links.includes(id)){ beat.links.push(id); markDirty(); } }
  function delLink(beat, id){ beat.links = beat.links.filter(x => x !== id); markDirty(); }
</script>

<div class="outline">
  {#each outline.acts as act, ai (act.id)}
    <div class="act">
      <div class="acthead">
        <input class="acttitle" bind:value={act.title} oninput={markDirty} placeholder="Act title" />
        <button class="delx" onclick={() => delAct(ai)} title="remove act">✕</button>
      </div>
      {#each act.chapters as ch, ci (ch.id)}
        <div class="chap">
          <div class="chaphead">
            <input class="chaptitle" bind:value={ch.title} oninput={markDirty} placeholder="Chapter title" />
            <button class="delx" onclick={() => delChapter(ai, ci)} title="remove chapter">✕</button>
          </div>
          {#each ch.beats as beat, bi (beat.id)}
            <div class="beat">
              <span class="dot">•</span>
              <div class="beatmain">
                <input class="beattext" bind:value={beat.text} oninput={markDirty} placeholder="beat — what happens" />
                <div class="links">
                  {#each beat.links as id}
                    <button class="chip" onclick={() => delLink(beat, id)} title="unlink">{titleOf(id)} ✕</button>
                  {/each}
                  {#if others.length}
                    <select class="addlink" value="" onchange={(e) => { addLink(beat, e.target.value); e.target.value=''; }}>
                      <option value="">＋ link</option>
                      {#each others as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
                    </select>
                  {/if}
                </div>
              </div>
              <button class="delx" onclick={() => delBeat(ai, ci, bi)} title="remove beat">✕</button>
            </div>
          {/each}
          <button class="addbtn sm" onclick={() => addBeat(ai, ci)}>＋ beat</button>
        </div>
      {/each}
      <button class="addbtn sm" onclick={() => addChapter(ai)}>＋ chapter</button>
    </div>
  {/each}
  <button class="addbtn" onclick={addAct}>＋ Add act</button>
</div>

<style>
  .outline{display:flex;flex-direction:column;gap:14px}
  .act{border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:12px 14px}
  .acthead{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .acttitle{flex:1;background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.3rem*var(--hs,1));color:var(--ink)}
  .chap{border-left:2px solid var(--rule);margin:8px 0 8px 6px;padding:4px 0 4px 12px}
  .chaphead{display:flex;align-items:center;gap:8px}
  .chaptitle{flex:1;background:none;border:none;outline:none;font-family:var(--mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
  .beat{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;padding:5px 0}
  .dot{color:var(--accent-soft);line-height:1.8}
  .beatmain{min-width:0}
  .beattext{width:100%;background:none;border:none;outline:none;font-family:var(--body);font-size:calc(.95rem*var(--bs,1));color:var(--ink)}
  .links{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px;align-items:center}
  .chip{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:20px;padding:2px 9px;font-family:var(--mono);font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
  .chip:hover{border-color:var(--accent);color:var(--ink)}
  .addlink{background:none;border:1px dashed var(--rule);color:var(--faint);border-radius:20px;padding:2px 6px;font-family:var(--mono);font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn{width:100%;margin-top:6px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn.sm{width:auto;padding:5px 12px;margin-top:6px}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
