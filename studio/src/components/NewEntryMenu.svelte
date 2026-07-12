<script>
  import { FAMILIES, templateFor } from '../lib/templates.js';
  import { dismissable } from '../lib/dismissable.js';
  let { oncreate } = $props();
  let open = $state(false);
  function pick(type){ open = false; oncreate?.(type); }
</script>

<div class="newwrap" use:dismissable={() => open = false}>
  <button class="newbtn btn-primary" onclick={() => open = !open} aria-expanded={open}>＋ New entry <span class="caret">▾</span></button>
  {#if open}
    <div class="menu">
      {#each FAMILIES as f}
        <div class="menufam">{f.label}</div>
        {#each f.types as t}
          {@const tpl = templateFor(t)}
          <button class="menuitem" onclick={() => pick(t)}><span class="mi-ic">{tpl.icon}</span> {tpl.label}</button>
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  .newwrap{position:relative;flex:none}
  .newbtn{font:inherit;font-size:.8rem;border-radius:8px;padding:8px 15px;display:flex;align-items:center;gap:8px}
  .caret{font-size:.62rem;opacity:.85}
  .menu{position:absolute;top:calc(100% + 6px);right:0;z-index:var(--z-dropdown);min-width:210px;background:var(--panel);border:1px solid var(--rule);border-radius:12px;padding:6px;box-shadow:0 18px 44px rgba(0,0,0,.5);max-height:min(70vh,460px);overflow:auto}
  .menufam{font-family:var(--mono);font-size:.58rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--faint);padding:9px 10px 4px}
  .menuitem{display:flex;align-items:center;gap:10px;width:100%;font:inherit;font-size:.86rem;text-align:left;background:none;border:none;border-radius:7px;padding:7px 10px;cursor:pointer;color:var(--ink)}
  .menuitem:hover{background:var(--panel-2)}
  .mi-ic{color:var(--accent-soft);width:1.1em;text-align:center;flex:none}
</style>
