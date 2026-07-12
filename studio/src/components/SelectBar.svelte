<script>
  // fixed bottom bar shown while in multi-select export mode
  let { count = 0, busy = false, oncancel, onexport } = $props();
</script>

<div class="selbar">
  <span class="selinfo"><b>{count}</b> selected</span>
  <span class="selhint">{count <= 1 ? 'exports one .html sheet' : 'exports a cross-linked .zip'}</span>
  <span class="grow"></span>
  <button class="selcancel btn-ghost" onclick={oncancel}>Cancel</button>
  <button class="selexport btn-primary" onclick={onexport} disabled={!count || busy}>{busy ? 'Exporting…' : 'Export ↓'}</button>
</div>

<style>
  .selbar{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:var(--z-float);display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--rule);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.5);padding:10px 12px 10px 18px;max-width:min(620px,92vw)}
  .selinfo{font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
  .selinfo b{color:var(--ink);font-size:.95rem}
  .selhint{font-size:.72rem;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .grow{flex:1;min-width:8px}
  .selcancel{font:inherit;font-size:.78rem;border-radius:8px;padding:7px 13px}
  .selexport{font:inherit;font-size:.78rem;border-radius:8px;padding:8px 15px;white-space:nowrap}
</style>
