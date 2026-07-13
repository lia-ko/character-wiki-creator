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
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Age','Height','Pronouns','Origin','Role','Status','Languages'] },
      { key: 'bio', label: 'Biography', type: 'richsections', slot: 'main' },
      { key: 'relationships', label: 'Relationships', type: 'relations', slot: 'main' },
      { key: 'homes', label: 'Home & haunts', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'skills', label: 'Abilities & skills', type: 'taggroups', slot: 'main' },
      { key: 'tropes', label: 'Tropes', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Excerpts', type: 'excerpts', slot: 'main' },
      { key: 'soundtrack', label: 'Soundtrack', type: 'spotify', slot: 'main' },
    ],
  },
  location: {
    type: 'location', label: 'Location', plural: 'Locations', icon: '⌖', layout: 'hero', media: 'feature',
    title: { ph: 'Place name' }, subtitle: { ph: 'region / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','Type','Population','Ruler','Climate','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'notable', label: 'Notable figures & sites', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'businesses', label: 'Shops & businesses', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'features', label: 'Features', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
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
      { key: 'features', label: 'Rooms & features', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
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
      { key: 'wares', label: 'Wares & services', type: 'taggroups', slot: 'main' },
      { key: 'patrons', label: 'Patrons & ties', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
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
      { key: 'lineage', label: 'Lineage', type: 'lineage', slot: 'main' },
      { key: 'allegiances', label: 'Allegiances & ties', type: 'allegianceweb', slot: 'main' },
      { key: 'holdings', label: 'Seats & holdings', type: 'relations', slot: 'main' },
      { key: 'tenets', label: 'Words & traditions', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  organization: {
    type: 'organization', label: 'Organization', plural: 'Organizations', icon: '⬡', layout: 'hero', media: 'sigil',
    title: { ph: 'Organization name' }, subtitle: { ph: 'kind (order, guild, faith, council…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Emblem & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Founded','Seat','Leader','Size','Allegiance','Status'] },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main' },
      { key: 'base', label: 'Base of operations', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'members', label: 'Members & ranks', type: 'relations', slot: 'main' },
      { key: 'ties', label: 'Allies & rivals', type: 'relations', slot: 'main' },
      { key: 'tenets', label: 'Tenets & traits', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  realm: {
    type: 'realm', label: 'Realm / Region', plural: 'Realms', icon: '⬢', layout: 'hero', media: 'feature', mapStyle: true,
    title: { ph: 'Realm / region name' }, subtitle: { ph: 'kingdom, region, city-state…' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Map & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Capital','Ruling house','Government','Population','Religion','Status'] },
      { key: 'geography', label: 'Geography & description', type: 'richsections', slot: 'main' },
      { key: 'locations', label: 'Notable locations', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'powers', label: 'Powers & houses', type: 'relations', slot: 'main' },
      { key: 'peoples', label: 'Peoples & cultures', type: 'taggroups', slot: 'main' },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  lore: {
    type: 'lore', label: 'Lore', plural: 'Lore', icon: '❋', layout: 'infobox',
    title: { ph: 'Concept / topic' }, subtitle: { ph: 'category (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Category','Origin','Status'] },
      { key: 'body', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'related', label: 'Connections', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
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
      { key: 'related', label: 'Bearers & links', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  event: {
    type: 'event', label: 'Event', plural: 'Events', icon: '❖', layout: 'hero', media: 'none',
    title: { ph: 'Event name' }, subtitle: { ph: 'when / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Date','Where','Duration','Outcome'] },
      { key: 'timeline', label: 'Timeline', type: 'eventtimeline', slot: 'main' },
      { key: 'body', label: 'Account', type: 'richsections', slot: 'main' },
      { key: 'participants', label: 'Participants', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  plot: {
    type: 'plot', label: 'Plotline', plural: 'Plot', icon: '✎', layout: 'outline',
    title: { ph: 'Plotline title' }, subtitle: { ph: 'arc / thread (optional)' },
    sections: [
      { key: 'logline', label: 'Logline', type: 'richline', slot: 'main', lead: true },
      { key: 'structure', label: 'Structure', type: 'outline', slot: 'main' },
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
      { key: 'byuse', label: 'By use', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Field notes', type: 'excerpts', slot: 'main' },
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
      { key: 'byhabitat', label: 'By habitat', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Field notes', type: 'excerpts', slot: 'main' },
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
      { key: 'deities', label: 'Deities & powers', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
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
      { key: 'values', label: 'Values & taboos', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Sayings', type: 'excerpts', slot: 'main' },
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
      { key: 'motifs', label: 'Motifs & themes', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Tellings', type: 'excerpts', slot: 'main' },
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
      { key: 'features', label: 'Features & sample', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },

  /* ---- research desk: reference notes with sourced reliability + a real-vs-invented
     ledger. Historical fiction's non-negotiable; serves any research-heavy genre.
     Reuses the catalog (a source per card, its scale badge = per-source Reliability)
     and a header `meter` for overall confidence; adds the `ledger` field. ---- */
  research: {
    type: 'research', label: 'Research', plural: 'Research', icon: '❡', layout: 'hero', media: 'feature',
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

  /* ---- shared deep single-subject sheet: any catalog item can link out to one ---- */
  article: {
    type: 'article', label: 'Article', plural: 'Articles', icon: '◆', layout: 'split',
    title: { ph: 'Subject (a creature, plant, faith, custom, tale…)' }, subtitle: { ph: 'kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Origin','Range','Rarity','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'connections', label: 'Connections', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
};

// Display order for the type picker / project view.
export const ENTRY_TYPES = ['character','house','organization','realm','location','business','dwelling','flora','fauna','religion','beliefs','folklore','language','event','plot','lore','item','research','source','article'];

// Type families — group the entry types for the project-view category filter + the
// "New entry" picker. Source of truth for section order too (people → places → nature → culture → story → lore).
export const FAMILIES = [
  { key: 'people',  label: 'People',  types: ['character','house','organization'] },
  { key: 'places',  label: 'Places',  types: ['realm','location','business','dwelling'] },
  { key: 'nature',  label: 'Nature',  types: ['flora','fauna'] },
  { key: 'culture', label: 'Culture', types: ['religion','beliefs','folklore','language'] },
  { key: 'story',   label: 'Story',   types: ['event','plot'] },
  { key: 'lore',    label: 'Lore',    types: ['lore','item','research','source','article'] },
];

// Back-compat: earlier saves used 'faction'; treat it as 'organization'.
export const TYPE_ALIASES = { faction: 'organization' };

export function templateFor(type){ return TEMPLATES[type] || TEMPLATES[TYPE_ALIASES[type]] || TEMPLATES.character; }

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
    case 'taggroups': return [];
    case 'excerpts': return [];
    case 'outline': return { acts: [] };
    case 'lineage': return { nodes: [] };
    case 'allegianceweb': return [];
    case 'eventtimeline': return null;
    case 'spotify': return [];
    default: return '';
  }
}
