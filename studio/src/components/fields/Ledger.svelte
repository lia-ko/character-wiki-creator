<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);

  // the real-vs-invented spectrum for historical (and any research-grounded) fiction
  const VERDICTS = [
    { k: 'real',     label: 'Real',     c: '#3f9d6d' },   // historically accurate
    { k: 'adapted',  label: 'Adapted',  c: '#8a5a2b' },   // real, but altered / compressed for the story
    { k: 'invented', label: 'Invented', c: '#9a3324' },   // fabricated
  ];
  const vinfo = (k) => VERDICTS.find(x => x.k === k) || VERDICTS[0];

  function add(){ list.push({ claim: '', verdict: 'real', note: '' }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.claim && r.claim.trim()) || (r.note && r.note.trim());
    if (!(await confirmDelete(has, r.claim ? '“' + r.claim + '”' : 'this row'))) return;
    list.splice(i, 1); markDirty();
  }
  function setVerdict(i, k){ list[i].verdict = k; markDirty(); }
</script>

<div class="led">
  {#each list as r, i (i)}
    <div class="lrow" style={`--vc:${vinfo(r.verdict).c}`}>
      <input class="lclaim" bind:value={r.claim} oninput={markDirty} placeholder="A fact, event, person, or detail…" />
      <div class="lverd" role="group" aria-label="standing">
        {#each VERDICTS as vd}
          <button class="vbtn" class:on={(r.verdict || 'real') === vd.k} style={`--bc:${vd.c}`} onclick={() => setVerdict(i, vd.k)} aria-pressed={(r.verdict || 'real') === vd.k}>{vd.label}</button>
        {/each}
      </div>
      <input class="lnote" bind:value={r.note} oninput={markDirty} placeholder="how it's handled / source" />
      <div class="lacts"><Reorder {list} {i} /><button class="ldel" onclick={() => del(i)} title="remove" aria-label="remove row">✕</button></div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add element</button>
  <p class="lhint">Track what's grounded in fact versus invented for the story, so the line stays clear as you write.</p>
</div>

<style>
  .led{display:flex;flex-direction:column;gap:8px}
  .lrow{display:grid;grid-template-columns:minmax(0,1.3fr) auto minmax(0,1.5fr) auto;gap:12px;align-items:center;
        border:1px solid var(--rule);border-left:3px solid var(--vc);border-radius:9px;background:var(--panel);padding:8px 12px}
  .lclaim{background:none;border:none;outline:none;font-family:var(--body);font-size:.95rem;color:var(--ink);min-width:0;width:100%}
  .lclaim::placeholder{color:var(--faint)}
  .lverd{display:inline-flex;border:1px solid var(--rule);border-radius:7px;overflow:hidden;flex:none}
  .vbtn{background:var(--panel-2);border:none;border-right:1px solid var(--rule);cursor:pointer;padding:5px 10px;
        font-family:var(--mono);font-size:.56rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);line-height:1}
  .vbtn:last-child{border-right:none}
  .vbtn:hover{color:var(--ink)}
  .vbtn.on{background:var(--bc);color:#fff}
  .lnote{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;
         font-family:var(--sans);font-size:.78rem;color:var(--muted);padding:5px 9px;min-width:0;width:100%}
  .lnote::placeholder{color:var(--faint)}
  .lnote:focus{border-color:var(--accent);color:var(--ink)}
  .lacts{display:inline-flex;align-items:center;gap:4px;flex:none}
  .ldel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .ldel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:2px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  .lhint{margin:0;font-family:var(--sans);font-size:.72rem;color:var(--faint)}
  @media(max-width:720px){
    .lrow{grid-template-columns:1fr auto;grid-template-areas:'claim acts' 'verd verd' 'note note';gap:8px}
    .lclaim{grid-area:claim}.lverd{grid-area:verd}.lnote{grid-area:note}.lacts{grid-area:acts}
  }
</style>
