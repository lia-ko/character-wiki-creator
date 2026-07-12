/* Minimal ZIP writer (store / no compression). Ported from the original single-file app.
   files: [{ name, text }] or [{ name, bytes: Uint8Array }] -> Blob */

const CRCT = (function(){ const t = []; for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
function crc32(u8){ let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRCT[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
const u16 = (n) => [n & 255, (n >>> 8) & 255];
const u32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];

export function buildZip(files){
  const enc = new TextEncoder(); const parts = []; const central = []; let offset = 0;
  files.forEach(f => {
    const nameB = enc.encode(f.name), dataB = f.bytes ? f.bytes : enc.encode(f.text), crc = crc32(dataB);
    const lh = new Uint8Array([].concat(u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(dataB.length), u32(dataB.length), u16(nameB.length), u16(0)));
    parts.push(lh, nameB, dataB);
    const ch = new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(dataB.length), u32(dataB.length), u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset)));
    central.push(ch, nameB);
    offset += lh.length + nameB.length + dataB.length;
  });
  let cdSize = 0; central.forEach(c => cdSize += c.length);
  const eocd = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(offset), u16(0)));
  return new Blob(parts.concat(central, [eocd]), { type: 'application/zip' });
}
