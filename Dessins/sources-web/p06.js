// 6. BRIDE DE SERRAGE
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine sous le talon, à l'arrière gauche.
// Feuille : vue de droite à GAUCHE de la vue de face, vue de dessus en dessous.
return {
  side: "droite",
  defaults: {Long:180, Prof:100, Haut:80, zBr:20, xTa:38, Rcg:20, Ch:45, xBi:115, yBi:20, xLa:75, xLb:138, rLu:16},
  dims: [["Bloc",null],["Long","Longueur"],["Prof","Largeur"],["Haut","Hauteur"],
         ["Talon",null],["zBr","Hauteur du talon"],["xTa","Longueur du talon"],["Rcg","Rayon du congé"],["Ch","Chanfrein 45°"],
         ["Bout du bras",null],["xBi","Début des biseaux"],["yBi","Retrait des biseaux"],
         ["Lumière",null],["xLa","Centre gauche (x)"],["xLb","Centre droit (x)"],["rLu","Rayon"]],
  elements: [
    {id:"bloc", name:"Contour de la bride", info:"Rectangle capable des trois vues"},
    {id:"talon",name:"Talon et congé", info:"Le congé se raccorde tangentiellement au dessous du bras"},
    {id:"chanf",name:"Chanfrein 45°", info:"Au-dessus du talon, vu de face en vraie grandeur"},
    {id:"bis",  name:"Biseaux du bout", info:"Deux faces verticales inclinées, vues de dessus"},
    {id:"lum",  name:"Lumière oblongue", info:"Traversante, cachée de face et de droite"},
    {id:"rouge",name:"Arête face avant ∩ biseau", info:"Droite verticale", color:"rouge"}],
  derive(p){
    const d = {...p, EcG:25, EcD:26, Deb:4, AmH:.69, AmP:.74};
    d.zCh = p.Haut-p.Ch; d.xCg = p.xTa+p.Rcg; d.yLu = p.Prof/2; d.XD = -d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.Rcg > d.zBr) w.push("Le congé ne peut pas dépasser la hauteur du talon.");
    if (d.xLa-d.rLu <= d.xCg) w.push("La lumière doit commencer après le congé.");
    if (d.xLb+d.rLu >= d.xBi) w.push("La lumière mord sur les biseaux.");
    if (2*d.rLu >= d.Prof-2*d.yBi) w.push("La lumière est plus large que le bout du bras.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, Haut:H, zBr, xTa, Rcg:R, Ch, xBi, yBi, xLa, xLb, rLu:r, zCh, xCg, yLu, XD, EcD, Deb:deb} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], D = (y,z) => [XD-y,-z];
    const arc = (cx,cy,rr,a0,a1,map) => Array.from({length:25},(_,i) => { const t = (a0+(a1-a0)*i/24)*Math.PI/180; return map(cx+rr*Math.cos(t), cy+rr*Math.sin(t)); });
    a.label([0,-H-deb-5],"Vue de face"); a.label([XD-P,-H-deb-5],"Vue de droite"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face
    a.line("bloc",[F(0,zCh),F(0,0),F(xTa,0)]);
    a.curve("talon",arc(xCg,0,R,180,90,F));
    a.line("bloc",[F(xCg,zBr),F(L,zBr),F(L,H),F(Ch,H)]);
    a.line("chanf",[F(Ch,H),F(0,zCh)]);
    a.line("bis",[F(xBi,zBr),F(xBi,H)],"vu",true);
    a.line("lum",[F(xLa-r,zBr),F(xLa-r,H)],"cache",true); a.line("lum",[F(xLb+r,zBr),F(xLb+r,H)],"cache",true);
    a.axe("lum",F(xLa,zBr-deb),F(xLa,H+deb),true); a.axe("lum",F(xLb,zBr-deb),F(xLb,H+deb),true);
    // vue de dessus
    a.line("bloc",[T(xBi,0),T(0,0),T(0,P),T(xBi,P)]);
    a.line("bis",[T(xBi,0),T(L,yBi),T(L,P-yBi),T(xBi,P)]);
    a.curve("lum",[T(xLa,yLu-r),...arc(xLb,yLu,r,-90,90,T),...arc(xLa,yLu,r,90,270,T)]);
    a.axe("lum",T(xLa-r-deb,yLu),T(xLb+r+deb,yLu)); a.axe("lum",T(xLa,yLu-r-deb),T(xLa,yLu+r+deb)); a.axe("lum",T(xLb,yLu-r-deb),T(xLb,yLu+r+deb));
    a.line("chanf",[T(Ch,0),T(Ch,P)],"vu",true);
    a.line("talon",[T(xTa,0),T(xTa,P)],"cache",true);
    // vue de droite (avant à gauche)
    a.line("bloc",[D(0,d.AmH*H),D(0,0),D(d.AmP*P,0)],"fin","e");
    a.line("bloc",[D(0,0),D(P,0),D(P,H),D(0,H),D(0,0)],"vu",true);
    a.line("talon",[D(0,zBr),D(P,zBr)],"vu",true);
    a.line("bis",[D(yBi,zBr),D(yBi,H)],"vu",true); a.line("bis",[D(P-yBi,zBr),D(P-yBi,H)],"vu",true);
    a.line("chanf",[D(0,zCh),D(P,zCh)],"cache",true);
    a.line("lum",[D(yLu-r,zBr),D(yLu-r,H)],"cache",true); a.line("lum",[D(yLu+r,zBr),D(yLu+r,H)],"cache",true);
    a.axe("lum",D(yLu,zBr-deb),D(yLu,H+deb),true);
    // renvois et droite à 45°
    a.line("bloc",[[XD,0],[XD,EcD]],"fin"); a.line("bloc",[T(0,0),[XD,EcD]],"fin");
    a.line("bloc",[[XD+3,EcD-3],[XD-P-4,EcD+P+4]],"fin");
    // arête repérée
    a.line("rouge",[F(xBi,zBr),F(xBi,H)],"vu",true); a.dot("rouge",T(xBi,P)); a.line("rouge",[D(P,zBr),D(P,H)],"vu",true);
    // traits de construction (R4)
    const fd = (el,xs,z,ye) => a.cons(el,[F(xs,z), D(cor?ye:P, z)]);
    const td = (el,xs,y,ze) => a.cons(el,[T(xs,y), [XD-y,EcD+y], D(y, cor?ze:H)]);
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    fd("bloc",Ch,H,P); fd("bloc",0,0,P); ft("bloc",0,0,P); ft("bloc",L,zBr,P-yBi);
    fd("chanf",0,zCh,P); ft("chanf",Ch,H,P);
    fd("talon",xCg,zBr,P); ft("talon",xTa,0,P);
    td("bis",L,yBi,H); td("bis",L,P-yBi,H); td("bloc",Ch,0,H); td("bloc",Ch,P,H); ft("bis",xBi,zBr,P);
    td("lum",xLa,yLu-r,H); td("lum",xLa,yLu+r,H); ft("lum",xLa-r,zBr,yLu); ft("lum",xLb+r,zBr,yLu);
    ft("rouge",xBi,zBr,P); fd("rouge",xBi,H,P);
  },
  solid(d, k){
    const {Long:L, Prof:P, Haut:H, zBr, xTa, Rcg:R, Ch, xBi, yBi, xLa, xLb, rLu:r, zCh, xCg, yLu} = d, rad = Math.PI/180;
    // axes de la lumière : axe de chaque bout (croix quand on regarde d'au-dessus), axe de symétrie vu d'au-dessus
    [xLa,xLb].forEach(x => k.revol("lum",[x,yLu,zBr-5],[x,yLu,H+5],r,[[x,yLu,H],[x,yLu,zBr]],[1,0,0]));
    [H,zBr].forEach(z => k.axeVue("lum",[xLa-r-4,yLu,z],[xLb+r+4,yLu,z],[0,0,1]));
    const prof = [[0,0],[xTa,0],...k.arc(xCg,0,R,180,90,18),[xBi,zBr],[xBi,H],[Ch,H],[0,zCh]];
    const lum = [...k.arc(xLb,yLu,r,-90,90,24),...k.arc(xLa,yLu,r,90,270,24)];
    k.poly("talon",[[0,0,0],[xTa,0,0],[xTa,P,0],[0,P,0]]);
    k.surf("talon",(u,v) => { const t = (180-90*v)*rad; return [xCg+R*Math.cos(t), u*P, R*Math.sin(t)]; },1,18,{edges:[]});
    const dessous = [[xCg,0],[xBi,0],[L,yBi],[L,P-yBi],[xBi,P],[xCg,P]];
    k.planar("bloc",dessous,[lum],(u,v) => [u,v,zBr],{edges:[dessous,lum.concat([lum[0]])]});
    k.tangent("talon",[[[xCg,0,zBr],[xCg,P,zBr]]]);   // congé / dessous du bras
    k.planar("bloc",prof,[],(u,v) => [u,0,v]); k.planar("bloc",prof,[],(u,v) => [u,P,v]);
    k.poly("bloc",[[0,0,0],[0,P,0],[0,P,zCh],[0,0,zCh]]);
    k.poly("chanf",[[0,0,zCh],[Ch,0,H],[Ch,P,H],[0,P,zCh]]);
    k.planar("bloc",[[Ch,0],[xBi,0],[L,yBi],[L,P-yBi],[xBi,P],[Ch,P]],[lum],(u,v) => [u,v,H]);
    k.poly("bis",[[xBi,0,zBr],[L,yBi,zBr],[L,yBi,H],[xBi,0,H]]);
    k.poly("bis",[[xBi,P,zBr],[L,P-yBi,zBr],[L,P-yBi,H],[xBi,P,H]]);
    k.poly("bis",[[L,yBi,zBr],[L,P-yBi,zBr],[L,P-yBi,H],[L,yBi,H]]);
    [-1,1].forEach(s => k.planar("lum",[[xLa,zBr],[xLb,zBr],[xLb,H],[xLa,H]],[],(u,v) => [u,yLu+s*r,v],{edges:[],tangent:[[[xLa,zBr],[xLa,H]],[[xLb,zBr],[xLb,H]]]}));
    k.surf("lum",(u,v) => { const t = (-90+180*v)*rad; return [xLb+r*Math.cos(t), yLu+r*Math.sin(t), zBr+u*(H-zBr)]; },1,24,{edges:[]});
    k.surf("lum",(u,v) => { const t = (90+180*v)*rad; return [xLa+r*Math.cos(t), yLu+r*Math.sin(t), zBr+u*(H-zBr)]; },1,24,{edges:[]});
    k.edge("rouge",[[xBi,P,zBr],[xBi,P,H]]);
  }
};
