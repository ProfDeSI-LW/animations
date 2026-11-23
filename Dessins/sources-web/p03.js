// 3. BRIDE OUVERTE À NEZ « NORELEM »
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au coin arrière gauche du dessous (nez à gauche).
// Feuille : vue de gauche à DROITE de la vue de face, vue de dessus en dessous.
return {
  side: "gauche",
  defaults: {Long:132, Prof:47, Haut:40, xC:22, zC:18, xN:32, wN:25, xT:43, xS:65, rS:11},
  dims: [["Bride",null],["Long","Longueur"],["Prof","Largeur"],["Haut","Épaisseur"],
         ["Nez",null],["xN","Longueur du nez"],["wN","Largeur du nez"],["xT","Fin des pans à 45°"],["xC","Chanfrein : fin sur le dessus"],["zC","Chanfrein : départ sur le bout"],
         ["Fente",null],["xS","Centre de l’arrondi"],["rS","Demi-largeur"]],
  elements: [
    {id:"bloc", name:"Contour de la bride", info:"Partie large à droite"},
    {id:"nez",  name:"Nez et pans à 45°", info:"Le nez est plus étroit, raccordé par deux pans verticaux"},
    {id:"chf",  name:"Chanfrein du nez", info:"Face inclinée au bout du nez"},
    {id:"fente",name:"Fente oblongue", info:"Ouverte à droite, traversante"},
    {id:"rouge",name:"Chanfrein ∩ flanc avant du nez", info:"Arête inclinée", color:"rouge"},
    {id:"bleu", name:"Chanfrein ∩ dessus", info:"Arête horizontale", color:"bleu"}],
  derive(p){
    const d = {...p, EcG:23, EcD:13, Deb:4, AmH:.77, AmP:.44};
    d.yM = p.Prof/2; d.yNa = d.yM-p.wN/2; d.yNb = d.yM+p.wN/2; d.ySa = d.yM-p.rS; d.ySb = d.yM+p.rS; d.XG = p.Long+d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.xC >= d.xN) w.push("Le chanfrein doit rester sur le nez.");
    if (d.xN >= d.xT) w.push("Les pans doivent commencer après le nez.");
    if (d.xS-d.rS <= d.xT) w.push("La fente mord sur les pans.");
    if (d.wN >= d.Prof || 2*d.rS >= d.Prof) w.push("Le nez ou la fente est trop large.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, Haut:H, xC, zC, xN, xT, xS, rS, yM, yNa, yNb, ySa, ySb, XG, EcD, Deb:deb, AmH, AmP} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], G = (y,z) => [XG+y,-z];
    const arc = (cx,cy,rr,a0,a1,map) => Array.from({length:25},(_,i) => { const t = (a0+(a1-a0)*i/24)*Math.PI/180; return map(cx+rr*Math.cos(t), cy+rr*Math.sin(t)); });
    a.label([0,-H-9],"Vue de face"); a.label([XG,-H-9],"Vue de gauche"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face
    a.line("bloc",[F(xC,H),F(L,H),F(L,0),F(0,0),F(0,zC)]);
    a.line("chf",[F(0,zC),F(xC,H)]);
    a.line("nez",[F(xN,0),F(xN,H)],"vu",true); a.line("nez",[F(xT,0),F(xT,H)],"vu",true);
    a.line("fente",[F(xS-rS,0),F(xS-rS,H)],"cache",true); a.axe("fente",F(xS,-deb),F(xS,H+deb),true);
    a.line("rouge",[F(0,zC),F(xC,H)],"vu",true); a.dot("bleu",F(xC,H));
    // vue de dessus (avant en bas)
    a.line("nez",[T(0,yNb),T(0,yNa),T(xN,yNa),T(xT,0)]); a.line("nez",[T(xT,P),T(xN,yNb),T(0,yNb)]);
    a.line("bloc",[T(xT,0),T(L,0),T(L,ySa)]); a.line("bloc",[T(L,ySb),T(L,P),T(xT,P)]);
    a.curve("fente",[T(L,ySa),T(xS,ySa),...arc(xS,yM,rS,270,90,T),T(L,ySb)]);
    a.axe("fente",T(xS-rS-deb,yM),T(xS+rS+deb,yM)); a.axe("fente",T(xS,ySa-deb),T(xS,ySb+deb));   // croix d'axes du fond arrondi
    a.line("chf",[T(xC,yNa),T(xC,yNb)],"vu",true);
    a.line("bleu",[T(xC,yNa),T(xC,yNb)],"vu",true); a.line("rouge",[T(0,yNb),T(xC,yNb)],"vu",true);
    // vue de gauche (arrière à gauche)
    a.line("bloc",[G(0,AmH*H),G(0,0),G(AmP*P,0)],"vu","e");
    a.line("bloc",[G(0,0),G(P,0),G(P,H),G(0,H),G(0,0)],"vu",true);
    a.line("nez",[G(yNa,0),G(yNa,H)],"vu",true); a.line("nez",[G(yNb,0),G(yNb,H)],"vu",true);
    a.line("chf",[G(yNa,zC),G(yNb,zC)],"vu",true);
    a.line("fente",[G(ySa,0),G(ySa,H)],"cache",true); a.line("fente",[G(ySb,0),G(ySb,H)],"cache",true);
    a.axe("fente",G(yM,-deb),G(yM,H+deb),true);
    a.line("rouge",[G(yNb,zC),G(yNb,H)],"vu",true); a.line("bleu",[G(yNa,H),G(yNb,H)],"vu",true);
    // renvois et droite à 45°
    a.line("bloc",[[XG,0],[XG,EcD]],"fin"); a.line("bloc",[T(L,0),[XG,EcD]],"fin");
    a.line("bloc",[[XG-2,EcD-2],[XG+P+3,EcD+P+3]],"fin");
    // traits de construction (R4)
    const fg = (el,z,ye,xs=L) => a.cons(el,[F(xs,z), G(cor?ye:P, z)]);
    const tg = (el,y,ze,xs=L) => a.cons(el,[T(xs,y), [XG+y,EcD+y], G(y, cor?ze:H)]);   // xs : départ sur l'élément
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    fg("bloc",H,0); fg("bloc",0,0); fg("chf",zC,yNa,0);
    tg("nez",yNa,H,xN); tg("nez",yNb,H,xN); tg("fente",ySa,H); tg("fente",ySb,H); tg("bloc",P,H);
    ft("chf",xC,H,yNb); ft("bleu",xC,H,yNb); ft("nez",xN,0,yNb); ft("bloc",L,0,0); tg("bloc",0,H); ft("nez",xT,0,P); ft("fente",xS-rS,0,yM);
    fg("rouge",zC,yNb,0); tg("rouge",yNb,H,xC);
  },
  solid(d, k){
    const {Long:L, Prof:P, Haut:H, xC, zC, xN, xT, xS, rS, yM, yNa, yNb, ySa, ySb} = d, rad = Math.PI/180;
    k.revol("fente",[xS,yM,-5],[xS,yM,H+5],rS,[[xS,yM,H],[xS,yM,0]]);    // axes de la fente
    const arcS = k.arc(xS,yM,rS,270,90,24);
    const fente = [[L,ySa],[xS,ySa],...arcS,[L,ySb]];
    const dessus = x0 => [[x0,yNa],[xN,yNa],[xT,0],[L,0],[L,ySa],...fente.slice(1,-1),[L,ySb],[L,P],[xT,P],[xN,yNb],[x0,yNb]];
    k.planar("bloc",dessus(xC),[],(u,v) => [u,v,H]); k.planar("bloc",dessus(0),[],(u,v) => [u,v,0]);
    k.poly("nez",[[0,yNa,0],[0,yNb,0],[0,yNb,zC],[0,yNa,zC]]);
    k.poly("chf",[[0,yNa,zC],[xC,yNa,H],[xC,yNb,H],[0,yNb,zC]]);
    const flanc = [[0,0],[xN,0],[xN,H],[xC,H],[0,zC]];
    k.planar("nez",flanc,[],(u,v) => [u,yNa,v]); k.planar("nez",flanc,[],(u,v) => [u,yNb,v]);
    k.poly("nez",[[xN,yNa,0],[xT,0,0],[xT,0,H],[xN,yNa,H]]); k.poly("nez",[[xN,yNb,0],[xT,P,0],[xT,P,H],[xN,yNb,H]]);
    [0,P].forEach(y => k.poly("bloc",[[xT,y,0],[L,y,0],[L,y,H],[xT,y,H]]));
    k.poly("bloc",[[L,0,0],[L,ySa,0],[L,ySa,H],[L,0,H]]); k.poly("bloc",[[L,ySb,0],[L,P,0],[L,P,H],[L,ySb,H]]);
    [ySa,ySb].forEach(y => k.planar("fente",[[xS,0],[L,0],[L,H],[xS,H]],[],(u,v) => [u,y,v],
      {edges:[[[xS,0],[L,0],[L,H],[xS,H]]], tangent:[[[xS,0],[xS,H]]]}));
    k.surf("fente",(u,v) => { const t = (90+180*v)*rad; return [xS+rS*Math.cos(t), yM+rS*Math.sin(t), u*H]; },1,24,{edges:[]});
    k.edge("rouge",[[0,yNb,zC],[xC,yNb,H]]); k.edge("bleu",[[xC,yNa,H],[xC,yNb,H]]);
  }
};
