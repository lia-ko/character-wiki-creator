/* ============ TEMPLATE REGISTRY ============
   Every sheet type is a template: a title/subtitle plus an ordered list of typed
   sections. The editor renders/edits any entry from its template, and the exporter
   renders any entry to static HTML. Adding a new sheet type = adding a template here.

   Section types:
     richline     one rich paragraph (bold/italic) — used as a lead
     stats        key/value rows (infobox facts)          [slot: aside]
     gallery      array of images                         [slot: aside]
     richsections list of { h, body } rich prose blocks
     relations    list of { name, role, status, targetId, img, body }
     taggroups    list of { name, items:[{ name, note }] } chip groups
     excerpts     list of { title, body, source } quotes
     outline      acts -> chapters -> beats (plot structure)
*/

export const TEMPLATES = {
  character: {
    type: 'character', label: 'Character', plural: 'Characters', icon: '✦', layout: 'split',
    title: { ph: 'Name' }, subtitle: { ph: 'concept / role (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Portraits', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Age','Pronouns','Role','Status'] },
      { key: 'bio', label: 'Biography', type: 'richsections', slot: 'main' },
      { key: 'arc', label: 'Arc & interiority', type: 'arc', slot: 'main', optional: true },
      { key: 'relationships', label: 'Relationships', type: 'relations', slot: 'main', optional: true },
      { key: 'homes', label: 'Home & haunts', type: 'relations', slot: 'main', display: 'expand', optional: true },
      { key: 'skills', label: 'Abilities & skills', type: 'taggroups', slot: 'main', optional: true },
      { key: 'tropes', label: 'Tropes', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Excerpts', type: 'excerpts', slot: 'main', optional: true },
      { key: 'soundtrack', label: 'Soundtrack', type: 'spotify', slot: 'main', optional: true },
    ],
  },
  location: {
    type: 'location', label: 'Location', plural: 'Locations', icon: '⌖', layout: 'codex',
    title: { ph: 'Place name' }, subtitle: { ph: 'region / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* aside rail: Kind chooser → imagery → Details → At a glance */
      { key: 'kind', label: 'Kind', type: 'kind', slot: 'aside' },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','Type','Population','Ruler','Status'] },
      { key: 'gauges', label: 'At a glance', type: 'gauges', slot: 'aside', optional: true },
      /* article */
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'features', label: 'Features', type: 'taggroups', slot: 'main', optional: true },
      { key: 'notable', label: 'Notable figures & sites', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'businesses', label: 'Shops & businesses', type: 'relations', slot: 'main', display: 'expand', optional: true },
      { key: 'hidden', label: 'The hidden', type: 'richsections', slot: 'main', optional: true },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  dwelling: {
    type: 'dwelling', label: 'Dwelling / Base', plural: 'Dwellings', icon: '⏢', layout: 'hero', media: 'feature',
    title: { ph: 'Place name (e.g. Ravenhold Manor)' }, subtitle: { ph: 'kind (manor, safehouse, hideout, ship…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Kind','Owner','Located in','Occupants','Built','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'occupants', label: 'Occupants & staff', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'features', label: 'Rooms & features', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  business: {
    type: 'business', label: 'Business / Establishment', plural: 'Businesses', icon: '⚖', layout: 'hero', media: 'feature',
    title: { ph: 'Establishment name (e.g. The Prancing Pony)' }, subtitle: { ph: 'kind (tavern, smithy, shop…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Storefront & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Proprietor','Located in','Founded','Specialty','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'staff', label: 'Proprietor & staff', type: 'relations', slot: 'main' },
      { key: 'wares', label: 'Wares & services', type: 'taggroups', slot: 'main', optional: true },
      { key: 'patrons', label: 'Patrons & ties', type: 'relations', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  house: {
    type: 'house', label: 'House / Family', plural: 'Houses', icon: '⌂', layout: 'hero', media: 'sigil', motto: true,
    title: { ph: 'House / family name (e.g. House Stark)' }, subtitle: { ph: 'words / motto (e.g. Winter is Coming)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Sigil & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Seat','Head','Founded','Region','Allegiance','Status'] },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main' },
      { key: 'lineage', label: 'Lineage', type: 'familytree', slot: 'main', optional: true },
      { key: 'allegiances', label: 'Allegiances & ties', type: 'allegianceweb', slot: 'main', optional: true },
      { key: 'holdings', label: 'Seats & holdings', type: 'relations', slot: 'main' },
      { key: 'tenets', label: 'Words & traditions', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  organization: {
    type: 'organization', label: 'Organization', plural: 'Organizations', icon: '⬡', layout: 'hero', media: 'sigil',
    title: { ph: 'Organization name' }, subtitle: { ph: 'kind (order, guild, faith, council…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Emblem & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Leader','Seat','Allegiance','Status'] },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main' },
      { key: 'base', label: 'Base of operations', type: 'relations', slot: 'main', display: 'expand', optional: true },
      { key: 'members', label: 'Members & ranks', type: 'relations', slot: 'main' },
      { key: 'ties', label: 'Allies & rivals', type: 'relations', slot: 'main', optional: true },
      { key: 'tenets', label: 'Tenets & traits', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  /* ---- a distinct kind of people / beings — flexible across biological species
     (Asari, werewolves) and culturally-defined peoples (Air Nomads). Lean core +
     opt-in specialist sections so a cultural people isn't shown empty "banes". ---- */
  species: {
    type: 'species', label: 'Species / People', plural: 'Peoples', icon: '❂', layout: 'codex',
    title: { ph: 'Name (e.g. Asari · Air Nomads · Werewolves)' }, subtitle: { ph: 'kind / concept (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* — composable infobox (aside rail) — */
      { key: 'gallery', label: 'Depiction', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Kind','Origin','Homeland','Lifespan','Population','Status'] },
      { key: 'powers', label: 'Powers & abilities', type: 'taggroups', slot: 'aside', optional: true },
      { key: 'weaknesses', label: 'Weaknesses & banes', type: 'taggroups', slot: 'aside', optional: true },
      /* — the article (main) — */
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'society', label: 'Society & culture', type: 'richsections', slot: 'main', optional: true },
      { key: 'lifecycle', label: 'Lifecycle', type: 'richsections', slot: 'main', optional: true },
      { key: 'history', label: 'History', type: 'history', slot: 'main', optional: true },
      { key: 'ties', label: 'Relations with other groups', type: 'ties', slot: 'main', optional: true, linkTypes: ['species','organization','house','realm'] },
      { key: 'subtypes', label: 'Subtypes & breeds', type: 'relations', slot: 'band', display: 'expand', optional: true, linkTypes: ['species','article'], addLabel: 'subtype' },
      { key: 'members', label: 'Notable members', type: 'relations', slot: 'main', optional: true, linkTypes: ['character'], addLabel: 'member' },
      { key: 'excerpts', label: 'Lore & accounts', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  /* ---- realm / setting: a genre-neutral place codex. A `kind` chooser (see
     kinds.js) seeds the Details keys, the At-a-glance gauges, and reveals the
     genre-relevant sections; the lean core below works with no Kind at all.
     Most article sections are opt-in so a blank sheet isn't a fantasy form. ---- */
  realm: {
    type: 'realm', label: 'Realm / Setting', plural: 'Realms', icon: '⬢', layout: 'codex', mapStyle: true,
    title: { ph: 'Realm / setting name' }, subtitle: { ph: 'kingdom · station · sprawl · megacity…' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* aside rail: Kind chooser → map → Details → At a glance */
      { key: 'kind', label: 'Kind', type: 'kind', slot: 'aside' },
      { key: 'gallery', label: 'Map & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Capital','Government','Population','Status'] },
      { key: 'gauges', label: 'At a glance', type: 'gauges', slot: 'aside', optional: true },
      /* article — lean core (geography · locations · powers · passages); the rest opt-in / Kind-seeded */
      { key: 'geography', label: 'Geography & description', type: 'richsections', slot: 'main' },
      { key: 'government', label: 'Government & law', type: 'richsections', slot: 'main', optional: true },
      { key: 'economy', label: 'Economy & trade', type: 'richsections', slot: 'main', optional: true },
      { key: 'military', label: 'Military & defense', type: 'richsections', slot: 'main', optional: true },
      { key: 'systems', label: 'Systems & infrastructure', type: 'richsections', slot: 'main', optional: true },
      { key: 'culture', label: 'Culture & daily life', type: 'richsections', slot: 'main', optional: true },
      { key: 'districts', label: 'Districts & quarters', type: 'taggroups', slot: 'main', optional: true },
      { key: 'locations', label: 'Notable locations', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'powers', label: 'Powers & factions', type: 'relations', slot: 'main' },
      { key: 'peoples', label: 'Peoples & cultures', type: 'taggroups', slot: 'main', optional: true },
      { key: 'hidden', label: 'The hidden', type: 'richsections', slot: 'main', optional: true },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main', optional: true },
      { key: 'relations', label: 'Relations', type: 'ties', slot: 'main', optional: true, linkTypes: ['realm','organization','house','species'] },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  /* ---- relationship: a first-class sheet for a key pairing, linked to its two Character
     entries (both get an auto-backlink). Genre-neutral — a romance, rivalry, mentor/protégé,
     a pair of foils. The `dyad` field carries the whole core: the two people + dynamic +
     status, the central tension, and the MIRRORED his/her columns (asymmetry is the point).
     Key moments reuse the History timeline (★ = the black moment / turning point). ---- */
  relationship: {
    type: 'relationship', label: 'Relationship', plural: 'Relationships', icon: '↔', layout: 'hero', media: 'none',
    title: { ph: 'The pairing (e.g. Cael & Bren)' }, subtitle: { ph: 'dynamic (optional)' },
    sections: [
      { key: 'summary', label: 'The pitch', type: 'richline', slot: 'main', lead: true },
      { key: 'dyad', label: 'The pairing', type: 'dyad', slot: 'main' },
      { key: 'trajectory', label: 'Trajectory', type: 'arc', mode: 'relationship', slot: 'main', optional: true },
      { key: 'beats', label: 'Key moments', type: 'history', slot: 'main' },
      { key: 'notes', label: 'Notes', type: 'richsections', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  /* ---- case: the investigation dossier for a mystery. A `suspects` grid (motive/means/
     opportunity/alibi + suspicion + a writer-only guilty flag) and `clues` as two-faced
     cards (reads-as vs means · genuine/red-herring · implicates · planted-where). The
     solution is a `sealed` section — tucked behind a spoiler in the read/export view.
     Pairs with a Timeline (Tracks) for the true-vs-known sequence; clues can link out to
     deep Clue/Evidence entries. ---- */
  case: {
    type: 'case', label: 'Case', plural: 'Cases', icon: '⌕', layout: 'hero', media: 'none',
    title: { ph: 'Case name (e.g. The Cinderhall Murder)' }, subtitle: { ph: 'the crime / question (optional)' },
    sections: [
      { key: 'question', label: 'The question', type: 'richline', slot: 'main', lead: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Victim','Where','When','Investigator','Status'] },
      { key: 'suspects', label: 'Suspects', type: 'suspects', slot: 'main' },
      { key: 'clues', label: 'Clues & evidence', type: 'clues', slot: 'main' },
      { key: 'timeline', label: 'Timeline', type: 'relations', slot: 'main', optional: true, display: 'expand', linkTypes: ['timeline'], addLabel: 'timeline' },
      { key: 'investigation', label: 'The investigation', type: 'richsections', slot: 'main', optional: true },
      { key: 'solution', label: 'The solution', type: 'richsections', slot: 'main', sealed: true, optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  clue: {
    type: 'clue', label: 'Clue / Evidence', plural: 'Clues', icon: '✧', layout: 'codex',
    title: { ph: 'The evidence (e.g. The frost-rimed teacup)' }, subtitle: { ph: 'the case / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Found','Status','Case'] },
      { key: 'reveals', label: 'What it reveals', type: 'richsections', slot: 'main' },
      { key: 'catch', label: 'The catch / misdirection', type: 'richsections', slot: 'main', optional: true },
      { key: 'implicates', label: 'Implicates', type: 'relations', slot: 'main', display: 'expand', optional: true, linkTypes: ['character'], addLabel: 'suspect' },
      { key: 'case', label: 'Part of case', type: 'relations', slot: 'main', optional: true, linkTypes: ['case'], addLabel: 'case' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  /* ---- operation: the mission plan — heist, spy op, infiltration, con. The leanest genre
     pack: only the `crew` roster (operatives w/ portraits + cover identities + read-in flag)
     is new; the plan reuses History, risks↔contingencies reuse DefList, and the twist +
     aftermath reuse the `sealed` spoiler. Links out to the Characters/Places/Orgs it touches. */
  operation: {
    type: 'operation', label: 'Operation', plural: 'Operations', icon: '◎', layout: 'hero', media: 'none',
    title: { ph: 'Operation name (e.g. Operation: Cold Harbor)' }, subtitle: { ph: 'the mission (optional)' },
    sections: [
      { key: 'objective', label: 'Objective', type: 'richline', slot: 'main', lead: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Target','Backing','Window','Status'] },
      { key: 'stakes', label: 'What’s riding on it', type: 'richline', slot: 'main', optional: true },
      { key: 'crew', label: 'The crew', type: 'crew', slot: 'main' },
      { key: 'mark', label: 'The mark', type: 'richsections', slot: 'main', optional: true },
      { key: 'plan', label: 'The plan', type: 'history', slot: 'main' },
      { key: 'risks', label: 'Risks & contingencies', type: 'deflist', slot: 'main', variant: 'risks', termPh: 'If…', defPh: 'then…', addLabel: 'contingency', optional: true },
      { key: 'assets', label: 'Assets', type: 'relations', slot: 'main', display: 'expand', optional: true, addLabel: 'asset' },
      { key: 'twist', label: 'The real plan', type: 'richsections', slot: 'main', sealed: true, optional: true },
      { key: 'aftermath', label: 'Aftermath', type: 'richsections', slot: 'main', sealed: true, optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  lore: {
    type: 'lore', label: 'Lore', plural: 'Lore', icon: '❋', layout: 'codex',
    title: { ph: 'Concept / topic' }, subtitle: { ph: 'category (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Category','Origin','Status'] },
      { key: 'body', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'related', label: 'Connections', type: 'relations', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  item: {
    type: 'item', label: 'Item', plural: 'Items', icon: '◈', layout: 'split',
    title: { ph: 'Item name' }, subtitle: { ph: 'kind (artifact, weapon…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Origin','Owner','Status'] },
      { key: 'body', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'related', label: 'Bearers & links', type: 'relations', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  event: {
    type: 'event', label: 'Event', plural: 'Events', icon: '❖', layout: 'hero', media: 'none',
    title: { ph: 'Event name' }, subtitle: { ph: 'when / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Date','Where','Duration','Outcome'] },
      { key: 'timeline', label: 'Timeline', type: 'eventtimeline', slot: 'main', optional: true },
      { key: 'body', label: 'Account', type: 'richsections', slot: 'main' },
      { key: 'participants', label: 'Participants', type: 'relations', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  plot: {
    type: 'plot', label: 'Plotline', plural: 'Plot', icon: '✎', layout: 'outline',
    mediaPlace: true,   // per-entry image placement: top banner / side column / right rail
    title: { ph: 'Plotline title' }, subtitle: { ph: 'arc / thread (optional)' },
    sections: [
      { key: 'gallery', label: 'Key art', type: 'gallery', slot: 'aside' },
      { key: 'logline', label: 'Logline', type: 'richline', slot: 'main', lead: true },
      { key: 'structure', label: 'Structure', type: 'outline', slot: 'main' },
      { key: 'twists', label: 'Twist ideas', type: 'twists', slot: 'main' },
    ],
  },

  /* ---- timeline: a standalone chronology that aggregates dated beats across a whole
     world or story (distinct from one Event, or the Research per-topic chronology). The
     `timeline` field = era bands + collapsible beats; each beat links to Event/Character/
     Place entries (auto-backlinks) and can be flagged a ★ key beat. Vertical Chronicle. ---- */
  timeline: {
    type: 'timeline', label: 'Timeline', plural: 'Timelines', icon: '◷', layout: 'hero', media: 'none',
    title: { ph: 'Timeline name (e.g. History of the Ember Coast)' }, subtitle: { ph: 'scope / calendar (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Scope','Span','Calendar','Status'] },
      { key: 'chronicle', label: 'Chronicle', type: 'timeline', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- region / group collection sheets (Nature + Culture) ----
     Each is a survey of a place or people holding many items in a `catalog`
     (grouped field-guide cards, each with a scale badge + optional link-out to a
     deep `article` entry). A `meter` gives one domain-fit scale in the header. */
  flora: {
    type: 'flora', label: 'Flora', plural: 'Flora', icon: '⚘', layout: 'hero', media: 'feature',
    title: { ph: 'Region / group (e.g. Flora of the Cindermarch)' }, subtitle: { ph: 'biome / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','Biome','Climate','Growing season','Notable species','Status'] },
      { key: 'overview', label: 'Botany & overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Plants & fungi', type: 'catalog', slot: 'main', scale: 'Rarity' },
      { key: 'byuse', label: 'By use', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Field notes', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  fauna: {
    type: 'fauna', label: 'Fauna', plural: 'Fauna', icon: '♘', layout: 'hero', media: 'feature',
    title: { ph: 'Region / group (e.g. Fauna of the Sallow Fens)' }, subtitle: { ph: 'biome / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','Biome','Climate','Threat level','Notable species','Status'] },
      { key: 'scale', label: 'Threat level', type: 'meter', slot: 'main', levels: ['Low','Moderate','High','Extreme'] },
      { key: 'overview', label: 'Ecology & overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Creatures', type: 'catalog', slot: 'main', scale: 'Rarity' },
      { key: 'byhabitat', label: 'By habitat', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Field notes', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  religion: {
    type: 'religion', label: 'Religion', plural: 'Religions', icon: '☸', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Faiths of the Western Realms)' }, subtitle: { ph: 'scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Iconography', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Dominant faith','Tolerance','Status'] },
      { key: 'scale', label: 'Tolerance', type: 'meter', slot: 'main', levels: ['Persecuted','Uneasy','Broad','Open'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Faiths & cults', type: 'catalog', slot: 'main', scale: 'Standing' },
      { key: 'deities', label: 'Deities & powers', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  beliefs: {
    type: 'beliefs', label: 'Beliefs & Customs', plural: 'Beliefs', icon: '☯', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Customs of the Tern Coast)' }, subtitle: { ph: 'culture / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Related faith','Prevalence','Status'] },
      { key: 'scale', label: 'How strictly kept', type: 'meter', slot: 'main', levels: ['Loose','Held','Strict','Absolute'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Customs & beliefs', type: 'catalog', slot: 'main', scale: 'Observance' },
      { key: 'values', label: 'Values & taboos', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Sayings', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  folklore: {
    type: 'folklore', label: 'Folklore', plural: 'Folklore', icon: '❧', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Folklore of the Sallow Fens)' }, subtitle: { ph: 'myths & legends / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Origin','Notable tales','Status'] },
      { key: 'scale', label: 'How widely told', type: 'meter', slot: 'main', levels: ['Local','Regional','Widespread','Ubiquitous'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Tales & legends', type: 'catalog', slot: 'main', scale: 'Currency' },
      { key: 'motifs', label: 'Motifs & themes', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Tellings', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  language: {
    type: 'language', label: 'Language', plural: 'Languages', icon: '¶', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Tongues of the Tern Coast)' }, subtitle: { ph: 'family / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery & script', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Family','Script','Speakers','Status'] },
      { key: 'scale', label: 'How widely spoken', type: 'meter', slot: 'main', levels: ['Local','Regional','Common','Lingua franca'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Tongues & dialects', type: 'catalog', slot: 'main', scale: 'Vitality' },
      { key: 'features', label: 'Features & sample', type: 'taggroups', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- research desk: reference notes with sourced reliability + a real-vs-invented
     ledger. Historical fiction's non-negotiable; serves any research-heavy genre.
     Reuses the catalog (a source per card, its scale badge = per-source Reliability)
     and a header `meter` for overall confidence; adds the `ledger` field. ---- */
  research: {
    type: 'research', label: 'Research', plural: 'Research', icon: '❡', layout: 'hero', media: 'feature', mediaToggle: true,
    title: { ph: 'Topic (e.g. Norman siege warfare)' }, subtitle: { ph: 'discipline / period (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Documents & references', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Topic','Discipline','Period','Region','Sources','Status'] },
      /* — Understand — (lean core = not optional: quickfacts, findings, + sources below) */
      { key: 'quickfacts', label: 'Quick facts', type: 'deflist', slot: 'main', zone: 'Understand', termPh: 'What', defPh: 'Figure / fact', notePh: 'source', addLabel: 'fact' },
      { key: 'findings', label: 'Synthesis', type: 'richsections', slot: 'main', zone: 'Understand' },
      { key: 'timeline', label: 'Timeline', type: 'chronology', slot: 'main', zone: 'Understand', optional: true },
      { key: 'keyfigures', label: 'Key figures', type: 'relations', slot: 'main', zone: 'Understand', optional: true, linkTypes: ['character','source'], addLabel: 'figure' },
      /* — Sources & material — */
      { key: 'sources', label: 'Sources', type: 'relations', slot: 'main', zone: 'Sources & material', display: 'expand', linkTypes: ['source'], addLabel: 'source' },
      { key: 'links', label: 'Links & further reading', type: 'references', slot: 'main', zone: 'Sources & material', optional: true },
      { key: 'excerpts', label: 'Quotes & flavour', type: 'excerpts', slot: 'main', zone: 'Sources & material', optional: true },
      /* — Craft reference — */
      { key: 'glossary', label: 'Lexicon', type: 'lexicon', slot: 'main', zone: 'Craft reference', optional: true },
      { key: 'voice', label: 'Voice & speech', type: 'taggroups', slot: 'main', zone: 'Craft reference', optional: true },
      { key: 'sensory', label: 'Sensory & texture', type: 'taggroups', slot: 'main', zone: 'Craft reference', optional: true },
      /* — Accuracy & story — */
      { key: 'ledger', label: 'Real vs invented', type: 'ledger', slot: 'main', zone: 'Accuracy & story', optional: true },
      { key: 'avoid', label: 'Avoid / anachronism', type: 'deflist', slot: 'main', zone: 'Accuracy & story', optional: true, variant: 'avoid', termPh: 'Don’t…', defPh: 'why / the correct version', notePh: 'source', addLabel: 'rule' },
      { key: 'questions', label: 'Open questions', type: 'taggroups', slot: 'main', zone: 'Accuracy & story', optional: true },
      { key: 'feeds', label: 'Feeds into', type: 'relations', slot: 'main', zone: 'Accuracy & story', optional: true },
      /* — Deeper — */
      { key: 'subtopics', label: 'Sub-topics', type: 'relations', slot: 'main', zone: 'Deeper', optional: true, display: 'expand' },
    ],
  },

  /* ---- source: a reusable, note-rich reading record. Authored once, linked from any
     Research topic it informs. The `sourcenotes` field is the workspace: chapters →
     typed notes (quote/fact/summary/question/idea) + plates (images, placeable). ---- */
  source: {
    type: 'source', label: 'Source', plural: 'Sources', icon: '▤', layout: 'hero', media: 'none',
    title: { ph: 'Title (e.g. Henry III)' }, subtitle: { ph: 'author · volume / edition (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Cover & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Author','Year','Publisher','Type','Reliability','Status'] },
      { key: 'takeaways', label: 'Takeaways', type: 'richsections', slot: 'main' },
      { key: 'notes', label: 'Notes', type: 'sourcenotes', slot: 'main' },
    ],
  },

  /* ---- system / rules: how a magic system, technology, or institution works — and
     what it COSTS. A codex (framework article + at-a-glance rail) that catalogs the
     abilities within it, each linking out to a deep `power` entry (collection→deep,
     like Flora→article). Craft spine is Sanderson-shaped: limitations > powers. The
     `rulelist` field carries both the numbered Laws and the Can/Can’t consistency block. */
  system: {
    type: 'system', label: 'System / Rules', plural: 'Systems', icon: '§', layout: 'codex',
    title: { ph: 'System name (e.g. Emberbinding)' }, subtitle: { ph: 'magic · technology · institution' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* aside rail */
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Source','Access','Trained at','Tiers','Status'] },
      { key: 'gauges', label: 'At a glance', type: 'gauges', slot: 'aside', gaugeDefaults: [
        { label: 'Hardness', levels: ['Soft','Mixed','Firm','Hard'] },
        { label: 'Cost', levels: ['Free','Cheap','Steep','Dire'] },
        { label: 'Prevalence', levels: ['Unique','Rare','Common','Ubiquitous'] },
        { label: 'Scope', levels: ['Personal','Local','Regional','World'] },
      ] },
      /* framework article */
      { key: 'howitworks', label: 'How it works', type: 'richsections', slot: 'main' },
      { key: 'laws', label: 'The laws', type: 'rulelist', slot: 'main', variant: 'laws', optional: true },
      { key: 'cancant', label: 'Can & can’t', type: 'rulelist', slot: 'main', variant: 'cancant', optional: true },
      { key: 'limits', label: 'Limits & costs', type: 'richsections', slot: 'main', optional: true },
      { key: 'access', label: 'Who wields it', type: 'richsections', slot: 'main', optional: true },
      { key: 'consequences', label: 'Consequences', type: 'richsections', slot: 'main', optional: true },
      /* the abilities within (full-width band) → deep Power entries */
      { key: 'abilities', label: 'Abilities', type: 'catalog', slot: 'band', scale: 'Tier', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- power / ability: a single ability within a System — effect, tier, its cost &
     drawbacks, who wields it, what counters it, and a mastery track for progression. ---- */
  power: {
    type: 'power', label: 'Power / Ability', plural: 'Powers', icon: '✷', layout: 'codex',
    title: { ph: 'Ability name (e.g. Draw)' }, subtitle: { ph: 'system / discipline (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Tier','System','Cost','Discipline','Status'] },
      { key: 'effect', label: 'Effect', type: 'richsections', slot: 'main' },
      { key: 'drawbacks', label: 'Cost & drawbacks', type: 'richsections', slot: 'main', optional: true },
      { key: 'mastery', label: 'Mastery', type: 'meter', slot: 'main', levels: ['Novice','Adept','Master'], optional: true },
      { key: 'counters', label: 'Counters', type: 'taggroups', slot: 'main', optional: true },
      { key: 'wielders', label: 'Wielders', type: 'relations', slot: 'main', display: 'expand', optional: true, linkTypes: ['character'], addLabel: 'wielder' },
      { key: 'partof', label: 'Part of', type: 'relations', slot: 'main', optional: true, linkTypes: ['system'], addLabel: 'system' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- theme: the argument the book is making — promoted from a Lore entry to a real sheet.
     A statement + the counter-argument it's tested against (the `dialectic` field), the
     dramatic question, the motifs (deflist: what it carries · how it turns), the carriers
     (ties tagged embodies/complicates/refutes), key lines (excerpts), and a sealed "where
     it lands" resolution. ---- */
  theme: {
    type: 'theme', label: 'Theme', plural: 'Themes', icon: '❉', layout: 'hero', media: 'none',
    title: { ph: 'The theme (e.g. The doomed cause)' }, subtitle: { ph: 'in a word or two (optional)' },
    sections: [
      { key: 'summary', label: 'In a line', type: 'richline', slot: 'main', lead: true },
      { key: 'dialectic', label: 'The argument', type: 'dialectic', slot: 'main', leftLabel: 'The book argues', rightLabel: 'But —', leftTint: '#7f9ac9', rightTint: '#c98a6a' },
      { key: 'question', label: 'The question', type: 'richline', slot: 'main', optional: true },
      { key: 'motifs', label: 'Motifs & symbols', type: 'deflist', slot: 'main', variant: 'motifs', termPh: 'motif / symbol', defPh: 'what it carries', notePh: 'how it turns', addLabel: 'motif', optional: true },
      { key: 'carriers', label: 'Who tests it', type: 'ties', slot: 'main', optional: true, linkTypes: ['character','relationship','event'], namePh: 'character / scene', notePh: 'how they carry it', addLabel: 'carrier', kinds: [{ v: 'embody', l: 'Embodies', c: '#5aa06f' }, { v: 'complicate', l: 'Complicates', c: '#c9a24a' }, { v: 'refute', l: 'Refutes', c: '#b0596a' }] },
      { key: 'lines', label: 'Key lines', type: 'excerpts', slot: 'main', optional: true },
      { key: 'landing', label: 'Where it lands', type: 'richsections', slot: 'main', sealed: true, optional: true },
    ],
  },

  /* ---- setting: a place held as ATMOSPHERE (a childhood home, a room where it happened),
     not the gazetteer. The five `senses` (a deflist pre-seeded with Sight…Taste), what it
     `holds` (memory), whose place it is (ties: home/prize/haunt), its role, a then/now
     `dialectic`, and a cross-link to the same place's mapped Location. ---- */
  setting: {
    type: 'setting', label: 'Setting', plural: 'Settings', icon: '❈', layout: 'hero', media: 'feature',
    title: { ph: 'The place (e.g. The hearth-hall at Kadmar)' }, subtitle: { ph: 'a place that matters (optional)' },
    sections: [
      { key: 'summary', label: 'What it feels like', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Belongs to','Feeling','When'] },
      { key: 'senses', label: 'The senses', type: 'deflist', slot: 'main', variant: 'senses', termPh: 'sense', defPh: 'what you notice', addLabel: 'sense', rowDefaults: [{ term: 'Sight', def: '', note: '' }, { term: 'Sound', def: '', note: '' }, { term: 'Smell', def: '', note: '' }, { term: 'Touch', def: '', note: '' }, { term: 'Taste', def: '', note: '' }] },
      { key: 'holds', label: 'What it holds', type: 'richsections', slot: 'main' },
      { key: 'whose', label: 'Whose place it is', type: 'ties', slot: 'main', optional: true, linkTypes: ['character'], namePh: 'character', notePh: 'how they feel it', addLabel: 'person', kinds: [{ v: 'home', l: 'Home', c: '#5aa06f' }, { v: 'prize', l: 'A prize', c: '#c9a24a' }, { v: 'haunt', l: 'A haunt', c: '#b0596a' }, { v: 'refuge', l: 'A refuge', c: '#5f8fb0' }, { v: 'other', l: '—', c: '#9aa1a8' }] },
      { key: 'role', label: 'Its role in the story', type: 'richsections', slot: 'main', optional: true },
      { key: 'thennow', label: 'Then / now', type: 'dialectic', slot: 'main', leftLabel: 'Then', rightLabel: 'Now', leftTint: '#d9a066', rightTint: '#5f8fb0', sep: '→', optional: true },
      { key: 'mapped', label: 'Also on the map', type: 'relations', slot: 'main', optional: true, display: 'expand', linkTypes: ['location','realm','dwelling'], addLabel: 'place' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- entity / threat: the horror antagonist — monster, haunting, curse, eldritch force.
     Built entirely from existing fields: prey = DefList (who→why), abilities/tells/banes =
     taggroups, its rules = the rulelist Can/Can’t block relabeled "How it hunts / What binds
     it", dread = a meter, sightings & the toll = History logs, how-to-end-it = a sealed
     section. Pairs with System/Rules (a cursed magic), a haunted place, and its victims. ---- */
  entity: {
    type: 'entity', label: 'Entity / Threat', plural: 'Threats', icon: '☾', layout: 'codex',
    title: { ph: 'The threat (e.g. The Rime)' }, subtitle: { ph: 'monster · haunting · curse · force' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* aside rail */
      { key: 'gallery', label: 'Depiction', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Nature', type: 'stats', slot: 'aside', defaults: ['Kind','Origin','First seen','Status'] },
      { key: 'dread', label: 'Dread level', type: 'meter', slot: 'aside', levels: ['Rumor','Stalking','Hunting','Unbound'], optional: true },
      { key: 'banes', label: 'Banes & weaknesses', type: 'taggroups', slot: 'aside', optional: true },
      /* article */
      { key: 'wants', label: 'What it wants', type: 'richsections', slot: 'main' },
      { key: 'prey', label: 'Its prey', type: 'deflist', slot: 'main', variant: 'prey', termPh: 'who it takes', defPh: 'why', addLabel: 'prey', optional: true },
      { key: 'abilities', label: 'Abilities', type: 'taggroups', slot: 'main', optional: true },
      { key: 'rules', label: 'Its rules', type: 'rulelist', slot: 'main', variant: 'cancant', canLabel: 'How it hunts', cantLabel: 'What binds it', optional: true },
      { key: 'tells', label: 'The tells', type: 'taggroups', slot: 'main', optional: true },
      { key: 'sightings', label: 'Sightings', type: 'history', slot: 'main', optional: true },
      { key: 'toll', label: 'The toll', type: 'history', slot: 'main', optional: true },
      { key: 'related', label: 'Connections', type: 'relations', slot: 'main', optional: true },
      { key: 'ending', label: 'How to end it', type: 'richsections', slot: 'main', sealed: true, optional: true },
      { key: 'excerpts', label: 'Lore & accounts', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- shared deep single-subject sheet: any catalog item can link out to one ---- */
  article: {
    type: 'article', label: 'Article', plural: 'Articles', icon: '◆', layout: 'split',
    title: { ph: 'Subject (a creature, plant, faith, custom, tale…)' }, subtitle: { ph: 'kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Origin','Range','Rarity','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'connections', label: 'Connections', type: 'relations', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- GM / DM stat block: an NPC or monster combat card. Portrait on the side, the
     six ability scores in a grid, defenses + details as key→value rows, and named
     Traits / Actions / Reactions / Legendary actions. Reused blocks + one new
     `abilityscores` grid. ---- */
  statblock: {
    type: 'statblock', label: 'Stat Block', plural: 'Stat Blocks', icon: '⚔', layout: 'split',
    title: { ph: 'Creature / NPC name' }, subtitle: { ph: 'size type, alignment — e.g. Large dragon, chaotic evil' },
    sections: [
      { key: 'gallery', label: 'Portrait', type: 'gallery', slot: 'aside' },
      { key: 'summary', label: 'Description', type: 'richline', slot: 'main', lead: true },
      { key: 'defense', label: 'Defenses', type: 'deflist', slot: 'main', termPh: 'stat', defPh: 'value', notePh: 'note', addLabel: 'defense',
        rowDefaults: [{ term: 'Armor Class' }, { term: 'Hit Points' }, { term: 'Speed' }] },
      { key: 'abilities', label: 'Ability Scores', type: 'abilityscores', slot: 'main', mod: 'dnd', abils: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] },
      { key: 'details', label: 'Details', type: 'deflist', slot: 'main', termPh: 'trait', defPh: 'value', notePh: 'note', addLabel: 'detail',
        rowDefaults: [{ term: 'Saving Throws' }, { term: 'Skills' }, { term: 'Damage Resistances' }, { term: 'Condition Immunities' }, { term: 'Senses' }, { term: 'Languages' }, { term: 'Challenge' }, { term: 'Proficiency Bonus' }] },
      { key: 'traits', label: 'Traits', type: 'richsections', slot: 'main', optional: true },
      { key: 'actions', label: 'Actions', type: 'richsections', slot: 'main' },
      { key: 'reactions', label: 'Reactions', type: 'richsections', slot: 'main', optional: true },
      { key: 'legendary', label: 'Legendary Actions', type: 'richsections', slot: 'main', optional: true },
    ],
  },

  /* ---- GM / DM encounter: a prep sheet for a single scene of conflict. Infobox rail holds
     the map + at-a-glance vitals (difficulty / XP / party); the article holds the read-aloud
     setup, the linked adversaries (their stat blocks), tactics & triggers, terrain and loot. ---- */
  encounter: {
    type: 'encounter', label: 'Encounter', plural: 'Encounters', icon: '⚑', layout: 'codex',
    title: { ph: 'Encounter name — e.g. Ambush at Redbridge' }, subtitle: { ph: 'location / difficulty (optional)' },
    sections: [
      { key: 'summary', label: 'Setup', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Map & scene', type: 'gallery', slot: 'aside' },
      { key: 'vitals', label: 'At a glance', type: 'stats', slot: 'aside', defaults: ['Difficulty', 'XP budget', 'Party', 'Environment', 'Light'] },
      { key: 'adversaries', label: 'Adversaries', type: 'relations', slot: 'main', display: 'expand', linkTypes: ['statblock', 'entity', 'character'], addLabel: 'foe' },
      { key: 'tactics', label: 'Tactics & triggers', type: 'richsections', slot: 'main' },
      { key: 'terrain', label: 'Terrain & features', type: 'taggroups', slot: 'main', optional: true },
      { key: 'treasure', label: 'Treasure & rewards', type: 'richsections', slot: 'main', optional: true },
      { key: 'aftermath', label: 'Aftermath / development', type: 'richsections', slot: 'main', optional: true },
    ],
  },

  /* ---- Storyteller / World of Darkness character (splat-agnostic, V5-flavored). Works for
     vampires, mages, werewolves, hunters, demons + homebrew: 9 attributes & skills as dot
     ratings, a generic Powers grid (Disciplines / Gifts / Arcana / Edges), Willpower + a
     Humanity/Integrity track, a renamable core-drive resource (Hunger / Rage / Desperation),
     and Touchstones & Convictions. Everything is editable — nothing is splat-locked. ---- */
  storyteller: {
    type: 'storyteller', label: 'Storyteller Character', plural: 'Storyteller Characters', icon: '☾', layout: 'codex',
    title: { ph: 'Character name' }, subtitle: { ph: 'concept / splat (optional)' },
    sections: [
      { key: 'gallery', label: 'Portrait', type: 'gallery', slot: 'aside' },
      { key: 'identity', label: 'Identity', type: 'stats', slot: 'aside', defaults: ['Concept', 'Chronicle', 'Type / Splat', 'Faction', 'Ambition', 'Desire'] },
      { key: 'trackers', label: 'Trackers', type: 'abilityscores', slot: 'aside', mod: 'dots', dotsMax: 10, abils: ['Willpower', 'Humanity'] },
      { key: 'drive', label: 'Core Drive', type: 'abilityscores', slot: 'aside', mod: 'dots', dotsMax: 5, abils: ['Hunger'] },
      { key: 'summary', label: 'Concept', type: 'richline', slot: 'main', lead: true },
      { key: 'attributes', label: 'Attributes', type: 'abilityscores', slot: 'main', mod: 'dots', dotsMax: 5,
        abils: ['Strength', 'Dexterity', 'Stamina', 'Charisma', 'Manipulation', 'Composure', 'Intelligence', 'Wits', 'Resolve'] },
      { key: 'skills', label: 'Skills', type: 'abilityscores', slot: 'main', mod: 'dots', dotsMax: 5,
        abils: ['Athletics', 'Brawl', 'Craft', 'Drive', 'Firearms', 'Larceny', 'Melee', 'Stealth', 'Survival', 'Animal Ken', 'Etiquette', 'Insight', 'Intimidation', 'Leadership', 'Performance', 'Persuasion', 'Streetwise', 'Subterfuge', 'Academics', 'Awareness', 'Finance', 'Investigation', 'Medicine', 'Occult', 'Politics', 'Science', 'Technology'] },
      { key: 'specialties', label: 'Specialties', type: 'taggroups', slot: 'main', optional: true },
      { key: 'powers', label: 'Powers', type: 'abilityscores', slot: 'main', mod: 'dots', dotsMax: 5, abils: ['', '', ''] },
      { key: 'powerdesc', label: 'Powers in detail', type: 'richsections', slot: 'main', optional: true },
      { key: 'touchstones', label: 'Touchstones & Convictions', type: 'relations', slot: 'main', display: 'expand', linkTypes: ['character'], addLabel: 'touchstone' },
      { key: 'advantages', label: 'Merits, Flaws & Backgrounds', type: 'taggroups', slot: 'main' },
      { key: 'bio', label: 'Background & notes', type: 'richsections', slot: 'main' },
    ],
  },

  /* ---- GM / DM roll table: a random table you can click to roll. Holds one table by default;
     add more `rolltable` sections for tiered loot, rumours, wandering encounters, etc. ---- */
  rolltable: {
    type: 'rolltable', label: 'Roll Table', plural: 'Roll Tables', icon: '⚄', layout: 'hero', media: 'none',
    title: { ph: 'Table name — e.g. Wilderness Loot' }, subtitle: { ph: 'when to use it (optional)' },
    sections: [
      { key: 'summary', label: 'About', type: 'richline', slot: 'main', lead: true },
      { key: 'table', label: 'Table', type: 'rolltable', slot: 'main' },
      { key: 'notes', label: 'Notes', type: 'richsections', slot: 'main', optional: true },
    ],
  },

  /* ---- GM / DM quest: a trackable objective. Infobox holds status / giver / reward; the
     article holds the hook, a tickable objectives checklist, stakes, rewards and links. ---- */
  quest: {
    type: 'quest', label: 'Quest', plural: 'Quests', icon: '❖', layout: 'codex',
    title: { ph: 'Quest name — e.g. The Missing Caravan' }, subtitle: { ph: 'quest giver / type (optional)' },
    sections: [
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'vitals', label: 'Quest', type: 'stats', slot: 'aside', defaults: ['Status', 'Giver', 'Location', 'Reward', 'Deadline'] },
      { key: 'summary', label: 'Hook', type: 'richline', slot: 'main', lead: true },
      { key: 'objectives', label: 'Objectives', type: 'checklist', slot: 'main', addLabel: 'objective' },
      { key: 'complications', label: 'Stakes & complications', type: 'richsections', slot: 'main', optional: true },
      { key: 'rewards', label: 'Rewards', type: 'deflist', slot: 'main', termPh: 'reward', defPh: 'detail', addLabel: 'reward', optional: true },
      { key: 'connections', label: 'People, places & clues', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'log', label: 'Progress log', type: 'richsections', slot: 'main', optional: true },
    ],
  },

  /* ---- GM / DM session log: per-session prep + recap. Infobox holds the date / number / XP;
     the article holds a one-line summary, a prep checklist, the recap, loot, NPCs met and
     open threads. ---- */
  session: {
    type: 'session', label: 'Session Log', plural: 'Session Logs', icon: '▤', layout: 'codex',
    title: { ph: 'Session title — e.g. Session 12 · The Sunken Vault' }, subtitle: { ph: 'date / arc (optional)' },
    sections: [
      { key: 'vitals', label: 'Session', type: 'stats', slot: 'aside', defaults: ['Date', 'Session #', 'Location', 'XP awarded', 'Present'] },
      { key: 'summary', label: 'In one line', type: 'richline', slot: 'main', lead: true },
      { key: 'agenda', label: 'Prep / agenda', type: 'checklist', slot: 'main', addLabel: 'scene', optional: true },
      { key: 'recap', label: 'Recap', type: 'richsections', slot: 'main' },
      { key: 'loot', label: 'Loot & rewards', type: 'deflist', slot: 'main', termPh: 'item', defPh: 'detail', addLabel: 'item', optional: true },
      { key: 'npcs', label: 'NPCs & factions', type: 'relations', slot: 'main', display: 'expand', optional: true },
      { key: 'threads', label: 'Open threads & cliffhangers', type: 'checklist', slot: 'main', addLabel: 'thread' },
      { key: 'notes', label: 'GM notes', type: 'richsections', slot: 'main', optional: true },
    ],
  },

  /* ---- GM / DM faction / front: a *living* antagonist group — its agenda, goals as progress
     clocks, assets, moves, key members and stance toward the party. (Distinct from the
     structural `organization` sheet: this is what they're DOING and how close to winning.) ---- */
  front: {
    type: 'front', label: 'Faction / Front', plural: 'Factions & Fronts', icon: '❂', layout: 'codex',
    title: { ph: 'Faction / Front name — e.g. The Ashen Hand' }, subtitle: { ph: 'type / scope (optional)' },
    sections: [
      { key: 'gallery', label: 'Sigil & imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'vitals', label: 'At a glance', type: 'stats', slot: 'aside', defaults: ['Type', 'Scale', 'Reach', 'Stance to party', 'Status'] },
      { key: 'summary', label: 'Agenda', type: 'richline', slot: 'main', lead: true },
      { key: 'clocks', label: 'Goals & clocks', type: 'clocks', slot: 'main' },
      { key: 'assets', label: 'Assets & resources', type: 'taggroups', slot: 'main', optional: true },
      { key: 'moves', label: 'Moves & tactics', type: 'rulelist', slot: 'main', variant: 'laws', optional: true },
      { key: 'roster', label: 'Key members', type: 'crew', slot: 'main', optional: true },
      { key: 'ties', label: 'Relationships', type: 'ties', slot: 'main', optional: true },
      { key: 'notes', label: 'Notes & secrets', type: 'richsections', slot: 'main', optional: true },
    ],
  },

  /* ---- GM / DM campaign overview: the home-base page for a chronicle — premise, tone &
     themes, safety tools (lines & veils), house rules, the central threat, principal cast and
     open threads. Mostly table / meta content. ---- */
  campaign: {
    type: 'campaign', label: 'Campaign', plural: 'Campaign', icon: '✤', layout: 'codex',
    title: { ph: 'Campaign name' }, subtitle: { ph: 'system / setting (optional)' },
    sections: [
      { key: 'gallery', label: 'Key art', type: 'gallery', slot: 'aside', optional: true },
      { key: 'vitals', label: 'At a glance', type: 'stats', slot: 'aside', defaults: ['System', 'Setting', 'Tone', 'Status', 'Sessions', 'Started'] },
      { key: 'premise', label: 'Premise', type: 'richline', slot: 'main', lead: true },
      { key: 'pitch', label: 'The pitch', type: 'richsections', slot: 'main' },
      { key: 'themes', label: 'Themes & tone', type: 'taggroups', slot: 'main', optional: true },
      { key: 'safety', label: 'Safety tools', type: 'dialectic', slot: 'main', leftLabel: 'Lines — never on-screen', rightLabel: 'Veils — kept off-screen', optional: true },
      { key: 'houserules', label: 'House rules', type: 'rulelist', slot: 'main', variant: 'laws', optional: true },
      { key: 'threat', label: 'The central threat', type: 'relations', slot: 'main', display: 'expand', optional: true },
      { key: 'cast', label: 'Principal cast & factions', type: 'relations', slot: 'main', display: 'expand', optional: true },
      { key: 'threads', label: 'Open threads', type: 'checklist', slot: 'main', addLabel: 'thread', optional: true },
      { key: 'notes', label: 'GM notes', type: 'richsections', slot: 'main', optional: true },
    ],
  },

  /* ---- GM / DM cast / NPC roster: one page holding many lightweight NPCs (the bartender, the
     guard, the fence) — name, role, disposition, want, quirk, GM-secret, optional portrait and
     a link to a full sheet if one gets promoted. Add more roster sections to group by place. ---- */
  cast: {
    type: 'cast', label: 'NPC Roster', plural: 'NPC Rosters', icon: '◫', layout: 'hero', media: 'none',
    title: { ph: 'Roster name — e.g. Ashport NPCs' }, subtitle: { ph: 'location / group (optional)' },
    sections: [
      { key: 'summary', label: 'About', type: 'richline', slot: 'main', lead: true },
      { key: 'roster', label: 'NPCs', type: 'npcroster', slot: 'main' },
      { key: 'notes', label: 'Notes', type: 'richsections', slot: 'main', optional: true },
    ],
  },
};

// Display order for the type picker / project view.
export const ENTRY_TYPES = ['character','relationship','house','organization','species','realm','location','setting','business','dwelling','flora','fauna','religion','beliefs','folklore','language','event','plot','timeline','case','clue','operation','theme','lore','item','system','power','entity','research','source','article','campaign','statblock','encounter','storyteller','front','cast','rolltable','quest','session'];

// Type families — group the entry types for the project-view category filter + the
// "New entry" picker. Source of truth for section order too (people → places → nature → culture → story → lore).
export const FAMILIES = [
  { key: 'people',  label: 'People',  types: ['character','relationship','house','organization','species'] },
  { key: 'places',  label: 'Places',  types: ['realm','location','setting','business','dwelling'] },
  { key: 'nature',  label: 'Nature',  types: ['flora','fauna'] },
  { key: 'culture', label: 'Culture', types: ['religion','beliefs','folklore','language'] },
  { key: 'story',   label: 'Story',   types: ['event','plot','timeline','case','clue','operation','theme'] },
  { key: 'lore',    label: 'Lore',    types: ['lore','item','system','power','entity','research','source','article'] },
  { key: 'game',    label: 'Game',    types: ['campaign','statblock','encounter','storyteller','front','cast','rolltable','quest','session'] },
];

// Back-compat: earlier saves used 'faction'; treat it as 'organization'.
export const TYPE_ALIASES = { faction: 'organization' };

/* ---- user-defined custom sheet types ----
   Custom types share the built-in template shape ({type,label,plural,icon,layout,sections}).
   They live in the workspace (ws.typeLibrary = the authoring library) and are imported as
   COPIES into projects (project.types) so a project stays self-contained. This module-level
   registry is rebuilt from the workspace on load / on any change, so templateFor() resolves
   custom types with no change to its ~20 callers. */
const CUSTOM_TYPES = {};
export function rebuildCustomTypes(ws){
  for (const k in CUSTOM_TYPES) delete CUSTOM_TYPES[k];
  const add = (t) => { if (t && t.type && !TEMPLATES[t.type]) CUSTOM_TYPES[t.type] = t; };
  // project copies first, then the library — so live edits in the builder win in-app,
  // while a project moved/opened WITHOUT the library still resolves via its embedded copy.
  (ws && ws.projects || []).forEach(p => (p.types || []).forEach(add));
  (ws && ws.typeLibrary || []).forEach(add);
  return CUSTOM_TYPES;
}
export function isCustomType(type){ return !!CUSTOM_TYPES[type]; }
export function customTypeById(id){ return CUSTOM_TYPES[id] || null; }

export function templateFor(type){ return TEMPLATES[type] || TEMPLATES[TYPE_ALIASES[type]] || CUSTOM_TYPES[type] || TEMPLATES.character; }

// Every field type's empty starting value.
export function emptyValue(section){
  switch (section.type){
    case 'richline': return '';
    case 'stats': return (section.defaults || []).map(k => ({ k, v: '' }));
    case 'gallery': return [];
    case 'richsections': return [];
    case 'relations': return [];
    case 'catalog': return [];
    case 'references': return [];
    case 'deflist': return [];
    case 'lexicon': return [];
    case 'chronology': return [];
    case 'sourcenotes': return { chapters: [] };
    case 'ledger': return [];
    case 'meter': return { levels: (section.levels || []).slice(), at: 0 };
    case 'kind': return { id: '' };
    case 'gauges': return [];
    case 'timeline': return { eras: [], threads: [], entries: [], view: 'chronicle' };
    case 'arc': return { type: 'positive', pos: null, believes: '', is: '', turn: '', learns: '', becomes: '', want: '', need: '' };
    case 'rulelist': return [];
    case 'dyad': return { a: { targetId: '', role: '' }, b: { targetId: '', role: '' }, dynamic: '', status: '', tension: '', sides: { a: { wants: '', fears: '', hides: '', sees: '' }, b: { wants: '', fears: '', hides: '', sees: '' } } };
    case 'suspects': return [];
    case 'clues': return [];
    case 'crew': return [];
    case 'dialectic': return { left: '', right: '' };
    case 'table': return { cols: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'embed': return [];
    case 'matrix': return { people: [], pairs: {} };
    case 'statchart': return { stats: [{ label: 'STR', value: 5 }, { label: 'DEX', value: 5 }, { label: 'CON', value: 5 }, { label: 'INT', value: 5 }, { label: 'WIS', value: 5 }, { label: 'CHA', value: 5 }], max: 10, view: 'radar' };
    case 'orgchart': return { nodes: [] };
    case 'taggroups': return [];
    case 'excerpts': return [];
    case 'outline': return { acts: [] };
    case 'lineage': return { nodes: [] };
    case 'familytree': return { people: [], unions: [] };
    case 'history': return [];
    case 'ties': return [];
    case 'allegianceweb': return [];
    case 'eventtimeline': return null;
    case 'spotify': return [];
    case 'rolltable': return { die: 20, rows: [{ range: '', text: '' }] };
    case 'checklist': return [];
    case 'clocks': return [];
    case 'npcroster': return [];
    case 'twists': return [];
    case 'abilityscores': {
      const mode = section.mod || 'value';
      const labels = (section.abils && section.abils.length) ? section.abils : ['Stat 1', 'Stat 2', 'Stat 3'];
      return { mode, max: section.dotsMax || 5, rows: labels.map(l => ({ label: l, value: mode === 'dnd' ? 10 : (mode === 'dots' ? 0 : '') })) };
    }
    default: return '';
  }
}
