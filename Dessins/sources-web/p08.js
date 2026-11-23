// 8. COULISSEAU
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au coin arrière gauche du dessous.
// Feuille : vue de droite à GAUCHE de la vue de face, vue de dessus en dessous.
return {
  side: "droite",
  defaults: {Long:142, Prof:90, Haut:167, yGr:38, zAr:91, yCo:66, xTa:25, xTb:110, xTc:125, wU:21, zU:136, xRa:36, xRb:102, yRa:13},
  dims: [["Bloc",null],["Long","Longueur"],["Prof","Profondeur (tenon compris)"],["Haut","Hauteur"],
         ["Gradin arrière",null],["yGr","Position du gradin"],["zAr","Hauteur de la partie arrière"],
         ["Tenon",null],["yCo","Face avant du corps"],["xTa","Flanc gauche"],["xTb","Flanc droit au pied"],["xTc","Flanc droit à l’avant"],
         ["Fente en U",null],["wU","Demi-largeur"],["zU","Hauteur du centre de l’arrondi"],
         ["Rainure arrière",null],["xRa","Flanc gauche"],["xRb","Flanc droit"],["yRa","Profondeur"]],
  elements: [
    {id:"bloc",  name:"Contour du coulisseau", info:"Rectangle capable des trois vues"},
    {id:"gradin",name:"Gradin arrière", info:"Partie arrière plus basse, caché de face"},
    {id:"tenon", name:"Tenon avant", info:"Un flanc droit, un flanc incliné en contre-dépouille"},
    {id:"fente", name:"Fente en U", info:"Ouverte en haut, traverse la partie avant"},
    {id:"rain",  name:"Rainure arrière", info:"Traverse la partie arrière de haut en bas"}],
  derive(p){
    const d = {...p, EcG:44, EcD:26, Deb:4};
    d.xM = p.Long/2; d.xUa = d.xM-p.wU; d.xUb = d.xM+p.wU; d.zUb = p.zU-p.wU; d.XD = -d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.zUb <= d.zAr) w.push("Le fond de la fente doit être au-dessus de la partie arrière.");
    if (d.xUa <= d.xTa || d.xUb >= d.xTb) w.push("La fente doit rester entre les flancs du tenon.");
    if (d.yGr >= d.yCo) w.push("Le gradin doit être derrière la face avant du corps.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, Haut:H, yGr, zAr, yCo, xTa, xTb, xTc, wU, zU, xRa, xRb, yRa, xM, xUa, xUb, zUb, XD, EcD, Deb:deb} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], D = (y,z) => [XD-y,-z];
    const arc = (cx,cy,rr,a0,a1,map) => Array.from({length:25},(_,i) => { const t = (a0+(a1-a0)*i/24)*Math.PI/180; return map(cx+rr*Math.cos(t), cy+rr*Math.sin(t)); });
    a.label([0,-H-deb-5],"Vue de face"); a.label([XD-P,-H-deb-5],"Vue de droite"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face
    a.line("bloc",[F(xUa,H),F(0,H),F(0,0),F(L,0),F(L,H),F(xUb,H)]);
    a.curve("fente",[F(xUb,H),F(xUb,zU),...arc(xM,zU,wU,0,-180,F),F(xUa,H)]);
    a.axe("fente",F(xM,zUb-deb),F(xM,zU+wU+deb)); a.axe("fente",F(xUa-deb,zU),F(xUb+deb,zU));
    a.line("tenon",[F(xTa,0),F(xTa,H)],"vu",true); a.line("tenon",[F(xTc,0),F(xTc,H)],"vu",true);
    a.line("tenon",[F(xTb,0),F(xTb,H)],"cache",true);
    a.line("rain",[F(xRa,0),F(xRa,zAr)],"cache",true); a.line("rain",[F(xRb,0),F(xRb,zAr)],"cache",true);
    a.line("gradin",[F(0,zAr),F(xRa,zAr)],"cache",true); a.line("gradin",[F(xRa,zAr),F(xRb,zAr)],"cache",true); a.line("gradin",[F(xRb,zAr),F(L,zAr)],"cache",true);
    // vue de droite (avant à gauche)
    a.line("bloc",[D(0,zAr),D(0,0),D(P,0),D(P,H),D(yGr,H)]);
    a.line("gradin",[D(yGr,H),D(yGr,zAr),D(0,zAr)]);
    a.line("tenon",[D(yCo,0),D(yCo,H)],"vu",true);
    a.line("fente",[D(yGr,zUb),D(P,zUb)],"cache",true); a.axe("fente",D(yGr-deb,zU),D(P+deb,zU),true);
    a.line("rain",[D(yRa,0),D(yRa,zAr)],"cache",true);
    // vue de dessus (avant en bas)
    a.line("bloc",[T(xRa,0),T(0,0),T(0,yCo),T(xTa,yCo)]); a.line("bloc",[T(xRb,0),T(L,0),T(L,yCo),T(xTb,yCo)]);
    a.line("rain",[T(xRa,0),T(xRa,yRa),T(xRb,yRa),T(xRb,0)]);
    a.line("tenon",[T(xTa,yCo),T(xTa,P),T(xTc,P),T(xTb,yCo)]);
    a.line("gradin",[T(0,yGr),T(L,yGr)],"vu",true);
    a.line("fente",[T(xUa,yGr),T(xUa,P)],"vu",true); a.line("fente",[T(xUb,yGr),T(xUb,P)],"vu",true);
    a.axe("fente",T(xM,yGr-deb),T(xM,P+deb),true);
    // renvois et droite à 45°
    a.line("bloc",[T(0,0),[XD,EcD]],"fin");
    a.line("bloc",[[XD+3,EcD-3],[XD-P-6,EcD+P+6]],"fin");
    // traits de construction (R4)
    const fd = (el,xs,z,ye) => a.cons(el,[F(xs,z), D(cor?ye:P, z)]);
    const td = (el,xs,y,ze) => a.cons(el,[T(xs,y), [XD-y,EcD+y], D(y, cor?ze:H)]);
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    fd("bloc",0,H,P); fd("bloc",0,0,P); ft("bloc",0,0,yCo); ft("bloc",L,0,yCo);
    fd("gradin",0,zAr,yGr); td("gradin",0,yGr,H); td("bloc",0,0,zAr);
    td("tenon",0,yCo,H); td("tenon",xTa,P,H); ft("tenon",xTa,0,P); ft("tenon",xTc,0,P); ft("tenon",xTb,0,yCo);
    fd("fente",xM,zUb,P); ft("fente",xUa,zU,P); ft("fente",xUb,zU,P);
    td("rain",xRa,yRa,zAr); ft("rain",xRa,0,yRa); ft("rain",xRb,0,yRa);
  },
  solid(d, k){
    const {Long:L, Prof:P, Haut:H, yGr, zAr, yCo, xTa, xTb, xTc, wU, zU, xRa, xRb, yRa, xM, xUa, xUb} = d, rad = Math.PI/180;
    // axes de la fente en U : axe du fond arrondi (croix vue de face) et axe de symétrie du U
    k.revol("fente",[xM,yGr-5,zU],[xM,P+5,zU],wU,[[xM,yGr,zU],[xM,P,zU]]);

    const contour = [[0,0],[xRa,0],[xRa,yRa],[xRb,yRa],[xRb,0],[L,0],[L,yCo],[xTb,yCo],[xTc,P],[xTa,P],[xTa,yCo],[0,yCo]];
    k.planar("bloc",contour,[],(u,v) => [u,v,0]);
    k.planar("gradin",[[0,0],[xRa,0],[xRa,yRa],[xRb,yRa],[xRb,0],[L,0],[L,yGr],[0,yGr]],[],(u,v) => [u,v,zAr]);
    const fenteXZ = [[xUb,H],[xUb,zU],...k.arc(xM,zU,wU,0,-180,24),[xUa,H]];
    k.planar("gradin",[[0,zAr],[L,zAr],[L,H],...fenteXZ,[0,H]],[],(u,v) => [u,yGr,v]);
    k.planar("bloc",[[0,yGr],[xUa,yGr],[xUa,P],[xTa,P],[xTa,yCo],[0,yCo]],[],(u,v) => [u,v,H]);
    k.planar("bloc",[[xUb,yGr],[L,yGr],[L,yCo],[xTb,yCo],[xTc,P],[xUb,P]],[],(u,v) => [u,v,H]);
    // flancs de la fente : raccord tangent avec le fond arrondi (pas d'arête)
    [xUa,xUb].forEach(x => k.planar("fente",[[yGr,zU],[P,zU],[P,H],[yGr,H]],[],(u,v) => [x,u,v],
      {edges:[[[yGr,zU],[yGr,H],[P,H],[P,zU]]], tangent:[[[yGr,zU],[P,zU]]]}));
    k.surf("fente",(u,v) => { const t = (180+180*v)*rad; return [xM+wU*Math.cos(t), yGr+u*(P-yGr), zU+wU*Math.sin(t)]; },1,24,{edges:[]});
    const cote = [[0,0],[yCo,0],[yCo,H],[yGr,H],[yGr,zAr],[0,zAr]];
    k.planar("bloc",cote,[],(u,v) => [0,u,v]); k.planar("bloc",cote,[],(u,v) => [L,u,v]);
    k.poly("bloc",[[0,0,0],[xRa,0,0],[xRa,0,zAr],[0,0,zAr]]); k.poly("bloc",[[xRb,0,0],[L,0,0],[L,0,zAr],[xRb,0,zAr]]);
    [xRa,xRb].forEach(x => k.poly("rain",[[x,0,0],[x,yRa,0],[x,yRa,zAr],[x,0,zAr]]));
    k.poly("rain",[[xRa,yRa,0],[xRb,yRa,0],[xRb,yRa,zAr],[xRa,yRa,zAr]]);
    k.poly("bloc",[[0,yCo,0],[xTa,yCo,0],[xTa,yCo,H],[0,yCo,H]]); k.poly("bloc",[[xTb,yCo,0],[L,yCo,0],[L,yCo,H],[xTb,yCo,H]]);
    k.poly("tenon",[[xTa,yCo,0],[xTa,P,0],[xTa,P,H],[xTa,yCo,H]]);
    k.poly("tenon",[[xTb,yCo,0],[xTc,P,0],[xTc,P,H],[xTb,yCo,H]]);
    k.planar("tenon",[[xTa,0],[xTc,0],[xTc,H],...fenteXZ,[xTa,H]],[],(u,v) => [u,P,v]);
  }
};
