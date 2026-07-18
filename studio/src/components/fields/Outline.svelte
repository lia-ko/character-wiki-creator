<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import { uid } from '../../lib/model.js';
  import Reorder from '../Reorder.svelte';
  import RichEditor from './RichEditor.svelte';
  let { entry, sec, others } = $props();
  const outline = $derived(entry.data[sec.key]);

  function setText(beat, v){ beat.text = v; markDirty(); }

  function addAct(){ outline.acts.push({ id: uid(), title: 'New act', chapters: [] }); markDirty(); }
  async function delAct(ai){ const a = outline.acts[ai]; const has = (a.chapters && a.chapters.length) || (a.title && a.title !== 'New act'); if (!(await confirmDelete(has, a.title ? '“' + a.title + '” and its chapters' : 'this act'))) return; outline.acts.splice(ai, 1); markDirty(); }
  function addChapter(ai){ outline.acts[ai].chapters.push({ id: uid(), title: 'New chapter', beats: [] }); markDirty(); }
  async function delChapter(ai, ci){ const ch = outline.acts[ai].chapters[ci]; const has = (ch.beats && ch.beats.length) || (ch.title && ch.title !== 'New chapter'); if (!(await confirmDelete(has, ch.title ? '“' + ch.title + '” and its beats' : 'this chapter'))) return; outline.acts[ai].chapters.splice(ci, 1); markDirty(); }
  function addBeat(ai, ci){ outline.acts[ai].chapters[ci].beats.push({ id: uid(), text: '' }); markDirty(); }
  async function delBeat(ai, ci, bi){ const bt = outline.acts[ai].chapters[ci].beats[bi]; if (!(await confirmDelete(bt.text && bt.text.trim(), 'this beat'))) return; outline.acts[ai].chapters[ci].beats.splice(bi, 1); markDirty(); }
</script>

<div class="outline">
  {#each outline.acts as act, ai (act.id)}
    <div class="act">
      <div class="acthead">
        <input class="acttitle" bind:value={act.title} oninput={markDirty} placeholder="Act title" />
        <Reorder list={outline.acts} i={ai} />
        <button class="delx" onclick={() => delAct(ai)} title="remove act">✕</button>
      </div>
      {#each act.chapters as ch, ci (ch.id)}
        <div class="chap">
          <div class="chaphead">
            <input class="chaptitle" bind:value={ch.title} oninput={markDirty} placeholder="Chapter title" />
            <Reorder list={act.chapters} i={ci} />
            <button class="delx" onclick={() => delChapter(ai, ci)} title="remove chapter">✕</button>
          </div>
          {#each ch.beats as beat, bi (beat.id)}
            <div class="beat">
              <span class="dot">•</span>
              <div class="beatmain">
                <RichEditor value={beat.text} multiline placeholder="beat — what happens (type [[ to tag a character)" oninput={(v) => setText(beat, v)} />
              </div>
              <Reorder list={ch.beats} i={bi} />
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
  .beat{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:start;padding:5px 0}
  .dot{color:var(--accent-soft);line-height:1.6;padding-top:2px}
  .beatmain{min-width:0}
  /* the beat body is a RichEditor: wraps, grows, supports paragraphs + inline [[ character tags */
  .beatmain :global(.ce){font-size:calc(.95rem*var(--bs,1))}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn{width:100%;margin-top:6px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn.sm{width:auto;padding:5px 12px;margin-top:6px}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
