<script>
  import { markDirty, toast } from '../../lib/store.svelte.js';
  import { dismissable } from '../../lib/dismissable.js';
  import { KIND_GENRES, applyKind, applyCustomKind, clearKind, kindOf } from '../../lib/kinds.js';

  let { entry, sec } = $props();
  const cur = $derived(kindOf(entry));
  let open = $state(false);
  let customText = $state('');

  function pick(id, label){
    applyKind(entry, id);
    markDirty();
    open = false;
    toast('Kind set to “' + label + '” — Details, gauges & sections seeded');
  }
  function pickCustom(){
    const label = customText.trim();
    if (!label) return;
    applyCustomKind(entry, label);
    customText = '';
    markDirty();
    open = false;
  }
  function clear(){ clearKind(entry); markDirty(); open = false; }
</script>

<div class="kind" use:dismissable={() => open = false}>
  <button class="kchip" class:set={cur.id} onclick={() => open = !open}>
    {#if cur.id}
      <span class="klabel">{cur.label}</span>
      {#if cur.genre}<span class="kgenre">{cur.genre.split(' · ')[0]}</span>{/if}
    {:else}
      <span class="kph">Choose a Kind…</span>
    {/if}
    <span class="kcaret">▾</span>
  </button>

  {#if open}
    <div class="kmenu">
      <div class="ksearchless">
        {#each KIND_GENRES as g (g.genre)}
          <div class="kg">
            <div class="kgh">{g.genre}</div>
            <div class="kgk">
              {#each g.kinds as k (k.id)}
                <button class="kopt" class:on={cur.id === k.id} onclick={() => pick(k.id, k.label)}>{k.label}</button>
              {/each}
            </div>
          </div>
        {/each}
        <div class="kg">
          <div class="kgh">Custom Kind</div>
          <div class="kcustom">
            <input bind:value={customText} placeholder="Name your own…" onkeydown={(e) => e.key === 'Enter' && pickCustom()} />
            <button class="kcbtn" onclick={pickCustom} disabled={!customText.trim()}>Set</button>
          </div>
        </div>
        {#if cur.id}<button class="kclear" onclick={clear}>Clear Kind</button>{/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .kind{position:relative}
  .kchip{width:100%;display:flex;align-items:center;gap:8px;border:1px dashed var(--rule);background:var(--panel-2);color:var(--muted);border-radius:8px;padding:8px 10px;cursor:pointer;text-align:left;font-family:var(--sans);font-size:.82rem}
  .kchip:hover{border-color:var(--accent);color:var(--ink)}
  .kchip.set{border-style:solid;border-color:color-mix(in srgb,var(--accent) 45%,var(--rule));background:color-mix(in srgb,var(--accent) 8%,var(--panel-2))}
  .klabel{font-family:var(--head,var(--body));font-size:1rem;color:var(--ink);line-height:1.1}
  .kgenre{font-family:var(--mono);font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 40%,var(--rule));border-radius:20px;padding:2px 6px}
  .kph{flex:1}
  .kcaret{margin-left:auto;color:var(--faint);font-size:.7rem}
  .kmenu{position:absolute;z-index:40;top:calc(100% + 5px);left:0;right:0;min-width:230px;max-height:340px;overflow:auto;background:var(--panel);border:1px solid var(--rule);border-radius:10px;box-shadow:0 12px 34px rgba(0,0,0,.4);padding:8px}
  .kg{padding:4px 2px}
  .kgh{font-family:var(--mono);font-size:.52rem;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin:6px 4px 5px}
  .kgk{display:flex;flex-wrap:wrap;gap:5px}
  .kopt{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:20px;padding:4px 10px;cursor:pointer;font-family:var(--sans);font-size:.74rem}
  .kopt:hover{border-color:var(--accent);color:var(--ink)}
  .kopt.on{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 16%,var(--panel-2));color:var(--ink)}
  .kcustom{display:flex;gap:6px;padding:0 2px}
  .kcustom input{flex:1;background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;color:var(--ink);font:inherit;font-size:.8rem;padding:6px 8px;outline:none}
  .kcustom input:focus{border-color:var(--accent)}
  .kcbtn{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:7px;padding:0 12px;cursor:pointer;font-size:.76rem}
  .kcbtn:hover:not(:disabled){border-color:var(--accent);color:var(--ink)}
  .kcbtn:disabled{opacity:.4;cursor:default}
  .kclear{width:100%;margin-top:8px;border:none;border-top:1px dashed var(--rule);background:none;color:var(--faint);padding:7px;cursor:pointer;font-family:var(--sans);font-size:.72rem}
  .kclear:hover{color:var(--accent)}
</style>
