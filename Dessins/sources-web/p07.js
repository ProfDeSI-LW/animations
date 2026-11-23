// 7. VÉ DE SERRAGE
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au coin arrière gauche du dessous.
return {
  side: "gauche",
  defaults: {Long:155, Prof:157, Haut:52, zBas:30, xGr:64, wVe:50, xVe:45, xDg:56, wDg:5, yRn:33.5, rRn:13, xRn:102},
  dims: [["Bloc",null],["Long","Longueur"],["Prof","Largeur"],["Haut","Hauteur"],["zBas","Hauteur côté vé"],["xGr","Position du gradin"],
         ["Vé",null],["wVe","Demi-ouverture"],["xVe","Profondeur du vé"],["xDg","Fond du dégagement"],["wDg","Demi-largeur du dégagement"],
         ["Rainures en U",null],["yRn","Écart des axes au milieu"],["rRn","Rayon"],["xRn","Centre de l’arrondi (x)"]],
  elements: [
    {id:"bloc", name:"Contour et gradin", info:"Partie basse côté vé, partie haute côté rainures"},
    {id:"ve",   name:"Vé et dégagement", info:"Vé à 90° ouvert sur la face gauche, dégagement au fond"},
    {id:"rain", name:"Deux rainures en U", info:"Ouvertes à droite, traversantes en hauteur"},
    {id:"rouge",name:"Arête du vé sur le dessus", info:"Face avant du vé ∩ dessus de la partie basse", color:"rouge"}],
  derive(p){
    const d = {...p, EcG:16.5, EcD:24, Deb:4, AmA:.53, AmB:.70};
    d.yM = p.Prof/2; d.XG = p.Long+d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.xDg >= d.xGr) w.push("Le vé doit rester dans la partie basse.");
    if (d.xRn-d.rRn <= d.xGr) w.push("Les rainures doivent rester dans la partie haute.");
    if (d.yRn-d.rRn <= 0 || d.yRn+d.rRn >= d.yM) w.push("Les rainures se chevauchent ou sortent de la pièce.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, Haut:H, zBas, xGr, wVe, xVe, xDg, wDg, yRn, rRn:r, xRn, yM, XG, EcD, Deb:deb} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], G = (y,z) => [XG+y,-z];
    const arc = (cx,cy,rr,a0,a1,map) => Array.from({length:19},(_,i) => { const t = (a0+(a1-a0)*i/18)*Math.PI/180; return map(cx+rr*Math.cos(t), cy+rr*Math.sin(t)); });
    const yc = [yM-yRn, yM+yRn];
    a.label([0,-H-deb-5],"Vue de face"); a.label([XG,-H-deb-5],"Vue de gauche"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face
    a.line("bloc",[F(0,0),F(L,0),F(L,H),F(xGr,H),F(xGr,zBas),F(0,zBas),F(0,0)]);
    a.line("ve",[F(xVe,0),F(xVe,zBas)],"cache",true); a.line("ve",[F(xDg,0),F(xDg,zBas)],"cache",true);
    a.line("rain",[F(xRn-r,0),F(xRn-r,H)],"cache",true); a.axe("rain",F(xRn,-deb),F(xRn,H+deb),true);
    // vue de dessus (avant en bas)
    a.line("bloc",[T(0,yM-wVe),T(0,0),T(L,0),T(L,yc[0]-r)]); a.line("bloc",[T(L,yc[0]+r),T(L,yc[1]-r)]);
    a.line("bloc",[T(L,yc[1]+r),T(L,P),T(0,P),T(0,yM+wVe)]);
    a.line("ve",[T(0,yM+wVe),T(xVe,yM+wDg),T(xDg,yM+wDg),T(xDg,yM-wDg),T(xVe,yM-wDg),T(0,yM-wVe)]);
    yc.forEach(y => { a.curve("rain",[T(L,y-r),...arc(xRn,y,r,270,90,T),T(L,y+r)]);
      a.axe("rain",T(xRn-r-deb,y),T(xRn+r+deb,y)); a.axe("rain",T(xRn,y-r-deb),T(xRn,y+r+deb)); });
    a.line("bloc",[T(xGr,0),T(xGr,P)],"vu",true);
    // vue de gauche (arrière à gauche)
    
    a.line("bloc",[G(yM-d.AmA*P/2,H),G(yM+d.AmA*P/2,H)],"fin","e");
    a.line("bloc",[G(yM-d.AmB*P/2,0),G(yM+d.AmB*P/2,0)],"fin","e");
    a.line("bloc",[G(0,0),G(P,0),G(P,H),G(0,H),G(0,0)],"vu",true);
    a.line("bloc",[G(0,zBas),G(P,zBas)],"vu",true);
    [yM-wVe,yM-wDg,yM+wDg,yM+wVe].forEach(y => a.line("ve",[G(y,0),G(y,zBas)],"vu",true));
    yc.forEach(y => { a.line("rain",[G(y-r,0),G(y-r,H)],"cache",true); a.line("rain",[G(y+r,0),G(y+r,H)],"cache",true);
      a.axe("rain",G(y,-deb),G(y,H+deb),true); });
    a.line("bloc",[[XG-6,EcD-6],[XG+P+6,EcD+P+6]],"fin");
    // arête repérée
    a.line("rouge",[F(0,zBas),F(xVe,zBas)],"vu",true); a.line("rouge",[T(0,yM+wVe),T(xVe,yM+wDg)],"vu",true);
    a.line("rouge",[G(yM+wDg,zBas),G(yM+wVe,zBas)],"vu",true);
    // traits de construction (R4)
    const fl = (el,xs,z,ye) => a.cons(el,[F(xs,z), G(cor?ye:P, z)]);
    const tl = (el,xs,y,ze) => a.cons(el,[T(xs,y), [XG+y,EcD+y], G(y, cor?ze:H)]);
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    fl("bloc",L,H,P); fl("bloc",xGr,zBas,P); fl("bloc",L,0,P); ft("bloc",xGr,H,P); ft("bloc",0,zBas,P); ft("bloc",L,0,P); tl("bloc",L,0,H); tl("bloc",L,P,H);
    [yM-wVe,yM+wVe].forEach(y => tl("ve",0,y,zBas)); [yM-wDg,yM+wDg].forEach(y => tl("ve",xVe,y,zBas));
    ft("ve",xVe,zBas,yM+wDg); ft("ve",xDg,zBas,yM+wDg);
    yc.forEach(y => { tl("rain",L,y-r,H); tl("rain",L,y+r,H); }); ft("rain",xRn-r,H,yc[1]);
    fl("rouge",0,zBas,yM+wVe); tl("rouge",0,yM+wVe,zBas);
  },
  solid(d, k){
    const {Long:L, Prof:P, Haut:H, zBas, xGr, wVe, xVe, xDg, wDg, yRn, rRn:r, xRn, yM} = d, rad = Math.PI/180;
    const yc = [yM-yRn, yM+yRn];
    // axes des rainures en U : axe du fond arrondi (croix vue d'au-dessus) et axe de symétrie du U
    yc.forEach(y => k.revol("rain",[xRn,y,-5],[xRn,y,H+5],r,[[xRn,y,H],[xRn,y,0]]));
    const ve = [[0,P],[0,yM+wVe],[xVe,yM+wDg],[xDg,yM+wDg],[xDg,yM-wDg],[xVe,yM-wDg],[0,yM-wVe],[0,0]];
    k.planar("bloc",[...[[0,0],[L,0]],...yc.flatMap(y => [[L,y-r],...k.arc(xRn,y,r,270,90,18),[L,y+r]]),[L,P],...ve],[],(u,v) => [u,v,0]);
    k.planar("bloc",[[xGr,0],[L,0],...yc.flatMap(y => [[L,y-r],...k.arc(xRn,y,r,270,90,18),[L,y+r]]),[L,P],[xGr,P]],[],(u,v) => [u,v,H]);
    k.planar("bloc",[[xGr,0],[xGr,P],...ve],[],(u,v) => [u,v,zBas]);
    k.planar("bloc",[[0,zBas],[P,zBas],[P,H],[0,H]],[],(u,v) => [xGr,u,v]);
    const profil = [[0,0],[L,0],[L,H],[xGr,H],[xGr,zBas],[0,zBas]];
    k.planar("bloc",profil,[],(u,v) => [u,0,v]); k.planar("bloc",profil,[],(u,v) => [u,P,v]);
    k.poly("bloc",[[0,0,0],[0,yM-wVe,0],[0,yM-wVe,zBas],[0,0,zBas]]);
    k.poly("bloc",[[0,yM+wVe,0],[0,P,0],[0,P,zBas],[0,yM+wVe,zBas]]);
    [[0,yc[0]-r],[yc[0]+r,yc[1]-r],[yc[1]+r,P]].forEach(([y0,y1]) => k.poly("bloc",[[L,y0,0],[L,y1,0],[L,y1,H],[L,y0,H]]));
    [-1,1].forEach(s => {
      k.poly("ve",[[0,yM+s*wVe,0],[xVe,yM+s*wDg,0],[xVe,yM+s*wDg,zBas],[0,yM+s*wVe,zBas]]);
      k.poly("ve",[[xVe,yM+s*wDg,0],[xDg,yM+s*wDg,0],[xDg,yM+s*wDg,zBas],[xVe,yM+s*wDg,zBas]]);
    });
    k.poly("ve",[[xDg,yM-wDg,0],[xDg,yM+wDg,0],[xDg,yM+wDg,zBas],[xDg,yM-wDg,zBas]]);
    yc.forEach(y => {
      // flancs : le raccord tangent avec le fond arrondi n'est pas une arête
      [-1,1].forEach(s => k.planar("rain",[[xRn,0],[L,0],[L,H],[xRn,H]],[],(u,v) => [u,y+s*r,v],
        {edges:[[[xRn,0],[L,0],[L,H],[xRn,H]]], tangent:[[[xRn,0],[xRn,H]]]}));
      k.surf("rain",(u,v) => { const t = (90+180*v)*rad; return [xRn+r*Math.cos(t), y+r*Math.sin(t), u*H]; },1,18,{edges:[]});
    });
    k.edge("rouge",[[0,yM+wVe,zBas],[xVe,yM+wDg,zBas]]);
  }
};
