<script>
  import { app, dismissToast } from '../lib/store.svelte.js';
  function act(){ const a = app.toast?.action; dismissToast(); if (a) a(); }
</script>

{#if app.toast}
  {#key app.toast.id}
    <div class="toast">
      <span class="tmsg">{app.toast.msg}</span>
      {#if app.toast.actionLabel}<button class="tact btn-primary" onclick={act}>{app.toast.actionLabel}</button>{/if}
      <button class="tx" onclick={dismissToast} aria-label="dismiss">✕</button>
    </div>
  {/key}
{/if}

<style>
  .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:var(--z-toast);display:flex;align-items:center;gap:14px;max-width:min(560px,92vw);background:var(--panel);color:var(--ink);border:1px solid var(--rule);border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.55);padding:11px 12px 11px 18px;animation:tin .18s ease}
  @keyframes tin{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
  .tmsg{font-size:.86rem;line-height:1.3}
  .tact{font:inherit;font-size:.78rem;border-radius:7px;padding:6px 13px;white-space:nowrap}
  .tx{background:none;border:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 4px}
  .tx:hover{color:var(--ink)}
</style>
