/* Turn a pasted URL into a safe, embeddable iframe src. Known providers (YouTube, Vimeo,
   Spotify, Google-Maps embeds, Sketchfab) are normalised to their embed form; anything else
   that's a plain https URL is allowed but sandboxed. Returns {ok, kind, src, aspect|height,
   generic}. Used by the Embed field editor + the static-site renderer so both stay in step. */
export function embedInfo(raw){
  const url = String(raw || '').trim();
  if (!/^https?:\/\//i.test(url)) return { ok: false };
  let u; try { u = new URL(url); } catch { return { ok: false }; }
  const host = u.hostname.replace(/^www\./, '');
  const yt = (id) => ({ ok: true, kind: 'YouTube', src: 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id), aspect: '16 / 9' });

  if ((host === 'youtube.com' || host === 'm.youtube.com') && u.searchParams.get('v')) return yt(u.searchParams.get('v'));
  if (host === 'youtu.be' && u.pathname.length > 1) return yt(u.pathname.slice(1));
  if ((host === 'youtube.com' || host === 'youtube-nocookie.com') && /^\/embed\//.test(u.pathname)) return { ok: true, kind: 'YouTube', src: url.replace('youtube.com', 'youtube-nocookie.com'), aspect: '16 / 9' };

  if (host === 'vimeo.com' && /^\/\d+/.test(u.pathname)) return { ok: true, kind: 'Vimeo', src: 'https://player.vimeo.com/video/' + u.pathname.split('/')[1], aspect: '16 / 9' };
  if (host === 'player.vimeo.com') return { ok: true, kind: 'Vimeo', src: url, aspect: '16 / 9' };

  if (host === 'open.spotify.com'){ const p = u.pathname.split('/').filter(Boolean); if (p.length >= 2) return { ok: true, kind: 'Spotify', src: 'https://open.spotify.com/embed/' + p[0] + '/' + p[1], height: p[0] === 'track' ? 152 : 352 }; }

  if (/(^|\.)google\.[a-z.]+$/.test(host) && /\/maps\/embed/.test(u.pathname)) return { ok: true, kind: 'Map', src: url, aspect: '16 / 10' };

  if (host === 'sketchfab.com'){
    if (/\/embed/.test(u.pathname)) return { ok: true, kind: '3D', src: url, aspect: '16 / 9', generic: true };
    const m = u.pathname.match(/-([0-9a-f]{12,})\/?$/i) || u.pathname.match(/\/models\/([0-9a-f]{12,})/i);
    if (m) return { ok: true, kind: '3D', src: 'https://sketchfab.com/models/' + m[1] + '/embed', aspect: '16 / 9', generic: true };
  }

  // generic https → allowed, but sandboxed
  return { ok: true, kind: 'Embed', src: url, aspect: '16 / 9', generic: true };
}

export const EMBED_SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation';
export const EMBED_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share';
