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
};

// Display order for the type picker / project view.
export const ENTRY_TYPES = ['character','house','organization','realm','location','business','dwelling','lore','item','event','plot'];

// Type families — group the entry types for the project-view category filter + the
// "New entry" picker. Source of truth for section order too (people → places → story → lore).
export const FAMILIES = [
  { key: 'people', label: 'People', types: ['character','house','organization'] },
  { key: 'places', label: 'Places', types: ['realm','location','business','dwelling'] },
  { key: 'story',  label: 'Story',  types: ['event','plot'] },
  { key: 'lore',   label: 'Lore',   types: ['lore','item'] },
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
