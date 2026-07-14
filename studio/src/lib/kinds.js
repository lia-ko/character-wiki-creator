/* ============================================================================
   The Kind library — genre presets for place sheets (realm / location).
   Picking a Kind seeds the sheet: it reshapes the Details keys, seeds the
   "At a glance" gauges, and reveals the genre-relevant sections. Nothing is
   locked — everything stays composable and opt-in afterwards, and any place
   works with no Kind at all. `Custom Kind` covers anything not listed here.

   A kind = { id, label, details:[keys], gauges:[gauge], sections:[keys] }.
   `sections` refer to place-template section keys; revealing only unhides keys
   the entry actually has, so a realm-scale kind on a Location degrades cleanly.
============================================================================ */

// Reusable pip ladders (low → high). A gauge is either a meter {label, levels}
// or a free value {label, text:true}.
const L = {
  stab:    ['Failing', 'Fraying', 'Steady', 'Secure'],
  danger:  ['Low', 'Moderate', 'High', 'Extreme'],
  wealth:  ['Poor', 'Modest', 'Comfortable', 'Rich'],
  tech:    ['Primitive', 'Industrial', 'Advanced', 'Cutting-edge'],
  magic:   ['None', 'Faint', 'Common', 'Saturated'],
  control: ['Contested', 'Shared', 'Dominated', 'Absolute'],
  size:    ['Tiny', 'Small', 'Large', 'Vast'],
  law:     ['Lawless', 'Loose', 'Ordered', 'Iron'],
  traffic: ['Dead', 'Quiet', 'Busy', 'Hub'],
  secrecy: ['Public', 'Known', 'Hidden', 'Sealed'],
  safety:  ['Dangerous', 'Uneasy', 'Safe', 'Secure'],
  supplies:['Starving', 'Scarce', 'Adequate', 'Stocked'],
  security:['Open', 'Guarded', 'Hardened', 'Black'],
  dread:   ['Faint', 'Present', 'Heavy', 'Suffocating'],
};
const m = (label, levels) => ({ label, levels });
const t = (label) => ({ label, text: true });

// genre → kinds. Section keys map to the expanded place codex (see templates.js):
// geography · government · economy · military · systems · culture · districts ·
// locations · powers · peoples · hidden · history · relations
export const KIND_GENRES = [
  { genre: 'Fantasy', kinds: [
    { id: 'kingdom',     label: 'Kingdom / Realm',   details: ['Capital', 'Ruling house', 'Government', 'Faith', 'Population', 'Status'], gauges: [m('Stability', L.stab), m('Wealth', L.wealth), m('Magic', L.magic), m('Danger', L.danger)], sections: ['government', 'powers', 'peoples', 'history', 'relations'] },
    { id: 'citystate',   label: 'City-state',        details: ['Ruler', 'Government', 'Trade', 'Defenses', 'Population', 'Status'], gauges: [m('Stability', L.stab), m('Wealth', L.wealth), m('Defenses', L.law)], sections: ['government', 'economy', 'districts', 'powers'] },
    { id: 'bordermarch', label: 'Border realm / March', details: ['Seat', 'Warden', 'Neighbors', 'Population', 'Status'], gauges: [m('Stability', L.stab), m('Danger', L.danger), m('Garrison', L.size)], sections: ['military', 'peoples', 'relations', 'history'] },
    { id: 'wilds',       label: 'Wilds / Untamed',   details: ['Terrain', 'Dangers', 'Denizens', 'Ruler', 'Status'], gauges: [m('Danger', L.danger), m('Magic', L.magic), m('Settlement', ['None', 'Sparse', 'Scattered', 'Settled'])], sections: ['geography', 'peoples', 'locations'] },
  ] },
  { genre: 'Dark fantasy · grimdark', kinds: [
    { id: 'ruinedkingdom', label: 'Ruined kingdom', details: ['Former seat', 'What fell it', 'Who rules now', 'Curse', 'Status'], gauges: [m('Danger', L.danger), m('Magic', L.magic), m('Ruin', ['Fresh', 'Decaying', 'Ruined', 'Lost'])], sections: ['history', 'hidden', 'powers', 'locations'] },
    { id: 'warzone',       label: 'Warzone / Contested march', details: ['Sides', 'Front', 'Toll', 'Who holds it', 'Status'], gauges: [m('Danger', L.danger), m('Front', ['Quiet', 'Skirmish', 'Active', 'Total']), m('Stability', L.stab)], sections: ['military', 'powers', 'relations', 'history'] },
    { id: 'blighted',      label: 'Blighted land', details: ['Blight', 'Source', 'Survivors', 'Status'], gauges: [m('Danger', L.danger), m('Blight', ['Edge', 'Spreading', 'Deep', 'Total'])], sections: ['geography', 'hidden', 'peoples'] },
  ] },
  { genre: 'Science fiction', kinds: [
    { id: 'starsystem', label: 'Star system / Cluster', details: ['Capital', 'Governance', 'Tech', 'Population', 'Status'], gauges: [m('Tech', L.tech), m('Stability', L.stab), m('Danger', L.danger)], sections: ['government', 'powers', 'locations', 'history', 'relations'] },
    { id: 'planet',     label: 'Planet / Moon', details: ['Gravity', 'Atmosphere', 'Biome', 'Settlement', 'Population', 'Status'], gauges: [m('Habitability', ['Hostile', 'Harsh', 'Marginal', 'Benign']), m('Development', ['Wild', 'Outpost', 'Settled', 'Urbanized']), m('Danger', L.danger)], sections: ['geography', 'peoples', 'economy', 'locations'] },
    { id: 'orbital',    label: 'Orbital / Station', details: ['Operator', 'Population', 'Function', 'Docking', 'Status'], gauges: [m('Traffic', L.traffic), m('Security', L.law), m('Stability', L.stab)], sections: ['government', 'powers', 'locations'] },
    { id: 'colony',     label: 'Colony / Outpost', details: ['Sponsor', 'Founded', 'Resources', 'Population', 'Status'], gauges: [m('Self-sufficiency', ['Dependent', 'Supplied', 'Stable', 'Thriving']), m('Danger', L.danger), m('Wealth', L.wealth)], sections: ['economy', 'peoples', 'history', 'locations'] },
  ] },
  { genre: 'Space opera · galactic', kinds: [
    { id: 'empire',        label: 'Empire / Imperium', details: ['Throneworld', 'Ruler', 'Reach', 'Species', 'Status'], gauges: [m('Reach', ['Local', 'Regional', 'Sector', 'Galactic']), m('Stability', L.stab), m('Military', L.size)], sections: ['government', 'powers', 'peoples', 'relations', 'history'] },
    { id: 'sector',        label: 'Sector / Reach', details: ['Hub', 'Powers', 'Trade lanes', 'Status'], gauges: [m('Stability', L.stab), m('Traffic', L.traffic), m('Danger', L.danger)], sections: ['powers', 'economy', 'relations', 'locations'] },
    { id: 'homeworld',     label: 'Homeworld', details: ['Species', 'Government', 'Population', 'Status'], gauges: [m('Tech', L.tech), m('Stability', L.stab), m('Unity', ['Fractured', 'Divided', 'United', 'One'])], sections: ['peoples', 'government', 'culture', 'history'] },
    { id: 'megastructure', label: 'Megastructure', details: ['Builders', 'Scale', 'Function', 'Who holds it', 'Status'], gauges: [m('Scale', ['Huge', 'Vast', 'Colossal', 'Impossible']), m('Integrity', ['Failing', 'Worn', 'Sound', 'Pristine']), m('Control', L.control)], sections: ['geography', 'powers', 'history', 'hidden'] },
  ] },
  { genre: 'Cyberpunk', kinds: [
    { id: 'sprawl',     label: 'Sprawl / Metroplex', details: ['Corp control', 'Population', 'Tech', 'Districts', 'Status'], gauges: [m('Corp control', L.control), m('Danger', L.danger), m('Tech', L.tech), m('Wealth', L.wealth)], sections: ['districts', 'powers', 'economy', 'hidden'] },
    { id: 'arcology',   label: 'Arcology', details: ['Owner-corp', 'Levels', 'Population', 'Security', 'Status'], gauges: [m('Corp control', L.control), m('Security', L.law), m('Wealth', L.wealth)], sections: ['districts', 'powers', 'economy'] },
    { id: 'corpzone',   label: 'Corporate enclave', details: ['Corp', 'Function', 'Access', 'Assets', 'Status'], gauges: [m('Security', L.law), m('Wealth', L.wealth), m('Corp control', L.control)], sections: ['powers', 'economy', 'hidden'] },
    { id: 'combatzone', label: 'Combat zone / Undercity', details: ['Who runs it', 'Gangs', 'Dangers', 'Status'], gauges: [m('Danger', L.danger), m('Law', ['None', 'Token', 'Present', 'Heavy']), m('Stability', L.stab)], sections: ['powers', 'districts', 'hidden'] },
    { id: 'thenet',     label: 'The Net / Grid', details: ['Owner', 'Security', 'Denizens', 'Nodes', 'Status'], gauges: [m('Security', L.security), m('Danger', L.danger), m('Traffic', ['Dead', 'Quiet', 'Busy', 'Flooded'])], sections: ['powers', 'hidden', 'locations'] },
  ] },
  { genre: 'Steampunk · gaslamp · dieselpunk', kinds: [
    { id: 'industrialcity',   label: 'Industrial city', details: ['Government', 'Industry', 'Population', 'Class', 'Status'], gauges: [m('Wealth', L.wealth), m('Industry', ['Nascent', 'Growing', 'Booming', 'Choking']), m('Stability', L.stab)], sections: ['government', 'economy', 'districts', 'powers'] },
    { id: 'aetherport',       label: 'Aether-port / Sky city', details: ['Warden', 'Docks', 'Trade', 'Altitude', 'Status'], gauges: [m('Wealth', L.wealth), m('Traffic', L.traffic), m('Danger', L.danger)], sections: ['economy', 'powers', 'locations'] },
    { id: 'industrialnation', label: 'Nation (industrial age)', details: ['Government', 'Capital', 'Industry', 'Rivals', 'Status'], gauges: [m('Industry', ['Nascent', 'Growing', 'Booming', 'Choking']), m('Military', L.size), m('Stability', L.stab)], sections: ['government', 'powers', 'relations', 'history'] },
  ] },
  { genre: 'Modern · contemporary · urban fantasy', kinds: [
    { id: 'megacity',      label: 'Megacity / City', details: ['Government', 'Population', 'Economy', 'Founded', 'Status'], gauges: [m('Safety', L.safety), m('Wealth', L.wealth), m('Occult', ['None', 'Rumored', 'Present', 'Rising'])], sections: ['districts', 'powers', 'economy', 'government', 'hidden'] },
    { id: 'nation',        label: 'Nation / Region', details: ['Government', 'Capital', 'Population', 'GDP', 'Status'], gauges: [m('Stability', L.stab), m('Wealth', L.wealth), m('Military', L.size)], sections: ['government', 'powers', 'relations', 'history'] },
    { id: 'neighborhood',  label: 'Neighborhood / District', details: ['City', 'Character', 'Who runs it', 'Status'], gauges: [m('Safety', L.safety), m('Wealth', L.wealth)], sections: ['districts', 'powers', 'hidden'] },
    { id: 'hiddenenclave', label: 'Hidden enclave (UF)', details: ['Who lives here', 'Veil', 'Wards', 'Powers', 'Status'], gauges: [m('Secrecy', L.secrecy), m('Magic', L.magic), m('Danger', L.danger)], sections: ['peoples', 'hidden', 'powers', 'relations'] },
  ] },
  { genre: 'Superhero', kinds: [
    { id: 'metropolis', label: 'Metropolis', details: ['Population', 'Hero presence', 'Crime', 'Big employer', 'Status'], gauges: [m('Safety', L.safety), m('Hero presence', ['None', 'Some', 'Strong', 'Saturated']), m('Crime', L.danger)], sections: ['districts', 'powers', 'economy', 'hidden'] },
    { id: 'herohq',     label: 'HQ / Base', details: ['Owner-team', 'Location', 'Defenses', 'Roster', 'Status'], gauges: [m('Defenses', L.law), m('Secrecy', ['Public', 'Known', 'Hidden', 'Secret']), m('Size', L.size)], sections: ['powers', 'locations', 'hidden'] },
    { id: 'hiddenlair', label: 'Hidden lair', details: ['Who', 'Secret since', 'Access', 'Assets', 'Status'], gauges: [m('Secrecy', ['Public', 'Known', 'Hidden', 'Secret']), m('Defenses', L.law), m('Danger', L.danger)], sections: ['powers', 'hidden'] },
  ] },
  { genre: 'LitRPG · progression · cultivation', kinds: [
    { id: 'zone',          label: 'Zone / Region', details: ['Level range', 'Denizens', 'Resources', 'Quests', 'Status'], gauges: [m('Danger', L.danger), m('Level', ['Low', 'Mid', 'High', 'Endgame']), m('Traffic', ['Dead', 'Quiet', 'Busy', 'Farmed'])], sections: ['geography', 'powers', 'locations'] },
    { id: 'dungeon',       label: 'Dungeon / Tower floor', details: ['Floor', 'Theme', 'Boss', 'Loot', 'Status'], gauges: [m('Danger', L.danger), m('Difficulty', ['Trivial', 'Fair', 'Hard', 'Brutal']), m('Clears', ['None', 'Rare', 'Common', 'Farmed'])], sections: ['powers', 'locations', 'hidden'] },
    { id: 'sectterritory', label: 'Sect territory (xianxia)', details: ['Sect', 'Qi density', 'Rank', 'Rivals', 'Status'], gauges: [m('Qi density', ['Thin', 'Ample', 'Rich', 'Saturated']), m('Rank', ['Minor', 'Notable', 'Great', 'Supreme']), m('Danger', L.danger)], sections: ['powers', 'relations', 'peoples', 'history'] },
    { id: 'immortalrealm', label: 'Immortal realm / Plane', details: ['Ruler', 'Law', 'Access', 'Denizens', 'Status'], gauges: [m('Qi density', ['Thin', 'Ample', 'Rich', 'Saturated']), m('Danger', L.danger), m('Control', L.control)], sections: ['peoples', 'hidden', 'powers', 'geography'] },
  ] },
  { genre: 'Historical', kinds: [
    { id: 'empirehist',  label: 'Empire / Province', details: ['Ruler', 'Era', 'Capital', 'Religion', 'Status'], gauges: [m('Stability', L.stab), m('Wealth', L.wealth), m('Reach', ['Local', 'Regional', 'Vast', 'Imperial'])], sections: ['government', 'powers', 'peoples', 'history', 'relations'] },
    { id: 'periodcity',  label: 'City (period)', details: ['Era', 'Rulers', 'Population', 'Trade', 'Status'], gauges: [m('Wealth', L.wealth), m('Stability', L.stab), m('Trade', ['Backwater', 'Local', 'Regional', 'Hub'])], sections: ['government', 'economy', 'districts', 'history'] },
  ] },
  { genre: 'Post-apocalyptic', kinds: [
    { id: 'enclave',   label: 'Enclave / Settlement', details: ['Faction', 'Population', 'Resources', 'Defenses', 'Status'], gauges: [m('Security', L.law), m('Supplies', L.supplies), m('Stability', L.stab)], sections: ['powers', 'economy', 'peoples', 'relations'] },
    { id: 'wasteland', label: 'Wasteland / Ruin', details: ['Hazard', 'What’s left', 'Scavengers', 'Status'], gauges: [m('Danger', L.danger), m('Radiation', ['Clean', 'Traces', 'Hot', 'Lethal']), m('Salvage', ['Picked', 'Sparse', 'Rich', 'Untouched'])], sections: ['geography', 'powers', 'locations', 'hidden'] },
    { id: 'vault',     label: 'Vault / Bunker', details: ['Operator', 'Capacity', 'Sealed since', 'Status'], gauges: [m('Integrity', ['Breached', 'Failing', 'Sound', 'Sealed']), m('Supplies', L.supplies), m('Stability', L.stab)], sections: ['government', 'history', 'hidden'] },
  ] },
  { genre: 'Horror · gothic · cosmic', kinds: [
    { id: 'cursedtown',    label: 'Cursed town', details: ['Isolation', 'What’s wrong', 'Population', 'Status'], gauges: [m('Dread', L.dread), m('Isolation', ['Connected', 'Remote', 'Cut off', 'Lost']), m('Population', ['Thriving', 'Dwindling', 'Sparse', 'Empty'])], sections: ['hidden', 'history', 'peoples', 'locations'] },
    { id: 'estate',        label: 'Estate / Institution', details: ['Owner', 'Built', 'Dark history', 'Status'], gauges: [m('Dread', L.dread), m('Decay', ['Kept', 'Faded', 'Decaying', 'Ruined'])], sections: ['hidden', 'history', 'locations'] },
    { id: 'forbiddensite', label: 'Forbidden site (cosmic)', details: ['What’s here', 'Wrongness', 'Toll', 'Status'], gauges: [m('Dread', L.dread), m('Wrongness', ['Subtle', 'Clear', 'Severe', 'Reality-breaking'])], sections: ['hidden', 'geography', 'history'] },
  ] },
  { genre: 'Nautical · age of sail · pirates', kinds: [
    { id: 'portcity', label: 'Port city / Free port', details: ['Harbor', 'Governance', 'Trade', 'Fleet', 'Status'], gauges: [m('Wealth', L.wealth), m('Traffic', L.traffic), m('Danger', L.danger)], sections: ['economy', 'districts', 'powers', 'locations'] },
    { id: 'island',   label: 'Island', details: ['Terrain', 'Who holds it', 'Anchorage', 'Dangers', 'Status'], gauges: [m('Danger', L.danger), m('Settlement', ['None', 'Sparse', 'Scattered', 'Settled']), m('Control', L.control)], sections: ['geography', 'peoples', 'locations'] },
    { id: 'waters',   label: 'The waters / A sea', details: ['Bounds', 'Currents', 'Hazards', 'Who sails it', 'Status'], gauges: [m('Danger', L.danger), m('Traffic', ['Dead', 'Quiet', 'Busy', 'Crowded'])], sections: ['geography', 'powers', 'relations'] },
  ] },
  { genre: 'Solarpunk · hopepunk', kinds: [
    { id: 'ecocity', label: 'Eco-city / Green arcology', details: ['Governance', 'Population', 'Systems', 'Biome', 'Status'], gauges: [m('Sustainability', ['Strained', 'Balanced', 'Thriving', 'Regenerative']), m('Stability', L.stab), m('Wealth', L.wealth)], sections: ['systems', 'government', 'districts', 'culture'] },
    { id: 'commune', label: 'Commune / Cooperative', details: ['How it decides', 'Members', 'What they make', 'Ties', 'Status'], gauges: [m('Sustainability', ['Strained', 'Balanced', 'Thriving', 'Regenerative']), m('Cohesion', ['Fraying', 'Loose', 'Close', 'United'])], sections: ['systems', 'culture', 'relations'] },
  ] },
  { genre: 'Espionage · thriller · noir', kinds: [
    { id: 'opcity',   label: 'Operational city', details: ['Jurisdiction', 'Players', 'Cover', 'Heat', 'Status'], gauges: [m('Heat', L.danger), m('Control', L.control), m('Surveillance', ['Light', 'Watched', 'Heavy', 'Total'])], sections: ['powers', 'hidden', 'relations'] },
    { id: 'facility', label: 'Facility / Safehouse', details: ['Owner', 'Purpose', 'Security', 'Assets', 'Status'], gauges: [m('Security', L.security), m('Secrecy', ['Public', 'Known', 'Hidden', 'Deniable'])], sections: ['hidden', 'powers'] },
    { id: 'precinct', label: 'Precinct / Underworld (noir)', details: ['Who runs it', 'Crime', 'Law', 'Players', 'Status'], gauges: [m('Crime', L.danger), m('Law', L.law), m('Control', L.control)], sections: ['powers', 'districts', 'hidden'] },
  ] },
  { genre: 'Western · mythic · fairy tale', kinds: [
    { id: 'frontiertown',   label: 'Frontier town', details: ['Law', 'Industry', 'Population', 'Status'], gauges: [m('Law', L.law), m('Wealth', L.wealth), m('Danger', L.danger)], sections: ['powers', 'economy', 'locations'] },
    { id: 'otherworld',     label: 'Otherworld (mythic / fae)', details: ['Ruler', 'The Rule', 'Season', 'Access', 'Status'], gauges: [m('Magic', L.magic), m('Danger', L.danger), m('The Rule', ['Loose', 'Binding', 'Strict', 'Absolute'])], sections: ['peoples', 'hidden', 'powers', 'geography'] },
    { id: 'enchantedrealm', label: 'Enchanted realm (fairy tale)', details: ['Its magic', 'Ruler', 'Curse', 'Denizens', 'Status'], gauges: [m('Magic', L.magic), m('Danger', L.danger), m('Curse', ['None', 'Faint', 'Strong', 'Total'])], sections: ['hidden', 'peoples', 'history'] },
  ] },
];

// Flat id → kind (with genre stamped on).
export const KINDS = {};
KIND_GENRES.forEach(g => g.kinds.forEach(k => { KINDS[k.id] = { ...k, genre: g.genre }; }));

// Read the current kind off an entry (tolerates the pre-Kind shape).
export function kindOf(entry){
  const v = entry && entry.data ? entry.data.kind : null;
  return v && typeof v === 'object' ? v : { id: '' };
}

/* Apply a preset. Non-destructive: Details/gauges preserve any values the user
   already set (matched by key/label), user-added Detail rows are kept, and only
   *revealing* sections — never hiding — happens here. */
export function applyKind(entry, kindId){
  const kind = KINDS[kindId];
  if (!kind || !entry || !entry.data) return;
  entry.data.kind = { id: kind.id, label: kind.label, genre: kind.genre };

  // Details → reseed stats, carrying over matching values + any non-empty extras.
  const prev = Array.isArray(entry.data.stats) ? entry.data.stats : [];
  const val = (k) => { const r = prev.find(p => (p.k || '').toLowerCase() === k.toLowerCase()); return r ? r.v : ''; };
  const keys = new Set(kind.details.map(k => k.toLowerCase()));
  const extras = prev.filter(p => (p.v || '').trim() && !keys.has((p.k || '').toLowerCase()));
  entry.data.stats = kind.details.map(k => ({ k, v: val(k) })).concat(extras.map(e => ({ k: e.k, v: e.v })));

  // Gauges → reseed, carrying over the marked level / value where labels match.
  const pg = Array.isArray(entry.data.gauges) ? entry.data.gauges : [];
  const gprev = (label) => pg.find(g => (g.label || '').toLowerCase() === label.toLowerCase());
  entry.data.gauges = (kind.gauges || []).map(g => {
    const ex = gprev(g.label);
    if (g.text) return { label: g.label, text: true, value: (ex && ex.value) || '' };
    const at = ex && typeof ex.at === 'number' ? Math.min(ex.at, g.levels.length - 1) : 0;
    return { label: g.label, levels: g.levels.slice(), at };
  });

  // Reveal the gauges block + the kind's suggested sections (only unhides).
  const reveal = new Set(['gauges', ...(kind.sections || [])]);
  if (Array.isArray(entry.hidden) && entry.hidden.length) entry.hidden = entry.hidden.filter(k => !reveal.has(k));
}

// Free-text kind, no preset (the "Custom Kind" escape hatch).
export function applyCustomKind(entry, label){
  if (!entry || !entry.data) return;
  entry.data.kind = { id: 'custom', label: (label || '').trim() };
}

export function clearKind(entry){
  if (entry && entry.data) entry.data.kind = { id: '' };
}

// Which section keys the current kind suggests (for the Add-menu highlight).
export function suggestedSections(entry){
  const k = KINDS[kindOf(entry).id];
  return new Set(k ? (k.sections || []) : []);
}
