<script>
  // fixed bottom bar shown while in multi-select export mode
  let { count = 0, busy = false, oncancel, onexport } = $props();
</script>

<div class="selbar">
  <span class="selinfo"><b>{count}</b> selected</span>
  <span class="selhint">{count <= 1 ? 'exports one .html sheet' : 'exports a cross-linked .zip'}</span>
  <span class="grow"></span>
  <button class="selcancel" onclick={oncancel}>Cancel</button>
  <button class="selexport" onclick={onexport} disabled={!count || busy}>{busy ? 'Exporting…' : 'Export ↓'}</button>
</div>

<style>
  .selbar{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:120;display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--rule);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.5);padding:10px 12px 10px 18px;max-width:min(620px,92vw)}
  .selinfo{font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
  .selinfo b{color:var(--ink);font-size:.95rem}
  .selhint{font-size:.72rem;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .grow{flex:1;min-width:8px}
  .selcancel{font:inherit;font-size:.78rem;background:none;color:var(--muted);border:1px solid var(--rule);border-radius:8px;padding:7px 13px;cursor:pointer}
  .selcancel:hover{border-color:var(--accent);color:var(--ink)}
  .selexport{font:inherit;font-size:.78rem;font-weight:600;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:8px 15px;cursor:pointer;white-space:nowrap}
  .selexport:hover{opacity:.92}
  .selexport:disabled{opacity:.5;cursor:default}
</style>
