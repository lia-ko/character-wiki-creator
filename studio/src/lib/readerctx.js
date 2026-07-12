/* Shared reader-render context. The exporter, the single/bundle sheet export, and the
   in-app preview all render entries through renderEntry(entry, ctx) and were each hand-building
   the same cover/title maps + ctx object. This centralizes that so they stay in lockstep;
   only `href` (and the optional sidebar) differ per caller. */

import { coverOf, backlinksFor, projectEvents } from './model.js';

// Build the per-project lookups ONCE, then reuse across every entry in that project.
export function readerMaps(project){
  const cover = {}, title = {};
  (project.entries || []).forEach(e => { cover[e.id] = coverOf(e); title[e.id] = e.title; });
  return { cover, title, events: projectEvents(project) };
}

// Assemble a ctx from prebuilt maps. `project` is the real project (for backlinks); pass
// `sidebarProject` (+ currentId) to render the nav shell scoped to that set.
export function baseCtx(project, maps, { href, hubHref = null, currentId = null, sidebarProject = null, entry = null } = {}){
  const ctx = {
    href: href || (() => null),
    cover: (id) => maps.cover[id] || null,
    title: (id) => (maps.title[id] != null ? maps.title[id] : null),
    events: maps.events,
    hubHref,
    crumb: project.name,
  };
  if (entry) ctx.backlinks = backlinksFor(entry, project);
  if (sidebarProject){ ctx.project = sidebarProject; if (currentId) ctx.currentId = currentId; }
  return ctx;
}
