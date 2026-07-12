<script>
  import { FACES, stackOf } from '../lib/theme.js';
  let { value = $bindable(), onpick } = $props();
  let open = $state(false);
  const cur = $derived(FACES.find(f => f.id === value) || FACES[0]);
  const serif = FACES.filter(f => f.cat === 'serif');
  const sans = FACES.filter(f => f.cat === 'sans');
  function pick(id){ value = id; open = false; onpick && onpick(); }
</script>

<div class="fpick">
  <button type="button" class="fptrig" onclick={() => open = !open} aria-expanded={open}>
    <span class="fpname" style="font-family:{stackOf(cur.id)}">{cur.name}</span>
    <span class="fpcar">▾</span>
  </button>
  {#if open}
    <button class="fpback" onclick={() => open = false} aria-label="close font picker"></button>
    <div class="fpmenu">
      <div class="fpsec">Serif</div>
      {#each serif as f}
        <button type="button" class="fopt" class:on={f.id === value} onclick={() => pick(f.id)}>
          <span style="font-family:{stackOf(f.id)}">{f.name}</span>
          {#if f.id === value}<span class="fck">✓</span>{/if}
        </button>
      {/each}
      <div class="fpsec">Sans</div>
      {#each sans as f}
        <button type="button" class="fopt" class:on={f.id === value} onclick={() => pick(f.id)}>
          <span style="font-family:{stackOf(f.id)}">{f.name}</span>
          {#if f.id === value}<span class="fck">✓</span>{/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .fpick{position:relative}
  .fptrig{display:flex;align-items:center;gap:7px;font:inherit;font-size:.8rem;text-transform:none;letter-spacing:0;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:5px 9px;cursor:pointer;max-width:172px}
  .fptrig:hover{border-color:var(--accent)}
  .fpname{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .fpcar{font-size:.6rem;color:var(--faint);flex:none}
  .fpback{position:fixed;inset:0;z-index:49;background:none;border:none;cursor:default}
  .fpmenu{position:absolute;top:calc(100% + 6px);left:0;z-index:50;width:250px;max-height:min(64vh,440px);overflow:auto;padding:6px;background:var(--panel);border:1px solid var(--rule);border-radius:12px;box-shadow:0 18px 44px rgba(0,0,0,.5)}
  .fpsec{font-family:var(--mono);font-size:.54rem;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);padding:10px 10px 4px}
  .fopt{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;font-size:1.05rem;background:none;border:none;border-radius:7px;padding:8px 12px;cursor:pointer;color:var(--ink);line-height:1.15}
  .fopt:hover{background:var(--panel-2)}
  .fopt.on{background:var(--panel-2)}
  .fck{font-family:var(--mono);font-size:.7rem;color:var(--accent);flex:none}
</style>
