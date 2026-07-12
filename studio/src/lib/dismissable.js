/* Svelte action: `use:dismissable={onClose}` on a popover's wrapper (trigger + menu).
   Calls onClose() on a pointerdown outside the wrapper, or on Escape. Replaces the
   invisible full-screen backdrop <button> each dropdown used to hand-roll. */
export function dismissable(node, onClose){
  const onDown = (e) => { if (!node.contains(e.target)) onClose?.(); };
  const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('keydown', onKey);
  return {
    update(fn){ onClose = fn; },
    destroy(){ document.removeEventListener('pointerdown', onDown, true); document.removeEventListener('keydown', onKey); },
  };
}
