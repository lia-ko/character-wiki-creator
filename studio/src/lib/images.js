/* Image picking + downscaling to keep embedded data URLs reasonable. Ported from the original app. */
const IMG_MAX = 1000;

function processImage(file, cb){
  const t = file.type; const reader = new FileReader();
  reader.onload = function(){
    const url = reader.result;
    if (t !== 'image/jpeg' && t !== 'image/png'){ cb(url); return; } // gif/webp untouched (keep animation)
    const img = new Image();
    img.onload = function(){
      const w = img.naturalWidth, h = img.naturalHeight, scale = Math.min(1, IMG_MAX / Math.max(w, h));
      if (scale >= 1){ cb(url); return; }
      const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
      const mime = (t === 'image/png') ? 'image/png' : 'image/jpeg';
      let out; try { out = (mime === 'image/jpeg') ? cv.toDataURL(mime, 0.85) : cv.toDataURL(mime); } catch (e) { out = null; }
      cb((out && out.length < url.length) ? out : url);
    };
    img.onerror = function(){ cb(url); };
    img.src = url;
  };
  reader.readAsDataURL(file);
}

function readImages(files, cb){
  const arr = [].slice.call(files), out = [], n = arr.length;
  if (!n){ cb([]); return; }
  let done = 0;
  arr.forEach((f, idx) => processImage(f, (u) => { out[idx] = u; done++; if (done === n) cb(out); }));
}

export function pickImages(multiple){
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = !!multiple;
    inp.onchange = () => readImages(inp.files, resolve);
    inp.click();
  });
}
