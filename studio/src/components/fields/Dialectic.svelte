<script>
  import { markDirty } from '../../lib/store.svelte.js';
  let { entry, sec } = $props();
  $effect(() => { const d = entry.data[sec.key]; if (!d || typeof d !== 'object' || Array.isArray(d)) entry.data[sec.key] = { left: '', right: '' }; });
  const v = $derived(entry.data[sec.key] || { left: '', right: '' });
  const leftLabel = $derived(sec.leftLabel || 'On one hand');
  const rightLabel = $derived(sec.rightLabel || 'On the other');
  const leftTint = $derived(sec.leftTint || '#7f9ac9');
  const rightTint = $derived(sec.rightTint || '#c98a6a');
  const sep = $derived(sec.sep || '↔');
</script>

<div class="dialectic">
  <div class="side" style="--dt:{leftTint}">
    <div class="sh">{leftLabel}</div>
    <textarea bind:value={v.left} oninput={markDirty} rows="3" placeholder="…"></textarea>
  </div>
  <div class="vs">{sep}</div>
  <div class="side" style="--dt:{rightTint}">
    <div class="sh">{rightLabel}</div>
    <textarea bind:value={v.right} oninput={markDirty} rows="3" placeholder="…"></textarea>
  </div>
</div>

<style>
  .dialectic{display:grid;grid-template-columns:1fr 40px 1fr;gap:0;align-items:stretch}
  .side{border:1px solid var(--rule);border-radius:12px;border-top:2px solid var(--dt);background:var(--panel-2);padding:11px 13px}
  .sh{font-family:var(--mono);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:var(--dt);margin-bottom:7px}
  textarea{width:100%;background:none;border:none;outline:none;color:var(--ink);font:inherit;font-size:.98rem;line-height:1.5;resize:vertical}
  textarea::placeholder{color:var(--faint)}
  .vs{display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.7rem;color:var(--faint)}
  @media(max-width:600px){.dialectic{grid-template-columns:1fr}.vs{padding:6px 0}}
</style>
