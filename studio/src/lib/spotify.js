/* Spotify embed helpers. We NEVER inject a user-supplied iframe — we parse a share link
   into a validated {type, id} and build the canonical open.spotify.com/embed URL ourselves. */

const KINDS = 'playlist|track|album|artist|episode|show';

// Accepts open.spotify.com links (incl. /intl-xx/ and /embed/) and spotify: URIs.
export function parseSpotify(url){
  const m = String(url || '').match(new RegExp('(?:spotify\\.com/(?:intl-[a-z]+/)?(?:embed/)?|spotify:)(' + KINDS + ')[/:]([A-Za-z0-9]+)', 'i'));
  return m ? { type: m[1].toLowerCase(), id: m[2] } : null;
}

export function embedUrl(item){ return 'https://open.spotify.com/embed/' + item.type + '/' + item.id; }

// Tracks/episodes use Spotify's compact player; playlists/albums/artists the full one.
export function embedHeight(item){ return (item.type === 'track' || item.type === 'episode') ? 152 : 352; }
