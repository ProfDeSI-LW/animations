// 4. BUTÉE RÉGLABLE
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au pied de la face gauche du montant (tenon en x < 0).
// Feuille : vue de droite à GAUCHE de la vue de face, vue de dessus en dessous.
return {
  side: "droite",
  defaults: {Long:45, Prof:35, Haut:53, xU:18, zB:18, xCh:27, wE:8, tT:4, zTa:26, zTb:44, zH:35, dH:14},
  dims: [["Butée",null],["Long","Longueur"],["Prof","Profondeur"],["Haut","Hauteur du montant"],["xU","Épaisseur du montant"],["zB","Épaisseur de la semelle"],
         ["Bout pointu",null],["xCh","Début des pans"],["wE","Largeur du méplat"],
         ["Tenon",null],["tT","Saillie"],["zTa","Dessous"],["zTb","Dessus"],
         ["Trou",null],["zH","Hauteur de l’axe"],["dH","Diamètre"]],
  elements: [
    {id:"bloc", name:"Montant et semelle", info:"Profil en L"},
    {id:"bout", name:"Bout pointu", info:"Deux pans verticaux et un méplat"},
    {id:"tenon",name:"Tenon", info:"Sur toute la profondeur, contre la face gauche du montant"},
    {id:"trou", name:"Trou", info:"Traverse le tenon et le montant"},
    {id:"rouge",name:"Face avant ∩ pan avant", info:"Arête verticale", color:"rouge"},
    {id:"bleu", name:"Pied du montant", info:"Montant ∩ dessus de la semelle", color:"bleu"}],
  derive(p){
    const d = {...p, EcG:10.5, EcD:13, Deb:4};
    d.yM = p.Prof/2; d.yEa = d.yM-p.wE/2; d.yEb = d.yM+p.wE/2; d.rH = p.dH/2; d.XD = -p.tT-d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.xU >= d.xCh || d.xCh >= d.Long) w.push("Les pans doivent commencer entre le montant et le bout.");
    if (d.zH-d.rH <= d.zB || d.zH+d.rH >= d.Haut) w.push("Le trou sort du montant.");
    if (d.zTa >= d.zTb) w.push("Le dessous du tenon doit être sous son dessus.");
    if (d.wE >= d.Prof) w.push("Le méplat est plus large que la pièce.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, Haut:H, xU, zB, xCh, tT, zTa, zTb, zH, rH, yM, yEa, yEb, XD, EcD, Deb:deb} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], D = (y,z) => [XD-y,-z];
    a.label([-tT,-H-9],"Vue de face"); a.label([XD-P,-H-9],"Vue de droite"); a.label([-tT,EcD+P+9],"Vue de dessus");
    // vue de face
    a.line("tenon",[F(0,zTa),F(-tT,zTa),F(-tT,zTb),F(0,zTb)]);
    a.line("bloc",[F(0,zTb),F(0,H),F(xU,H),F(xU,zB),F(xCh,zB)]); a.line("bloc",[F(0,zTa),F(0,0),F(xCh,0)]);
    a.line("bout",[F(xCh,0),F(L,0),F(L,zB),F(xCh,zB)]);
    a.axe("trou",F(-tT-deb,zH),F(xU+deb,zH));
    a.line("bout",[F(xCh,0),F(xCh,zB)],"vu",true); a.line("rouge",[F(xCh,0),F(xCh,zB)],"vu",true);
    [-1,1].forEach(s => a.line("trou",[F(-tT,zH+s*rH),F(xU,zH+s*rH)],"cache",true));
    a.dot("bleu",F(xU,zB));
    // vue de dessus (avant en bas)
    a.line("bloc",[T(xCh,0),T(-tT,0),T(-tT,P),T(xCh,P)]);
    a.line("bout",[T(xCh,0),T(L,yEa),T(L,yEb),T(xCh,P)]);
    a.axe("trou",T(-tT-deb,yM),T(xU+deb,yM));
    a.line("tenon",[T(0,0),T(0,P)],"vu",true); a.line("bloc",[T(xU,0),T(xU,P)],"vu",true);
    [-1,1].forEach(s => a.line("trou",[T(-tT,yM+s*rH),T(xU,yM+s*rH)],"cache",true));
    a.line("bleu",[T(xU,0),T(xU,P)],"vu",true); a.dot("rouge",T(xCh,P));
    // vue de droite (avant à gauche)
    a.circle("trou",D(yM,zH),rH);
    a.axe("trou",D(yM-rH-deb,zH),D(yM+rH+deb,zH)); a.axe("trou",D(yM,zH-rH-deb),D(yM,zH+rH+deb));
    a.line("bloc",[D(0,0),D(P,0),D(P,H),D(0,H),D(0,0)],"vu",true);
    a.line("bloc",[D(0,zB),D(P,zB)],"vu",true);
    a.line("bout",[D(yEa,0),D(yEa,zB)],"vu",true); a.line("bout",[D(yEb,0),D(yEb,zB)],"vu",true);
    a.line("tenon",[D(0,zTa),D(P,zTa)],"cache",true); a.line("tenon",[D(0,zTb),D(P,zTb)],"cache",true);
    a.line("rouge",[D(P,0),D(P,zB)],"vu",true); a.line("bleu",[D(0,zB),D(P,zB)],"vu",true);
    // renvois et droite à 45° (corrigé)
    a.line("bloc",[[XD,0],[XD,EcD]],"fin",true); a.line("bloc",[T(-tT,0),[XD,EcD]],"fin",true);
    a.line("bloc",[[XD+2,EcD-2],[XD-P-3,EcD+P+3]],"fin",true);
    // traits de construction (R4)
    // départ sur le contour gauche de la vue de face : bout du tenon, ou face du montant
    const fd = (el,z,ye,xs) => a.cons(el,[F(xs !== undefined ? xs : z >= zTa-1e-9 && z <= zTb+1e-9 ? -tT : 0, z), D(cor?ye:P, z)]);
    const td = (el,y,ze,xs=-tT) => a.cons(el,[T(xs,y), [XD-y,EcD+y], D(y, cor?ze:H)]);
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    fd("bloc",H,P); fd("bloc",zB,P,xU); fd("bleu",zB,P,xU); fd("tenon",zTa,0); fd("tenon",zTb,0);
    td("bout",yEa,zB,L); td("bout",yEb,zB,L); td("bloc",P,H); td("rouge",P,zB,xCh);
    fd("bloc",0,P); td("bloc",0,H); [-1,1].forEach(s => { fd("trou",zH+s*rH,yM); td("trou",yM+s*rH,zH); }); ft("bout",L,0,yEa);
    ft("tenon",0,zTa,P); ft("bloc",xU,zB,P); ft("bleu",xU,zB,P); ft("bout",xCh,0,P); ft("rouge",xCh,0,P);
  },
  solid(d, k){
    const {Long:L, Prof:P, Haut:H, xU, zB, xCh, tT, zTa, zTb, zH, rH, yM, yEa, yEb} = d;
    const croix = (el,c,u,v,l) => [u,v].forEach(w => k.axe(el, c.map((q,i) => q-l*w[i]), c.map((q,i) => q+l*w[i])));   // croix d'axes devant un trou
    k.revol("trou",[-tT-5,yM,zH],[xU+5,yM,zH],rH,[[-tT,yM,zH],[xU,yM,zH]]);   // axes
    const cH = k.arc(yM,zH,rH,0,360,40);
    // trou
    k.surf("trou",(u,v) => { const t = 2*Math.PI*v; return [-tT+u*(xU+tT), yM+rH*Math.cos(t), zH+rH*Math.sin(t)]; },1,40,{edges:[]});
    // tenon
    k.planar("tenon",[[0,zTa],[P,zTa],[P,zTb],[0,zTb]],[cH],(u,v) => [-tT,u,v]);
    k.poly("tenon",[[-tT,0,zTb],[0,0,zTb],[0,P,zTb],[-tT,P,zTb]]); k.poly("tenon",[[-tT,0,zTa],[0,0,zTa],[0,P,zTa],[-tT,P,zTa]]);
    // montant et semelle
    k.poly("bloc",[[0,0,0],[0,P,0],[0,P,zTa],[0,0,zTa]]); k.poly("bloc",[[0,0,zTb],[0,P,zTb],[0,P,H],[0,0,H]]);
    k.planar("bloc",[[0,zB],[P,zB],[P,H],[0,H]],[cH],(u,v) => [xU,u,v]);
    k.poly("bloc",[[0,0,H],[xU,0,H],[xU,P,H],[0,P,H]]);
    // faces avant et arrière d'un seul tenant (tenon compris : faces coplanaires, pas d'arête)
    const prof = [[-tT,zTa],[0,zTa],[0,0],[xCh,0],[xCh,zB],[xU,zB],[xU,H],[0,H],[0,zTb],[-tT,zTb]];
    k.planar("bloc",prof,[],(u,v) => [u,0,v]); k.planar("bloc",prof,[],(u,v) => [u,P,v]);
    const sem = [[xU,0],[xCh,0],[L,yEa],[L,yEb],[xCh,P],[xU,P]];
    k.planar("bloc",sem,[],(u,v) => [u,v,zB]);
    k.planar("bloc",[[0,0],[xCh,0],[L,yEa],[L,yEb],[xCh,P],[0,P]],[],(u,v) => [u,v,0]);
    k.poly("bout",[[xCh,0,0],[L,yEa,0],[L,yEa,zB],[xCh,0,zB]]); k.poly("bout",[[xCh,P,0],[L,yEb,0],[L,yEb,zB],[xCh,P,zB]]);
    k.poly("bout",[[L,yEa,0],[L,yEb,0],[L,yEb,zB],[L,yEa,zB]]);
    k.edge("rouge",[[xCh,P,0],[xCh,P,zB]]); k.edge("bleu",[[xU,0,zB],[xU,P,zB]]);
  }
};
