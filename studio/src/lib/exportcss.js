/* Reader-facing stylesheet for exported/preview pages. Static string (palette + fonts
   come from CSS vars injected by docShell). Mirrors the editor layouts, read-only. */

export const READER_CSS = [
"*{box-sizing:border-box}",
"body{margin:0;min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15px;-webkit-font-smoothing:antialiased}",
"a{color:var(--accent-soft);text-decoration:none}a:hover{text-decoration:underline}",
".empty{color:var(--faint);font-style:italic}",

/* topbar */
".topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:16px;padding:12px 26px;background:var(--panel);border-bottom:1px solid var(--rule)}",
".topbar .crumb{font-family:var(--mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}.topbar .crumb a{color:var(--accent)}",
".topbar .tbadge{margin-left:auto;font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);border:1px solid var(--rule);border-radius:20px;padding:3px 10px}",

/* titles */
".etitle h1{font-family:var(--head);font-weight:400;font-size:calc(2.4rem*var(--hs,1));line-height:1.03;margin:0;color:var(--ink);text-wrap:balance}",
".esub{font-family:var(--mono);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-top:8px}",
".words{display:flex;align-items:center;gap:12px;margin-top:8px}.words::before,.words::after{content:'';height:1px;flex:1;max-width:90px;background:var(--rule)}.words span{font-family:var(--body);font-style:italic;color:var(--muted)}",
".whero .etitle,.whero .words{align-items:center;text-align:center}.whero .etitle h1{text-align:center}.whero .esub{text-align:center}.whero .words{justify-content:center}",

/* layout containers */
".wrap-narrow{max-width:760px;margin:0 auto;padding:34px 26px 90px}",
".whero{max-width:900px;margin:0 auto;padding:34px 26px 90px}",
".herohead{display:flex;gap:20px;align-items:center}.herohead .sig{flex:none;width:104px}",
".wsplit{max-width:1160px;margin:0 auto;padding:34px 30px 90px;display:grid;grid-template-columns:minmax(180px,calc(340px * var(--ps,1))) 1fr;gap:40px;align-items:start}",
".wsplit .media{position:sticky;top:70px}",
".wbody{display:grid;grid-template-columns:1fr 300px;max-width:1160px;margin:0 auto;gap:40px;padding:0 26px}",
".wbody .article{padding:34px 0;min-width:0}.wbody .infobox{padding:34px 0}",

/* headings + prose */
"h2{font-family:var(--head);font-weight:400;font-size:calc(1.7rem*var(--hs,1));color:var(--ink);margin:34px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--rule)}",
"h3{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:22px 0 8px}",
"h4{font-size:.66rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid var(--line)}",
"p{font-family:var(--body);font-size:calc(1rem*var(--bs,1));line-height:1.72;color:var(--ink);opacity:.92;margin:0 0 14px}",
".lead{font-family:var(--body);font-size:calc(1.14rem*var(--bs,1));line-height:1.7;color:var(--ink);border-left:3px solid var(--accent);padding-left:16px;margin:14px 0 24px}",

/* stats */
".stats{border:1px solid var(--rule);border-radius:8px;overflow:hidden;margin:6px 0}",
".stats .r{display:grid;grid-template-columns:40% 1fr;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);font-size:.82rem}.stats .r:last-child{border-bottom:none}",
".stats .k{font-family:var(--mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}.stats .v{color:var(--muted);font-family:var(--body)}",

/* carousel */
".carousel{border:1px solid var(--rule);border-radius:12px;overflow:hidden;background:var(--panel-2);margin:6px 0}",
".cstage{position:relative;aspect-ratio:16/10}.cslide{position:absolute;inset:0;display:none}.cslide.on{display:block}.cslide img{width:100%;height:100%;object-fit:cover;display:block}",
".herohead .sig .carousel .cstage{aspect-ratio:1}",
".wsplit .media .cstage,.wbody .infobox .cstage{aspect-ratio:3/4}",
".cnav{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-top:1px solid var(--rule);background:var(--panel)}",
".cbtn{background:none;border:1px solid var(--rule);border-radius:5px;color:var(--muted);width:30px;height:26px;cursor:pointer;font-size:1rem}.cbtn:hover{color:var(--ink);border-color:var(--accent)}",
".ccount{font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;color:var(--faint)}",

/* relations — one collapsible card with a big 3/4 side portrait (matches editor) */
".rels{display:flex;flex-direction:column;gap:10px;margin-top:6px}",
".rel{border:1px solid var(--rule);border-radius:10px;background:var(--panel);overflow:hidden}",
".rel>summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:48px 1fr auto;gap:14px;align-items:center;padding:10px 14px}.rel>summary::-webkit-details-marker{display:none}.rel>summary:hover{background:var(--line)}",
".rel .rthumb{width:48px;height:60px;border-radius:6px;background:var(--panel-2) center/cover;border:1px solid var(--rule)}",
".rel .rnm{font-family:var(--head);font-size:calc(1.2rem*var(--hs,1));color:var(--ink);display:block;line-height:1.1}",
".rel .rmeta{font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);margin-top:5px;display:block}",
".rel .chev{font-family:var(--mono);color:var(--faint)}.rel .chev::after{content:'▸'}.rel[open] .chev{transform:rotate(90deg)}",
".rel[open]>summary{border-bottom:1px solid var(--rule)}",
".rbody{display:grid;grid-template-columns:180px 1fr;gap:20px;align-items:start;padding:16px}.rbody .rport{width:100%;aspect-ratio:3/4;background:var(--panel-2) center/cover;border:1px solid var(--rule);border-radius:9px}",
".rbody .rtxt p{font-size:calc(.98rem*var(--bs,1))}",
"@media(max-width:640px){.rbody{grid-template-columns:1fr}}",

/* tag groups */
".tcat{margin:0 0 18px}.chips{display:flex;flex-wrap:wrap;gap:8px}",
".chip{border:1px solid var(--rule);border-radius:16px;background:var(--panel);color:var(--ink)}",
".chip.static{padding:6px 14px;font-size:.8rem}",
"details.chip>summary{list-style:none;cursor:pointer;padding:6px 14px;font-size:.8rem;display:flex;gap:8px;align-items:center}details.chip>summary::-webkit-details-marker{display:none}details.chip>summary::after{content:'＋';color:var(--accent-soft)}details.chip[open]>summary::after{content:'−'}",
"details.chip .note{display:block;padding:2px 14px 10px;font-size:.8rem;color:var(--muted);max-width:360px}",

/* excerpts */
".exc{border:1px solid var(--rule);border-radius:6px;background:var(--panel);margin-bottom:8px}",
".exc>summary{list-style:none;cursor:pointer;padding:10px 14px;font-family:var(--body);font-size:calc(.95rem*var(--bs,1));color:var(--ink);display:flex;gap:10px;align-items:center}.exc>summary::-webkit-details-marker{display:none}.exc>summary::before{content:'“';font-family:var(--head);font-size:1.3rem;color:var(--accent);line-height:0}",
".exc .eb{padding:0 16px 14px}.exc .src{font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-top:8px}",

/* outline */
".outline{display:flex;flex-direction:column;gap:10px}",
".act{border:1px solid var(--rule);border-radius:8px;background:var(--panel);padding:12px 14px}.act .at{font-family:var(--head);font-size:calc(1.2rem*var(--hs,1));color:var(--ink);margin-bottom:6px}",
".chap{border-left:2px solid var(--rule);margin:8px 0 8px 6px;padding-left:12px}.chap .ct{font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:4px}",
".beat{font-family:var(--body);font-size:calc(.95rem*var(--bs,1));color:var(--ink);opacity:.92;margin:4px 0}.beat .dot{color:var(--accent-soft)}",

/* lineage */
".lineage{overflow-x:auto}.lcanvas{display:flex;gap:30px;justify-content:center;padding:8px 4px}",
".subtree{display:inline-flex;flex-direction:column;align-items:center}.union{display:flex;align-items:center}",
".lnode,.pnode{border:1px solid var(--rule);border-radius:7px;background:var(--panel);padding:6px 11px;font-family:var(--head);font-size:calc(.92rem*var(--hs,1));color:var(--ink);white-space:nowrap}.pnode{background:var(--panel-2)}",
".bond{display:flex;flex-direction:column;align-items:center;padding:0 3px}.bond .line{width:22px;height:2px;background:var(--accent-soft);border-radius:2px}.bond.affair .line{height:0;background:none;border-top:2px dashed var(--faint)}.bond .lbl{font-family:var(--mono);font-size:.42rem;text-transform:uppercase;color:var(--faint);margin-top:3px}",
".vline{width:1px;height:14px;background:var(--rule)}",
".kids{display:flex;gap:16px;align-items:flex-start;position:relative;padding-top:14px}.kids::before{content:'';position:absolute;top:0;left:12%;right:12%;height:1px;background:var(--rule)}.kids.single::before{display:none}",
".kids>.branch{position:relative}.kids>.branch::before{content:'';position:absolute;top:-14px;left:50%;width:1px;height:14px;background:var(--rule)}",

/* allegiance web */
".web{display:flex;flex-direction:column;align-items:center;padding:16px 8px;border:1px solid var(--rule);border-radius:10px;background:var(--panel)}",
".web .tier{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}",
".web .box{border:1px solid var(--rule);border-radius:6px;padding:6px 13px;font-family:var(--head);font-size:calc(.9rem*var(--hs,1));color:var(--muted);background:var(--panel-2)}.web .box.self{border-color:var(--accent);color:var(--ink)}.web .box.liege{border-color:var(--accent-soft);color:var(--ink)}",
".web .down{width:1px;height:16px;background:var(--rule)}",
".web .sides{display:flex;gap:26px;margin-top:14px;padding-top:12px;border-top:1px solid var(--line);flex-wrap:wrap}.web .side{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.web .slbl{font-family:var(--mono);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}",
".wchip{border:1px solid var(--rule);border-radius:14px;padding:3px 10px;font-family:var(--body);font-size:.72rem;color:var(--muted)}.wchip.rival{color:var(--accent-soft)}",

/* event timeline */
".etl{border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:14px 12px;margin:6px 0}",
".track{position:relative;display:flex;gap:8px;overflow-x:auto;padding:6px 4px}.track .line{position:absolute;left:8px;right:8px;top:50%;height:2px;background:var(--rule)}",
".enode{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:100px;text-decoration:none}",
".enode .date{font-family:var(--mono);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);white-space:nowrap}",
".enode .edot{width:12px;height:12px;border-radius:50%;background:var(--panel-2);border:2px solid var(--rule)}.enode.current .edot{background:var(--accent);border-color:var(--accent)}",
".enode .ettl{font-family:var(--body);font-size:.78rem;color:var(--muted);text-align:center;max-width:120px}.enode.current .ettl{color:var(--ink)}",

/* hub + index pages */
".hubwrap{max-width:1180px;margin:0 auto;padding:44px 26px 90px}",
".hhero{margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid var(--rule)}",
".hhero .eyebrow{font-family:var(--mono);font-size:.64rem;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}",
".hhero h1{font-family:var(--head);font-weight:400;font-size:calc(clamp(2rem,5vw,3.2rem)*var(--hs,1));line-height:1;margin:0}",
".hhero .hcount{font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:11px}",
".hup{display:inline-block;font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}.hup:hover{color:var(--ink);text-decoration:none}",
".hsec{margin:30px 0}.hsec h2{display:flex;align-items:center;gap:10px}.hsec .hic{color:var(--accent-soft)}",
".hgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}",
".ecard{position:relative;background:var(--panel);border:1px solid var(--rule);border-radius:14px;overflow:hidden;transition:transform .12s,border-color .12s}.ecard:hover{transform:translateY(-3px);border-color:var(--accent);text-decoration:none}",
".ecard .portrait{aspect-ratio:3/4;background:var(--panel-2) center/cover;position:relative;display:flex;align-items:center;justify-content:center}",
".ecard .portrait::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.72))}",
".ecard .ini{font-family:var(--head);font-size:2.6rem;color:var(--line);text-transform:uppercase}",
".ecard .cmeta{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:12px 13px}",
".ecard .cnm{font-family:var(--head);font-size:calc(1.2rem*var(--hs,1));line-height:1.05;color:#fff}",
".ecard .csub{font-family:var(--mono);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);margin-top:5px}",
".pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}",
".pcard{background:var(--panel);border:1px solid var(--rule);border-radius:16px;overflow:hidden;transition:transform .12s,border-color .12s;display:block}.pcard:hover{transform:translateY(-3px);border-color:var(--accent);text-decoration:none}",
".phero{position:relative;aspect-ratio:4/3;background:var(--panel-2) center/cover;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--rule)}",
".phero::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.5))}",
".pini{font-family:var(--head);font-size:3.4rem;color:var(--line);text-transform:uppercase}",
".pstack{position:absolute;top:10px;left:12px;z-index:2;display:flex}",
".pst{width:34px;height:34px;border-radius:6px;background:var(--panel-2) center/cover;border:2px solid var(--panel);margin-left:-12px;box-shadow:0 2px 6px rgba(0,0,0,.4)}.pst:first-child{margin-left:0}",
".pcard .pbody{padding:15px 17px 17px}.pcard .pt{font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));line-height:1.08;color:var(--ink)}",
".pcard .pmeta{font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-soft);margin-top:8px}",

/* responsive */
"@media(max-width:860px){.wsplit{grid-template-columns:1fr;gap:22px}.wsplit .media{position:static}.wbody{grid-template-columns:1fr;gap:10px}}"
].join("\n");
