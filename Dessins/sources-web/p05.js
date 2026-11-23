// 5. PORTE-OUTIL (d'étau-limeur)
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au coin arrière gauche du dessous.
// Feuille : vue de gauche à DROITE de la vue de face, vue de dessus en dessous.
return {
  side: "gauche",
  defaults: {Long:145, Prof:92, tP:32, zA:164, zM:184, zB:104, wS:66, yS:45, zH:45, dH:40},
  dims: [["Pièce",null],["Long","Longueur"],["Prof","Profondeur"],
         ["Plaque arrière",null],["tP","Épaisseur"],["zA","Hauteur aux bords"],["zM","Hauteur au sommet"],
         ["Bloc avant",null],["zB","Hauteur"],["wS","Largeur de la rainure"],["yS","Fond de la rainure (depuis l’arrière)"],
         ["Trou",null],["zH","Hauteur de l’axe"],["dH","Diamètre"]],
  elements: [
    {id:"plaque",name:"Plaque arrière", info:"Dessus arrondi (cylindre d’axe horizontal)"},
    {id:"bloc",  name:"Bloc avant", info:"Moins haut que la plaque"},
    {id:"rain",  name:"Rainure", info:"Ouverte à l’avant, en haut et en bas"},
    {id:"trou",  name:"Trou", info:"De l’arrière jusqu’au fond de la rainure"}],
  derive(p){
    const d = {...p, EcG:46, EcD:28, Deb:4};
    d.xM = p.Long/2; d.Ra = ((p.Long/2)**2+(p.zM-p.zA)**2)/(2*(p.zM-p.zA)); d.zR = p.zM-d.Ra;
    d.aR = Math.asin(Math.min(1,(p.Long/2)/d.Ra))*180/Math.PI;
    d.xSa = d.xM-p.wS/2; d.xSb = d.xM+p.wS/2; d.rH = p.dH/2; d.XG = p.Long+d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.zM <= d.zA) w.push("Le sommet doit être plus haut que les bords.");
    if (d.zB >= d.zA) w.push("Le bloc avant doit être moins haut que la plaque.");
    if (d.yS <= d.tP || d.yS >= d.Prof) w.push("Le fond de la rainure doit être dans le bloc avant.");
    if (d.rH*2 >= d.wS || d.zH+d.rH >= d.zB || d.zH-d.rH <= 0) w.push("Le trou doit déboucher dans la rainure.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, tP, zA, zM, zB, yS, zH, rH, xM, Ra, zR, aR, xSa, xSb, XG, EcD, Deb:deb} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], G = (y,z) => [XG+y,-z];
    const arc = Array.from({length:31},(_,i) => { const t = (90-aR+2*aR*i/30)*Math.PI/180; return F(xM+Ra*Math.cos(t), zR+Ra*Math.sin(t)); });
    a.label([0,-zM-9],"Vue de face"); a.label([XG,-zM-9],"Vue de gauche"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face
    a.line("plaque",[F(0,zA),F(0,0),F(L,0),F(L,zA)]); a.curve("plaque",arc);
    a.circle("trou",F(xM,zH),rH);
    a.axe("trou",F(xM-rH-deb,zH),F(xM+rH+deb,zH)); a.axe("trou",F(xM,zH-rH-deb),F(xM,zH+rH+deb));
    a.line("bloc",[F(0,zB),F(L,zB)],"vu",true);
    a.line("rain",[F(xSa,0),F(xSa,zB)],"vu",true); a.line("rain",[F(xSb,0),F(xSb,zB)],"vu",true);
    // vue de gauche (arrière à gauche)
    a.line("plaque",[G(tP,zB),G(tP,zM),G(0,zM),G(0,0)]); a.line("bloc",[G(0,0),G(P,0),G(P,zB),G(tP,zB)]);
    a.line("plaque",[G(0,zA),G(tP,zA)],"vu",true);
    a.line("rain",[G(yS,0),G(yS,zB)],"cache",true);
    [-1,1].forEach(s => a.line("trou",[G(0,zH+s*rH),G(yS,zH+s*rH)],"cache",true));
    a.axe("trou",G(-deb,zH),G(yS+deb,zH),true);
    // vue de dessus (avant en bas)
    a.line("plaque",[T(0,tP),T(0,0),T(L,0),T(L,tP)]);
    a.line("bloc",[T(0,tP),T(0,P),T(xSa,P)]); a.line("bloc",[T(L,tP),T(L,P),T(xSb,P)]);
    a.line("rain",[T(xSa,P),T(xSa,yS),T(xSb,yS),T(xSb,P)]);
    a.line("plaque",[T(0,tP),T(L,tP)],"vu",true);
    [-1,1].forEach(s => a.line("trou",[T(xM+s*rH,0),T(xM+s*rH,yS)],"cache",true));
    a.axe("trou",T(xM,-deb),T(xM,yS+deb),true);
    // renvois et droite à 45°
    a.line("bloc",[[XG,0],[XG,EcD]],"fin"); a.line("bloc",[T(L,0),[XG,EcD]],"fin");
    a.line("bloc",[[XG-3,EcD-3],[XG+P+4,EcD+P+4]],"fin");
    // traits de construction (R4)
    const fg = (el,z,ye,xs=L) => a.cons(el,[F(xs,z), G(cor?ye:P, z)]);   // xs : départ sur l'élément
    const tg = (el,y,ze,xs=L) => a.cons(el,[T(xs,y), [XG+y,EcD+y], G(y, cor?ze:zM)]);
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    a.cons("plaque",[F(xM,zM), G(cor?0:P, zM)]); fg("plaque",zA,0);   // sommet de l'arrondi
    ft("plaque",0,0,tP); ft("plaque",L,0,tP); tg("plaque",0,zM); fg("bloc",zB,yS); [-1,1].forEach(s => fg("trou",zH+s*rH,0,xM));
    tg("plaque",tP,zM); tg("rain",yS,zB,xSb); tg("bloc",P,zB);
    ft("rain",xSa,0,P); ft("rain",xSb,0,P); [-1,1].forEach(s => ft("trou",xM+s*rH,zH,yS));
  },
  solid(d, k){
    const {Long:L, Prof:P, tP, zA, zB, yS, zH, rH, xM, Ra, zR, aR, xSa, xSb} = d, rad = Math.PI/180;
    const croix = (el,c,u,v,l) => [u,v].forEach(w => k.axe(el, c.map((q,i) => q-l*w[i]), c.map((q,i) => q+l*w[i])));   // croix d'axes devant un trou
    k.revol("trou",[xM,-5,zH],[xM,yS+5,zH],rH,[[xM,0,zH],[xM,yS,zH]]);   // axes
    const arc = k.arc(xM,zR,Ra,90-aR,90+aR,30);
    const cH = k.arc(xM,zH,rH,0,360,40);
    // plaque
    k.planar("plaque",[[0,0],[L,0],...arc],[cH],(u,v) => [u,0,v]);
    k.planar("plaque",[[0,zB],[L,zB],...arc],[],(u,v) => [u,tP,v]);
    k.surf("plaque",(u,v) => { const t = (90-aR+2*aR*v)*rad; return [xM+Ra*Math.cos(t), u*tP, zR+Ra*Math.sin(t)]; },1,30,{edges:[]});
    const cote = [[0,0],[P,0],[P,zB],[tP,zB],[tP,zA],[0,zA]];
    k.planar("plaque",cote,[],(u,v) => [0,u,v]); k.planar("plaque",cote,[],(u,v) => [L,u,v]);
    // bloc avant et rainure
    const enc = [[L,P],[xSb,P],[xSb,yS],[xSa,yS],[xSa,P],[0,P]];
    k.planar("bloc",[[0,0],[L,0],...enc],[],(u,v) => [u,v,0]);
    k.planar("bloc",[[0,tP],[L,tP],...enc],[],(u,v) => [u,v,zB]);
    k.poly("bloc",[[0,P,0],[xSa,P,0],[xSa,P,zB],[0,P,zB]]); k.poly("bloc",[[xSb,P,0],[L,P,0],[L,P,zB],[xSb,P,zB]]);
    [xSa,xSb].forEach(x => k.poly("rain",[[x,yS,0],[x,P,0],[x,P,zB],[x,yS,zB]]));
    k.planar("rain",[[xSa,0],[xSb,0],[xSb,zB],[xSa,zB]],[cH],(u,v) => [u,yS,v]);
    // trou
    k.surf("trou",(u,v) => { const t = 2*Math.PI*v; return [xM+rH*Math.cos(t), u*yS, zH+rH*Math.sin(t)]; },1,40,{edges:[]});
  }
};
