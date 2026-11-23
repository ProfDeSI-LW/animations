// 2. ÉQUERRE À CHAPEAU
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au coin arrière gauche du dessous du chapeau.
// Feuille : vue de gauche à DROITE de la vue de face, vue de dessus en dessous.
return {
  side: "gauche",
  defaults: {Long:78, Haut:104, Pc:33, hC:6.5, Ep:15, xBr:51, zBa:32.5},
  dims: [["Équerre",null],["Long","Longueur"],["Haut","Hauteur totale"],["Ep","Épaisseur"],["xBr","Face intérieure du montant"],["zBa","Dessus de la branche"],
         ["Chapeau",null],["Pc","Largeur du chapeau"],["hC","Épaisseur du chapeau"]],
  elements: [
    {id:"eq",   name:"Équerre", info:"Profil en L, centré sur le chapeau"},
    {id:"chap", name:"Chapeau", info:"Semelle plus large que l’équerre, sur toute la longueur"},
    {id:"rouge",name:"Angle intérieur de l’équerre", info:"Montant ∩ dessus de la branche", color:"rouge"},
    {id:"bleu", name:"Pied de la face avant", info:"Face avant de l’équerre ∩ dessus du chapeau", color:"bleu"}],
  derive(p){
    const d = {...p, EcG:28, EcD:12, Deb:4, AmA:.55, AmB:.35};
    d.yA = (p.Pc-p.Ep)/2; d.yB = d.yA+p.Ep; d.XG = p.Long+d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.Ep >= d.Pc) w.push("L’équerre doit être moins épaisse que le chapeau.");
    if (d.zBa <= d.hC || d.zBa >= d.Haut) w.push("Le dessus de la branche doit être entre le chapeau et le haut.");
    if (d.xBr <= 0 || d.xBr >= d.Long) w.push("Le montant doit rester dans la longueur.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Haut:H, Pc, hC, xBr, zBa, yA, yB, XG, EcD, AmA, AmB} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], G = (y,z) => [XG+y,-z];
    a.label([0,-H-9],"Vue de face"); a.label([XG,-H-9],"Vue de gauche"); a.label([0,EcD+Pc+9],"Vue de dessus");
    // vue de face
    a.line("chap",[F(0,hC),F(0,0),F(L,0),F(L,hC)]);
    a.line("eq",[F(0,hC),F(0,zBa),F(xBr,zBa),F(xBr,H),F(L,H),F(L,hC)]);
    a.line("chap",[F(0,hC),F(L,hC)],"vu",true); a.line("bleu",[F(0,hC),F(L,hC)],"vu",true);
    a.dot("rouge",F(xBr,zBa));
    // vue de gauche
    a.line("chap",[G(yA,hC),G(0,hC),G(0,0),G(Pc,0),G(Pc,hC),G(yB,hC)]);
    a.line("eq",[G(yA,hC),G(yA,H),G(yB,H),G(yB,hC)]);
    a.line("eq",[G(yA,zBa),G(yB,zBa)],"vu",true); a.line("rouge",[G(yA,zBa),G(yB,zBa)],"vu",true);
    a.dot("bleu",G(yB,hC));
    // vue de dessus
    a.line("chap",[T(0,AmA*Pc),T(0,0),T(L,0),T(L,AmB*Pc)],"vu","e");
    a.line("chap",[T(0,0),T(L,0),T(L,Pc),T(0,Pc),T(0,0)],"vu",true);
    a.line("eq",[T(0,yA),T(L,yA)],"vu",true); a.line("eq",[T(0,yB),T(L,yB)],"vu",true); a.line("eq",[T(xBr,yA),T(xBr,yB)],"vu",true);
    a.line("bleu",[T(0,yB),T(L,yB)],"vu",true); a.line("rouge",[T(xBr,yA),T(xBr,yB)],"vu",true);
    // renvois et droite à 45°
    a.line("chap",[[XG,0],[XG,EcD]],"fin"); a.line("chap",[T(L,0),[XG,EcD]],"fin");
    a.line("chap",[[XG-2,EcD-2],[XG+Pc+6,EcD+Pc+6]],"fin");
    // traits de construction (R4)
    const fg = (el,z,ye) => a.cons(el,[F(L,z), G(cor?ye:Pc, z)]);
    const tg = (el,y,ze) => a.cons(el,[T(L,y), [XG+y,EcD+y], G(y, cor?ze:H)]);
    const ft = (el,x,zs) => a.cons(el,[F(x,zs), T(x, Pc)]);
    fg("eq",H,yA); fg("eq",zBa,yA); fg("rouge",zBa,yA); fg("chap",hC,0); fg("bleu",hC,yB);
    tg("eq",yA,H); tg("eq",yB,H); tg("chap",Pc,hC); tg("chap",0,hC); fg("chap",0,0); tg("bleu",yB,hC);
    ft("eq",xBr,zBa); ft("rouge",xBr,zBa); ft("chap",0,0); ft("chap",L,0);
  },
  solid(d, k){
    const {Long:L, Haut:H, Pc, hC, xBr, zBa, yA, yB} = d;
    // chapeau
    k.poly("chap",[[0,0,0],[L,0,0],[L,Pc,0],[0,Pc,0]]);
    // dessus : pas d'arête sur les bouts entre yA et yB (bout de l'équerre dans le même plan)
    k.planar("chap",[[0,0],[L,0],[L,Pc],[0,Pc]],[],(u,v) => [u,v,hC],
      {edges:[[[0,yA],[0,0],[L,0],[L,yA]],[[L,yB],[L,Pc],[0,Pc],[0,yB]]]});
    [0,Pc].forEach(y => k.poly("chap",[[0,y,0],[L,y,0],[L,y,hC],[0,y,hC]]));
    // bouts du chapeau : l'équerre les prolonge dans le même plan (pas d'arête sur yA..yB)
    [0,L].forEach(x => k.planar("chap",[[0,0],[Pc,0],[Pc,hC],[0,hC]],[],(u,v) => [x,u,v],
      {edges:[[[yA,hC],[0,hC],[0,0],[Pc,0],[Pc,hC],[yB,hC]]]}));
    // équerre
    const prof = [[0,hC],[L,hC],[L,H],[xBr,H],[xBr,zBa],[0,zBa]];
    k.planar("eq",prof,[],(u,v) => [u,yA,v]); k.planar("eq",prof,[],(u,v) => [u,yB,v]);
    prof.forEach((p0,i) => { if (i === 0) return; const p1 = prof[(i+1)%prof.length];
      const z0 = Math.min(p0[1],p1[1]), z1 = Math.max(p0[1],p1[1]);
      if (p0[0] === p1[0] && (p0[0] === 0 || p0[0] === L) && z0 === hC)   // bout de l'équerre dans le plan du bout du chapeau
        k.planar("eq",[[yA,z0],[yB,z0],[yB,z1],[yA,z1]],[],(u,v) => [p0[0],u,v],{edges:[[[yA,z0],[yA,z1],[yB,z1],[yB,z0]]]});
      else k.poly("eq",[[p0[0],yA,p0[1]],[p1[0],yA,p1[1]],[p1[0],yB,p1[1]],[p0[0],yB,p0[1]]]); });
    k.edge("rouge",[[xBr,yA,zBa],[xBr,yB,zBa]]);
    k.edge("bleu",[[0,yB,hC],[L,yB,hC]]);
  }
};
