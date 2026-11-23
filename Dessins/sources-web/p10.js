// 10. SEMELLE
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au coin arrière gauche du dessous.
// Feuille : vue de gauche à DROITE de la vue de face, vue de dessus en dessous.
return {
  side: "gauche",
  defaults: {Long:90, Prof:38, Haut:77, xGa:23, xGb:67, zGf:58, zPa:39, xBa:19, xBb:71, rS:13, zOa:18, zOb:43, rL:13, pL:9.5, rT:6.5},
  dims: [["Bloc",null],["Long","Longueur"],["Prof","Profondeur"],["Haut","Hauteur"],["zPa","Départ des pans"],["xBa","Dessous : début"],["xBb","Dessous : fin"],
         ["Rainure",null],["xGa","Flanc gauche"],["xGb","Flanc droit"],["zGf","Fond"],
         ["Portée",null],["rS","Rayon de la portée"],
         ["Boutonnière",null],["zOa","Centre bas (z)"],["zOb","Centre haut (z)"],["rL","Rayon du lamage"],["pL","Profondeur du lamage"],["rT","Rayon du trou"]],
  elements: [
    {id:"bloc", name:"Contour de la semelle", info:"Rectangle capable des trois vues"},
    {id:"pans", name:"Pans inclinés", info:"Deux faces inclinées vers le dessous"},
    {id:"rain", name:"Rainure entre les oreilles", info:"Traverse la pièce d’avant en arrière"},
    {id:"port", name:"Portée demi-cylindrique", info:"Creusée dans le dessus des deux oreilles"},
    {id:"bout", name:"Boutonnière lamée", info:"Lamage à l’avant, trou oblong traversant"},
    {id:"rouge",name:"Arête de la portée", info:"Oreille droite, bord avant de la portée", color:"rouge"}],
  derive(p){
    const d = {...p, EcG:17.5, EcD:13.5, Deb:4, AmA:.29, AmB:.15};
    d.xO = p.Long/2; d.yS = p.Prof/2; d.zS = p.Haut-p.rS; d.yL = p.Prof-p.pL; d.XG = p.Long+d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.zS <= d.zGf) w.push("La portée descend sous le fond de la rainure.");
    if (d.zOb+d.rL >= d.zGf) w.push("Le lamage mord sur la rainure.");
    if (d.zOa-d.rL <= 0) w.push("Le lamage sort par le dessous.");
    if (d.rT >= d.rL) w.push("Le trou doit être plus petit que le lamage.");
    if (2*d.rS >= d.Prof) w.push("La portée est plus large que la pièce.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, Haut:H, xGa, xGb, zGf, zPa, xBa, xBb, rS, zOa, zOb, rL, rT, xO, yS, zS, yL, XG, EcD, Deb:deb} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], G = (y,z) => [XG+y,-z];
    const arc = (cx,cy,rr,a0,a1,map) => Array.from({length:19},(_,i) => { const t = (a0+(a1-a0)*i/18)*Math.PI/180; return map(cx+rr*Math.cos(t), cy+rr*Math.sin(t)); });
    const ob = r => [F(xO+r,zOa),...arc(xO,zOb,r,0,180,F),...arc(xO,zOa,r,180,360,F)];
    a.label([0,-H-deb-5],"Vue de face"); a.label([XG,-H-deb-5],"Vue de gauche"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face
    a.line("bloc",[F(xGa,H),F(0,H),F(0,zPa)]); a.line("bloc",[F(xBa,0),F(xBb,0)]); a.line("bloc",[F(L,zPa),F(L,H),F(xGb,H)]);
    a.line("pans",[F(0,zPa),F(xBa,0)]); a.line("pans",[F(xBb,0),F(L,zPa)]);
    a.line("rain",[F(xGb,H),F(xGb,zGf),F(xGa,zGf),F(xGa,H)]);
    a.curve("bout",ob(rL)); a.curve("bout",ob(rT));
    a.axe("bout",F(xO,zOa-rL-deb),F(xO,zOb+rL+deb)); a.axe("bout",F(xO-rL-deb,zOa),F(xO+rL+deb,zOa)); a.axe("bout",F(xO-rL-deb,zOb),F(xO+rL+deb,zOb));
    a.line("port",[F(0,zS),F(xGa,zS)],"cache",true); a.line("port",[F(xGb,zS),F(L,zS)],"cache",true);
    // vue de gauche (arrière à gauche)
    a.line("bloc",[G(yS-rS,H),G(0,H),G(0,0),G(P,0),G(P,H),G(yS+rS,H)]);
    a.curve("port",arc(yS,H,rS,0,-180,G));
    a.axe("port",G(yS,zS-deb),G(yS,H+deb)); a.axe("port",G(yS-rS-deb,H),G(yS+rS+deb,H));   // croix d'axes de la portée
    a.axe("bout",G(-deb,zOa),G(P+deb,zOa)); a.axe("bout",G(-deb,zOb),G(P+deb,zOb));
    a.line("bout",[G(yL,zOb+rL),G(P,zOb+rL)],"cache"); a.line("bout",[G(yL,zOa-rL),G(P,zOa-rL)],"cache");
    a.line("bout",[G(yL,zOa-rL),G(yL,zOb+rL)],"cache");
    a.line("bout",[G(0,zOb+rT),G(yL,zOb+rT)],"cache"); a.line("bout",[G(0,zOa-rT),G(yL,zOa-rT)],"cache");
    a.line("pans",[G(0,zPa),G(P,zPa)],"vu",true);
    a.line("rain",[G(0,zGf),G(P,zGf)],"cache",true);
    // vue de dessus (avant en bas)
    a.line("bloc",[T(d.AmA*L,P),T(L,P),T(L,d.AmB*P)],"fin","e");
    a.line("bloc",[T(0,0),T(L,0),T(L,P),T(0,P),T(0,0)],"vu",true);
    a.line("rain",[T(xGa,0),T(xGa,P)],"vu",true); a.line("rain",[T(xGb,0),T(xGb,P)],"vu",true);
    [yS-rS,yS+rS].forEach(y => { a.line("port",[T(0,y),T(xGa,y)],"vu",true); a.line("port",[T(xGb,y),T(L,y)],"vu",true); });
    a.line("pans",[T(xBa,0),T(xBa,P)],"cache",true); a.line("pans",[T(xBb,0),T(xBb,P)],"cache",true);
    [-1,1].forEach(s => { a.line("bout",[T(xO+s*rT,0),T(xO+s*rT,yL)],"cache",true); a.line("bout",[T(xO+s*rL,yL),T(xO+s*rL,P)],"cache",true); });
    a.line("bout",[T(xO-rL,yL),T(xO-rT,yL)],"cache",true); a.line("bout",[T(xO+rT,yL),T(xO+rL,yL)],"cache",true);
    a.axe("bout",T(xO,-deb),T(xO,P+deb),true);
    a.axe("port",T(-deb,yS),T(xGa+deb,yS),true); a.axe("port",T(xGb-deb,yS),T(L+deb,yS),true);
    a.line("bloc",[[XG-4,EcD-4],[XG+P+6,EcD+P+6]],"fin");
    // arête repérée
    a.line("rouge",[F(xGb,H),F(L,H)],"vu",true); a.dot("rouge",G(yS+rS,H)); a.line("rouge",[T(xGb,yS+rS),T(L,yS+rS)],"vu",true);
    // traits de construction (R4)
    const fl = (el,xs,z,ye) => a.cons(el,[F(xs,z), G(cor?ye:P, z)]);
    const tl = (el,xs,y,ze) => a.cons(el,[T(xs,y), [XG+y,EcD+y], G(y, cor?ze:H)]);
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    fl("bloc",L,H,P); tl("bloc",L,0,H); tl("bloc",L,P,H);
    fl("pans",L,zPa,P); fl("pans",xBb,0,P); ft("pans",xBa,0,P); ft("pans",xBb,0,P);
    fl("rain",xGb,zGf,P); ft("rain",xGa,zGf,P); ft("rain",xGb,zGf,P);
    fl("port",L,zS,yS); tl("port",L,yS-rS,H); tl("port",L,yS+rS,H);
    tl("bout",xO+rL,yL,zOb+rL); ft("bout",xO-rL,zOa,P); ft("bout",xO+rL,zOa,P); ft("bout",xO-rT,zOa,yL); ft("bout",xO+rT,zOa,yL);
    fl("rouge",L,H,yS+rS); ft("bloc",0,zPa,0); ft("bloc",L,zPa,0);
    fl("bout",xO,zOb+rL,yL); fl("bout",xO,zOa-rL,yL); fl("bout",xO,zOb+rT,0); fl("bout",xO,zOa-rT,0); tl("rouge",L,yS+rS,H);
  },
  solid(d, k){
    const {Long:L, Prof:P, Haut:H, xGa, xGb, zGf, zPa, xBa, xBb, rS, zOa, zOb, rL, rT, xO, yS, yL} = d, rad = Math.PI/180;
    const croix = (el,c,u,v,l) => [u,v].forEach(w => k.axe(el, c.map((q,i) => q-l*w[i]), c.map((q,i) => q+l*w[i])));   // croix d'axes devant un trou
    // axes : portées demi-cylindriques (axe le long de x), boutonnière lamée (axe de chaque bout, axe de symétrie vu de face)
    k.revol("port",[-5,yS,H],[xGa+5,yS,H],rS,[[0,yS,H],[xGa,yS,H]]); k.revol("port",[xGb-5,yS,H],[L+5,yS,H],rS,[[xGb,yS,H],[L,yS,H]]);
    [zOa,zOb].forEach(z => k.revol("bout",[xO,-5,z],[xO,P+5,z],rL,[[xO,0,z],[xO,P,z]],[0,0,1]));
    [P,0].forEach(y => k.axeVue("bout",[xO,y,zOa-rL-4],[xO,y,zOb+rL+4],[0,1,0]));
    const ob = r => [...k.arc(xO,zOb,r,0,180,16),...k.arc(xO,zOa,r,180,360,16)];
    const prof = [[0,zPa],[xBa,0],[xBb,0],[L,zPa],[L,H],[xGb,H],[xGb,zGf],[xGa,zGf],[xGa,H],[0,H]];
    const cote = [[0,0],[P,0],[P,H],[yS+rS,H],...k.arc(yS,H,rS,0,-180,20),[yS-rS,H],[0,H]];
    // faces avant / arrière
    k.planar("bloc",prof,[ob(rL)],(u,v) => [u,P,v]);
    k.planar("bloc",prof,[ob(rT)],(u,v) => [u,0,v]);
    // dessous et pans
    k.poly("bloc",[[xBa,0,0],[xBb,0,0],[xBb,P,0],[xBa,P,0]]);
    k.poly("pans",[[0,0,zPa],[xBa,0,0],[xBa,P,0],[0,P,zPa]]);
    k.poly("pans",[[xBb,0,0],[L,0,zPa],[L,P,zPa],[xBb,P,0]]);
    // faces latérales (y, z) et flancs de la rainure
    k.planar("bloc",cote.map(([y,z]) => [y,z<zPa?zPa:z]),[],(u,v) => [0,u,v]);
    k.planar("bloc",cote.map(([y,z]) => [y,z<zPa?zPa:z]),[],(u,v) => [L,u,v]);
    const flanc = cote.map(([y,z]) => [y,z<zGf?zGf:z]);
    k.planar("rain",flanc,[],(u,v) => [xGa,u,v]); k.planar("rain",flanc,[],(u,v) => [xGb,u,v]);
    k.poly("rain",[[xGa,0,zGf],[xGb,0,zGf],[xGb,P,zGf],[xGa,P,zGf]]);
    // dessus des oreilles et portée
    [[0,xGa],[xGb,L]].forEach(([x0,x1]) => {
      k.poly("bloc",[[x0,0,H],[x1,0,H],[x1,yS-rS,H],[x0,yS-rS,H]]);
      k.poly("bloc",[[x0,yS+rS,H],[x1,yS+rS,H],[x1,P,H],[x0,P,H]]);
      k.surf("port",(u,v) => { const t = (180+180*v)*rad; return [x0+u*(x1-x0), yS+rS*Math.cos(t), H+rS*Math.sin(t)]; },1,20,{edges:[]});
    });
    // boutonnière : lamage puis trou (parois sans arête de raccord)
    const paroi = (r,y0,y1) => {
      [-1,1].forEach(s => k.planar("bout",[[y0,zOa],[y1,zOa],[y1,zOb],[y0,zOb]],[],(u,v) => [xO+s*r,u,v],{edges:[],tangent:[[[y0,zOa],[y1,zOa]],[[y0,zOb],[y1,zOb]]]}));
      k.surf("bout",(u,v) => { const t = 2*Math.PI*v/2; return [xO+r*Math.cos(t), y0+u*(y1-y0), zOb+r*Math.sin(t)]; },1,16,{edges:[]});
      k.surf("bout",(u,v) => { const t = Math.PI+Math.PI*v; return [xO+r*Math.cos(t), y0+u*(y1-y0), zOa+r*Math.sin(t)]; },1,16,{edges:[]});
    };
    paroi(rL,yL,P); paroi(rT,0,yL);
    k.planar("bout",ob(rL),[ob(rT)],(u,v) => [u,yL,v]);
    k.edge("rouge",[[xGb,yS+rS,H],[L,yS+rS,H]]);
  }
};
