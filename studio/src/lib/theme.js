/* ============ THEME: palettes + fonts (ported from the original single-file app) ============ */

export const PALETTES = [
  {id:"oxblood",  name:"Oxblood",   bg:"#15100e",panel:"#1d1613",panel2:"#241b16",ink:"#e7dcc8",muted:"#a2937a",faint:"#6f6353",accent:"#a8323a",accentSoft:"#d98a86",rule:"#332720",line:"rgba(231,220,200,.08)"},
  {id:"slate",    name:"Slate",     bg:"#15171c",panel:"#1c1f26",panel2:"#232833",ink:"#dfe3ea",muted:"#8b93a0",faint:"#626b78",accent:"#c9414f",accentSoft:"#e08a92",rule:"#2b313c",line:"rgba(223,227,234,.08)"},
  {id:"midnight", name:"Midnight",  bg:"#0f1320",panel:"#161c2e",panel2:"#1d2540",ink:"#dfe6f2",muted:"#93a0bd",faint:"#5f6a86",accent:"#4f7fd0",accentSoft:"#9db8ea",rule:"#232c44",line:"rgba(223,230,242,.08)"},
  {id:"emerald",  name:"Emerald",   bg:"#0e1613",panel:"#152019",panel2:"#1b291f",ink:"#dce7dd",muted:"#8fae95",faint:"#5c7460",accent:"#3f9d6d",accentSoft:"#8fd3a8",rule:"#243528",line:"rgba(220,231,221,.08)"},
  {id:"amethyst", name:"Amethyst",  bg:"#141026",panel:"#1c1636",panel2:"#241c44",ink:"#e2dbf0",muted:"#9c8fc0",faint:"#6a5f8c",accent:"#9a5fd0",accentSoft:"#c4a3e8",rule:"#33285a",line:"rgba(226,219,240,.08)"},
  {id:"noir",     name:"Noir",      bg:"#0c0d11",panel:"#111318",panel2:"#181b22",ink:"#e9e7df",muted:"#8a9099",faint:"#5b626c",accent:"#c31f38",accentSoft:"#d98a92",rule:"#232830",line:"rgba(233,231,223,.08)"},
  {id:"bloodmoon",name:"Bloodmoon", bg:"#120b0c",panel:"#1c1112",panel2:"#251517",ink:"#ecdcd8",muted:"#b08e88",faint:"#7a5c58",accent:"#c0392b",accentSoft:"#e08a7f",rule:"#331f1e",line:"rgba(236,220,216,.08)"},
  {id:"parchment",name:"Parchment", bg:"#efe6d1",panel:"#e7dcc0",panel2:"#ddd0ad",ink:"#2b2014",muted:"#6b5839",faint:"#8a765a",accent:"#9a3324",accentSoft:"#8a3f30",rule:"#cbb98c",line:"rgba(43,32,20,.12)"},
  {id:"ash",      name:"Ash (light)",bg:"#e9ecee",panel:"#f6f8f9",panel2:"#e2e7ea",ink:"#171b1f",muted:"#5c6b73",faint:"#8a969c",accent:"#b0352b",accentSoft:"#8a4038",rule:"#d3dade",line:"rgba(22,27,31,.10)"},
  {id:"sepia",    name:"Sepia",     bg:"#efe9df",panel:"#f6f1e8",panel2:"#e6dccb",ink:"#2a231a",muted:"#6d5f4c",faint:"#8f8069",accent:"#8a5a2b",accentSoft:"#a5744a",rule:"#d8cbb4",line:"rgba(42,35,26,.10)"},
  {id:"wine",     name:"Wine",      bg:"#180f12",panel:"#211419",panel2:"#2a1a20",ink:"#ecdce2",muted:"#b493a0",faint:"#7a5c68",accent:"#a12d4e",accentSoft:"#e08aa2",rule:"#33202a",line:"rgba(236,220,226,.08)"},
  {id:"teal",     name:"Teal",      bg:"#0d1618",panel:"#132022",panel2:"#18292c",ink:"#dbe9ea",muted:"#8bafb2",faint:"#5c7679",accent:"#2f9aa0",accentSoft:"#86d3d8",rule:"#223436",line:"rgba(219,233,234,.08)"},
  {id:"amber",    name:"Amber",     bg:"#16110a",panel:"#1f1810",panel2:"#271e13",ink:"#ece0cc",muted:"#b09a7a",faint:"#786a4e",accent:"#c08a2e",accentSoft:"#e6c07a",rule:"#33291a",line:"rgba(236,224,204,.08)"},
  {id:"rose",     name:"Rose",      bg:"#171013",panel:"#201619",panel2:"#291c20",ink:"#eddde2",muted:"#b799a2",faint:"#7a5f68",accent:"#c56b7e",accentSoft:"#eaa8b4",rule:"#322229",line:"rgba(237,221,226,.08)"},
  {id:"steel",    name:"Steel",     bg:"#14171b",panel:"#1b1f26",panel2:"#232833",ink:"#dde3ea",muted:"#8c96a4",faint:"#5f6874",accent:"#6b8cae",accentSoft:"#a9c2dc",rule:"#2a313b",line:"rgba(221,227,234,.07)"},
  {id:"pine",     name:"Pine",      bg:"#0c130f",panel:"#121b16",panel2:"#17241c",ink:"#d7e4da",muted:"#86a591",faint:"#566b5d",accent:"#4a8f66",accentSoft:"#92cba6",rule:"#203029",line:"rgba(215,228,218,.07)"},
  {id:"ivory",    name:"Ivory (light)",bg:"#f2ece0",panel:"#f8f3ea",panel2:"#e9e0cf",ink:"#241f18",muted:"#6b6153",faint:"#938876",accent:"#9a4a34",accentSoft:"#a5654f",rule:"#ddd2bf",line:"rgba(36,31,24,.10)"},
  {id:"fog",      name:"Fog (light)",bg:"#eceef1",panel:"#f6f8fa",panel2:"#e2e6ec",ink:"#1a1f26",muted:"#5b6673",faint:"#8994a2",accent:"#4a6b96",accentSoft:"#6f8bb0",rule:"#d3d9e1",line:"rgba(26,31,38,.09)"}
];

export function palById(id){ return PALETTES.find(p => p.id === id) || PALETTES[1]; }
export function paletteVars(p){ return ":root{--bg:"+p.bg+";--panel:"+p.panel+";--panel-2:"+p.panel2+";--ink:"+p.ink+";--muted:"+p.muted+";--faint:"+p.faint+";--accent:"+p.accent+";--accent-soft:"+p.accentSoft+";--rule:"+p.rule+";--line:"+p.line+"}"; }

export const FACES = [
  {id:"abril-fatface",name:"Abril Fatface",family:"Abril Fatface",cat:"serif",dir:"Abril_Fatface",file:"AbrilFatface-Regular.ttf",ital:"",varr:false},
  {id:"alegreya",name:"Alegreya",family:"Alegreya",cat:"serif",dir:"Alegreya",file:"Alegreya-VariableFont_wght.ttf",ital:"Alegreya-Italic-VariableFont_wght.ttf",varr:true},
  {id:"bodoni-moda",name:"Bodoni Moda",family:"Bodoni Moda",cat:"serif",dir:"Bodoni_Moda",file:"BodoniModa-VariableFont_opsz,wght.ttf",ital:"BodoniModa-Italic-VariableFont_opsz,wght.ttf",varr:true},
  {id:"cardo",name:"Cardo",family:"Cardo",cat:"serif",dir:"Cardo",file:"Cardo-Regular.ttf",ital:"Cardo-Italic.ttf",varr:false},
  {id:"cinzel",name:"Cinzel",family:"Cinzel",cat:"serif",dir:"Cinzel",file:"Cinzel-VariableFont_wght.ttf",ital:"",varr:true},
  {id:"cormorant-garamond",name:"Cormorant Garamond",family:"Cormorant Garamond",cat:"serif",dir:"Cormorant_Garamond",file:"CormorantGaramond-VariableFont_wght.ttf",ital:"CormorantGaramond-Italic-VariableFont_wght.ttf",varr:true},
  {id:"crimson-pro",name:"Crimson Pro",family:"Crimson Pro",cat:"serif",dir:"Crimson_Pro",file:"CrimsonPro-VariableFont_wght.ttf",ital:"CrimsonPro-Italic-VariableFont_wght.ttf",varr:true},
  {id:"dm-serif-display",name:"DM Serif Display",family:"DM Serif Display",cat:"serif",dir:"DM_Serif_Display",file:"DMSerifDisplay-Regular.ttf",ital:"DMSerifDisplay-Italic.ttf",varr:false},
  {id:"eb-garamond",name:"EB Garamond",family:"EB Garamond",cat:"serif",dir:"EB_Garamond",file:"EBGaramond-VariableFont_wght.ttf",ital:"EBGaramond-Italic-VariableFont_wght.ttf",varr:true},
  {id:"forum",name:"Forum",family:"Forum",cat:"serif",dir:"Forum",file:"Forum-Regular.ttf",ital:"",varr:false},
  {id:"fraunces",name:"Fraunces",family:"Fraunces",cat:"serif",dir:"Fraunces",file:"Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf",ital:"Fraunces-Italic-VariableFont_SOFT,WONK,opsz,wght.ttf",varr:true},
  {id:"grenze-gotisch",name:"Grenze Gotisch",family:"Grenze Gotisch",cat:"serif",dir:"Grenze_Gotisch",file:"GrenzeGotisch-VariableFont_wght.ttf",ital:"",varr:true},
  {id:"im-fell-english-sc",name:"IM Fell English SC",family:"IM Fell English SC",cat:"serif",dir:"IM_Fell_English_SC",file:"IMFellEnglishSC-Regular.ttf",ital:"",varr:false},
  {id:"im-fell-english",name:"IM Fell English",family:"IM Fell English",cat:"serif",dir:"IM_Fell_English",file:"IMFellEnglish-Regular.ttf",ital:"IMFellEnglish-Italic.ttf",varr:false},
  {id:"inter",name:"Inter",family:"Inter",cat:"sans",dir:"Inter",file:"Inter-VariableFont_opsz,wght.ttf",ital:"Inter-Italic-VariableFont_opsz,wght.ttf",varr:true},
  {id:"lora",name:"Lora",family:"Lora",cat:"serif",dir:"Lora",file:"Lora-VariableFont_wght.ttf",ital:"Lora-Italic-VariableFont_wght.ttf",varr:true},
  {id:"manrope",name:"Manrope",family:"Manrope",cat:"sans",dir:"Manrope",file:"Manrope-VariableFont_wght.ttf",ital:"",varr:true},
  {id:"marcellus",name:"Marcellus",family:"Marcellus",cat:"serif",dir:"Marcellus",file:"Marcellus-Regular.ttf",ital:"",varr:false},
  {id:"mulish",name:"Mulish",family:"Mulish",cat:"sans",dir:"Mulish",file:"Mulish-VariableFont_wght.ttf",ital:"Mulish-Italic-VariableFont_wght.ttf",varr:true},
  {id:"newsreader",name:"Newsreader",family:"Newsreader",cat:"serif",dir:"Newsreader",file:"Newsreader-VariableFont_opsz,wght.ttf",ital:"Newsreader-Italic-VariableFont_opsz,wght.ttf",varr:true},
  {id:"old-standard-tt",name:"Old Standard TT",family:"Old Standard TT",cat:"serif",dir:"Old_Standard_TT",file:"OldStandardTT-Regular.ttf",ital:"OldStandardTT-Italic.ttf",varr:false},
  {id:"playfair-display",name:"Playfair Display",family:"Playfair Display",cat:"serif",dir:"Playfair_Display",file:"PlayfairDisplay-VariableFont_wght.ttf",ital:"PlayfairDisplay-Italic-VariableFont_wght.ttf",varr:true},
  {id:"public-sans",name:"Public Sans",family:"Public Sans",cat:"sans",dir:"Public_Sans",file:"PublicSans-VariableFont_wght.ttf",ital:"PublicSans-Italic-VariableFont_wght.ttf",varr:true},
  {id:"sora",name:"Sora",family:"Sora",cat:"sans",dir:"Sora",file:"Sora-VariableFont_wght.ttf",ital:"",varr:true},
  {id:"space-grotesk",name:"Space Grotesk",family:"Space Grotesk",cat:"sans",dir:"Space_Grotesk",file:"SpaceGrotesk-VariableFont_wght.ttf",ital:"",varr:true},
  {id:"special-elite",name:"Special Elite",family:"Special Elite",cat:"serif",dir:"Special_Elite",file:"SpecialElite-Regular.ttf",ital:"",varr:false},
  {id:"spectral",name:"Spectral",family:"Spectral",cat:"serif",dir:"Spectral",file:"Spectral-Regular.ttf",ital:"Spectral-Italic.ttf",varr:false},
  {id:"uncial-antiqua",name:"Uncial Antiqua",family:"Uncial Antiqua",cat:"serif",dir:"Uncial_Antiqua",file:"UncialAntiqua-Regular.ttf",ital:"",varr:false},
  {id:"unifraktur",name:"UnifrakturMaguntia",family:"UnifrakturMaguntia",cat:"serif",dir:"UnifrakturMaguntia",file:"UnifrakturMaguntia-Regular.ttf",ital:"",varr:false},
  {id:"yeseva-one",name:"Yeseva One",family:"Yeseva One",cat:"serif",dir:"Yeseva_One",file:"YesevaOne-Regular.ttf",ital:"",varr:false}
];

export function faceById(id){ return FACES.find(f => f.id === id) || FACES.find(f => f.id === 'playfair-display') || FACES[0]; }
export function stackOf(id){ const f = faceById(id); return "'"+f.family+"',"+(f.cat === 'sans' ? 'sans-serif' : 'serif'); }
export function fontVars(headId, bodyId, hs, bs, ps){
  return ":root{--head:"+stackOf(headId)+";--body:"+stackOf(bodyId)+";--hs:"+(hs||1)+";--bs:"+(bs||1)+";--ps:"+(ps||1)+
    ";--sans:system-ui,'Helvetica Neue',Arial,sans-serif;--mono:ui-monospace,'SFMono-Regular',Menlo,'Courier New',monospace}";
}

export const SIZES = [{v:0.85,l:"S"},{v:1,l:"M"},{v:1.15,l:"L"},{v:1.3,l:"XL"},{v:1.5,l:"XXL"}];

function faceCSS(prefix, f){
  const ff = (file, style) => '@font-face{font-family:"'+f.family+'";font-style:'+style+';font-weight:'+(f.varr?'100 900':'400')+';font-display:swap;src:url("'+prefix+f.dir+'/'+file+'") format("truetype")}';
  let s = ff(f.file, 'normal');
  if (f.ital) s += ff(f.ital, 'italic');
  return s;
}
export function fontFaceCSS(prefix, ids){
  const arr = ids ? ids.map(faceById) : FACES, seen = {};
  let out = '';
  arr.forEach(f => { if (f && !seen[f.id]) { seen[f.id] = 1; out += faceCSS(prefix, f); } });
  return out;
}
