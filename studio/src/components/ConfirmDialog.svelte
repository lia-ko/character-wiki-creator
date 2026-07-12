<script>
  import { app, confirmYes, confirmNo } from '../lib/store.svelte.js';
  let okBtn = $state(null);
  $effect(() => { if (app.confirm && okBtn) okBtn.focus(); });
  function onkey(e){
    if (e.key === 'Escape'){ e.preventDefault(); confirmNo(); }
    else if (e.key === 'Enter'){ e.preventDefault(); confirmYes(); }
  }
</script>

{#if app.confirm}
  <div class="cf">
    <button class="cfback" onclick={confirmNo} aria-label="cancel"></button>
    <div class="cfbox" role="alertdialog" aria-modal="true" tabindex="-1" onkeydown={onkey}>
      <div class="cfmsg">{app.confirm.message}</div>
      <div class="cfrow">
        <button class="cfcancel btn-ghost" onclick={confirmNo}>Cancel</button>
        <button class="cfok btn-primary" class:danger={app.confirm.danger} bind:this={okBtn} onclick={confirmYes}>{app.confirm.confirmLabel}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .cf{position:fixed;inset:0;z-index:var(--z-modal);display:flex;align-items:center;justify-content:center;padding:20px}
  .cfback{position:absolute;inset:0;background:rgba(0,0,0,.55);border:none;cursor:default;backdrop-filter:blur(2px)}
  .cfbox{position:relative;z-index:1;width:min(400px,92vw);background:var(--panel);border:1px solid var(--rule);border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.6);padding:22px}
  .cfmsg{font-size:1rem;line-height:1.5;color:var(--ink);margin-bottom:20px}
  .cfrow{display:flex;justify-content:flex-end;gap:10px}
  .cfcancel{font:inherit;font-size:.82rem;border-radius:8px;padding:8px 15px}
  .cfok{font:inherit;font-size:.82rem;border-radius:8px;padding:8px 17px}
  .cfok.danger{background:#c0392b}
</style>
