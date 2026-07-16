<script>
  import { FAMILIES, templateFor } from '../lib/templates.js';
  import { app, newTypeAndEdit, openBuilder, importTypeFromJSON, exportAllTypes } from '../lib/store.svelte.js';
  import { dismissable } from '../lib/dismissable.js';
  // align: which edge the dropdown anchors to ('right' in a top bar, 'left' in a sidebar).
  // block: full-width trigger button (for a sidebar) vs the inline pill (top bar).
  let { oncreate, align = 'right', block = false } = $props();
  let open = $state(false);
  let q = $state('');
  let fileEl;
  const myTypes = $derived(app.ws.typeLibrary || []);
  const ql = $derived(q.trim().toLowerCase());
  // flat, searchable index of every type (built-in families + the user's own types)
  const allTypes = $derived([
    ...FAMILIES.flatMap(f => f.types.map(t => { const tpl = templateFor(t); return { type: t, icon: tpl.icon, label: tpl.label, fam: f.label }; })),
    ...myTypes.map(t => ({ type: t.type, icon: t.icon, label: t.label, fam: 'Your types' })),
  ]);
  const matches = $derived(ql ? allTypes.filter(m => (m.label || '').toLowerCase().includes(ql) || (m.fam || '').toLowerCase().includes(ql)) : []);
  function toggle(){ open = !open; if (open) q = ''; }
  function pick(type){ open = false; oncreate?.(type); }
  function makeType(){ open = false; newTypeAndEdit(); }
  function editType(id){ open = false; openBuilder(id); }
  function importType(){ open = false; fileEl?.click(); }
  async function onFile(e){
    const f = e.target.files?.[0]; if (!f) return;
    const added = importTypeFromJSON(await f.text());
    e.target.value = '';
    if (added && added.length) openBuilder(added[0].type);
  }
  function focusOnMount(node){ node.focus(); }
</script>

<div class="newwrap" class:block use:dismissable={() => open = false}>
  <button class="newbtn btn-primary" class:block onclick={toggle} aria-expanded={open}>＋ New entry <span class="caret">▾</span></button>
  {#if open}
    <div class="menu" class:left={align === 'left'}>
      <input class="nsearch" use:focusOnMount bind:value={q} placeholder="Filter types — character, faction…" spellcheck="false" />
      <div class="nlist">
        {#if ql}
          {#each matches as m (m.type)}
            <button class="menuitem" onclick={() => pick(m.type)}><span class="mi-ic">{m.icon}</span><span class="mi-nm">{m.label}</span><span class="mfam">{m.fam}</span></button>
          {/each}
          {#if !matches.length}<div class="nnone">No types match “{q}”.</div>{/if}
        {:else}
          {#each FAMILIES as f}
            <div class="menufam">{f.label}</div>
            {#each f.types as t}
              {@const tpl = templateFor(t)}
              <button class="menuitem" onclick={() => pick(t)}><span class="mi-ic">{tpl.icon}</span><span class="mi-nm">{tpl.label}</span></button>
            {/each}
          {/each}
          {#if myTypes.length}
            <div class="menufam">Your types</div>
            {#each myTypes as t}
              <div class="myrow">
                <button class="menuitem grow" onclick={() => pick(t.type)}><span class="mi-ic">{t.icon}</span><span class="mi-nm">{t.label}</span></button>
                <button class="editt" onclick={() => editType(t.type)} title="edit this type">⚙</button>
              </div>
            {/each}
          {/if}
        {/if}
      </div>
      <div class="nfoot">
        <button class="footbtn make" onclick={makeType}><span class="mi-ic">＋</span> New sheet type…</button>
        <button class="footbtn ico" onclick={importType} title="Import a type from a file">↥</button>
        {#if myTypes.length}<button class="footbtn ico" onclick={() => { open = false; exportAllTypes(); }} title="Export all your types">↧</button>{/if}
      </div>
    </div>
  {/if}
  <input bind:this={fileEl} type="file" accept=".json,application/json" onchange={onFile} style="display:none" />
</div>

<style>
  .newwrap{position:relative;flex:none}
  .newwrap.block{display:block;width:100%}
  .newbtn{font:inherit;font-size:.8rem;border-radius:8px;padding:8px 15px;display:flex;align-items:center;gap:8px}
  .newbtn.block{width:100%;justify-content:center}
  .caret{font-size:.62rem;opacity:.85}
  .menu{position:absolute;top:calc(100% + 6px);right:0;z-index:var(--z-dropdown);width:270px;max-width:92vw;background:var(--panel);border:1px solid var(--rule);border-radius:12px;box-shadow:0 18px 44px rgba(0,0,0,.5);max-height:min(72vh,480px);display:flex;flex-direction:column;overflow:hidden}
  .menu.left{right:auto;left:0}
  .nsearch{flex:none;margin:0;padding:10px 12px;background:var(--panel);border:none;border-bottom:1px solid var(--rule);color:var(--ink);font:inherit;font-size:.82rem;outline:none}
  .nsearch::placeholder{color:var(--faint)}
  .nlist{flex:1;min-height:0;overflow:auto;padding:6px}
  .menufam{font-family:var(--mono);font-size:.58rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--faint);padding:9px 10px 4px}
  .menuitem{display:flex;align-items:center;gap:10px;width:100%;font:inherit;font-size:.86rem;text-align:left;background:none;border:none;border-radius:7px;padding:7px 10px;cursor:pointer;color:var(--ink)}
  .menuitem:hover{background:var(--panel-2)}
  .mi-ic{color:var(--accent-soft);width:1.1em;text-align:center;flex:none}
  .mi-nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mfam{font-family:var(--mono);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);flex:none}
  .myrow{display:flex;align-items:center;gap:2px}
  .myrow .grow{flex:1}
  .editt{border:none;background:none;color:var(--faint);cursor:pointer;border-radius:6px;padding:6px 8px;font-size:.8rem}
  .editt:hover{background:var(--panel-2);color:var(--ink)}
  .nnone{padding:12px 10px;color:var(--faint);font-size:.82rem}
  .nfoot{flex:none;display:flex;align-items:center;gap:4px;padding:6px;border-top:1px solid var(--rule);background:var(--panel)}
  .footbtn{font:inherit;font-size:.8rem;background:var(--panel-2);border:1px solid var(--rule);border-radius:8px;padding:7px 11px;cursor:pointer;color:var(--ink);display:flex;align-items:center;gap:7px}
  .footbtn:hover{border-color:var(--accent)}
  .footbtn.make{flex:1;color:var(--accent-soft)}
  .footbtn.make .mi-ic{color:var(--accent-soft)}
  .footbtn.ico{padding:7px 10px;color:var(--muted)}
</style>
