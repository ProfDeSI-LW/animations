// 9. CHAPE
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; bouts arrondis d'axe y.
// Feuille : vue de droite à GAUCHE de la vue de face, vue de dessus en dessous.
return {
  side: "droite",
  defaults: {Long:119, Rb:21, Prof:55, Pa:42, xF:57, yFa:13.5, yFb:34, dA:14, dB:24},
  dims: [["Chape",null],["Long","Longueur hors tout"],["Rb","Rayon des bouts"],["Prof","Profondeur côté fourche"],["Pa","Profondeur de la languette"],
         ["Fourche",null],["xF","Fond de la fente (x)"],["yFa","Flanc arrière"],["yFb","Flanc avant"],
         ["Trous",null],["dA","Ø petit trou"],["dB","Ø grand trou"]],
  elements: [
    {id:"bloc",  name:"Contour de la chape", info:"Bouts arrondis : raccords tangents, sans arête"},
    {id:"lang",  name:"Languette et congé", info:"Plus mince que la fourche, raccordée par un congé"},
    {id:"fourche",name:"Fente de la fourche", info:"Ouverte à droite, traversante en hauteur"},
    {id:"trouA", name:"Petit trou", info:"Traverse la languette"},
    {id:"trouB", name:"Grand trou", info:"Traverse les deux branches de la fourche"}],
  derive(p){
    const d = {...p, EcG:16.5, EcD:13, Deb:4};
    d.H = 2*p.Rb; d.xA = p.Rb; d.xB = p.Long-p.Rb; d.rA = p.dA/2; d.rB = p.dB/2;
    d.Rcg = p.Prof-p.Pa; d.xCg = p.xF-d.Rcg; d.XD = -d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.xCg <= d.xA) w.push("Le congé doit commencer après le centre du bout gauche.");
    if (d.rB >= d.Rb || d.rA >= d.Rb) w.push("Les trous sont plus grands que les bouts.");
    if (d.yFb >= d.Pa) w.push("Le flanc avant de la fente doit rester dans la languette.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Rb:R, Prof:P, Pa, xF, yFa, yFb, H, xA, xB, rA, rB, Rcg, xCg, XD, EcD, Deb:deb} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], D = (y,z) => [XD-y,-z];
    const arc = (cx,cy,rr,a0,a1,map) => Array.from({length:25},(_,i) => { const t = (a0+(a1-a0)*i/24)*Math.PI/180; return map(cx+rr*Math.cos(t), cy+rr*Math.sin(t)); });
    a.label([0,-H-deb-5],"Vue de face"); a.label([XD-P,-H-deb-5],"Vue de droite"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face
    a.curve("bloc",[F(xA,0),F(xB,0),...arc(xB,R,R,-90,90,F),F(xA,H),...arc(xA,R,R,90,270,F)]);
    a.circle("trouA",F(xA,R),rA); a.circle("trouB",F(xB,R),rB);
    // une croix d'axes par trou (les deux trous sont trop éloignés pour un axe commun)
    a.axe("trouA",F(xA-rA-deb,R),F(xA+rA+deb,R)); a.axe("trouB",F(xB-rB-deb,R),F(xB+rB+deb,R));
    a.axe("trouA",F(xA,R-rA-deb),F(xA,R+rA+deb)); a.axe("trouB",F(xB,R-rB-deb),F(xB,R+rB+deb));
    a.line("lang",[F(xF,0),F(xF,H)],"vu",true);
    // vue de dessus (avant en bas)
    a.line("bloc",[T(0,Pa),T(0,0),T(L,0),T(L,yFa)]); a.line("bloc",[T(L,yFb),T(L,P),T(xF,P)]);
    a.line("fourche",[T(L,yFa),T(xF,yFa),T(xF,yFb),T(L,yFb)]);
    a.curve("lang",[...arc(xCg,P,Rcg,0,-90,T),T(0,Pa)]);
    [-1,1].forEach(s => {
      a.line("trouA",[T(xA+s*rA,0),T(xA+s*rA,Pa)],"cache",true);
      a.line("trouB",[T(xB+s*rB,0),T(xB+s*rB,yFa)],"cache",true); a.line("trouB",[T(xB+s*rB,yFb),T(xB+s*rB,P)],"cache",true);
    });
    a.axe("trouA",T(xA,-deb),T(xA,Pa+deb),true); a.axe("trouB",T(xB,-deb),T(xB,P+deb),true);
    // vue de droite (avant à gauche)
    a.line("bloc",[D(0,0),D(P,0),D(P,H),D(0,H),D(0,0)]);
    a.line("fourche",[D(yFa,0),D(yFa,H)],"vu",true); a.line("fourche",[D(yFb,0),D(yFb,H)],"vu",true);
    [-1,1].forEach(s => {
      a.line("trouB",[D(0,R+s*rB),D(yFa,R+s*rB)],"cache",true); a.line("trouB",[D(yFb,R+s*rB),D(P,R+s*rB)],"cache",true);
      a.line("trouA",[D(0,R+s*rA),D(Pa,R+s*rA)],"cache",true);
    });
    a.line("lang",[D(Pa,0),D(Pa,H)],"cache",true);   // bout de la languette (face y = Pa, vue par la tranche), où débouche le petit trou
    a.axe("bloc",D(-deb,R),D(P+deb,R),true);
    // renvois et droite à 45°
    a.line("bloc",[T(0,0),[XD,EcD]],"fin"); a.line("bloc",[[XD,0],[XD,EcD]],"fin");
    a.line("bloc",[[XD+2,EcD-2],[XD-P-4,EcD+P+4]],"fin");
    // traits de construction (R4)
    const fd = (el,xs,z,ye) => a.cons(el,[F(xs,z), D(cor?ye:P, z)]);
    const td = (el,xs,y,ze) => a.cons(el,[T(xs,y), [XD-y,EcD+y], D(y, cor?ze:H)]);
    const ft = (el,x,zs,ye) => a.cons(el,[F(x,zs), T(x, cor?ye:P)]);
    fd("bloc",xA,H,P); fd("bloc",xA,0,P); ft("bloc",0,R,Pa); ft("bloc",L,R,P);
    ft("lang",xF,0,P);
    td("fourche",xF,yFa,H); td("fourche",xF,yFb,H); td("bloc",xF,0,H); td("bloc",xF,P,H); td("lang",xCg,Pa,H);
    [-1,1].forEach(s => { fd("trouA",xA,R+s*rA,Pa); ft("trouA",xA+s*rA,R,Pa); fd("trouB",xB,R+s*rB,P); ft("trouB",xB+s*rB,R,P); });
  },
  solid(d, k){
    const {Long:L, Rb:R, Prof:P, Pa, xF, yFa, yFb, H, xA, xB, rA, rB, Rcg, xCg} = d, rad = Math.PI/180;
    const croix = (el,c,u,v,l) => [u,v].forEach(w => k.axe(el, c.map((q,i) => q-l*w[i]), c.map((q,i) => q+l*w[i])));   // croix d'axes devant un trou
    k.revol("trouA",[xA,-5,R],[xA,Pa+5,R],rA,[[xA,0,R],[xA,Pa,R]]); k.revol("trouB",[xB,-5,R],[xB,P+5,R],rB,[[xB,0,R],[xB,P,R]]);   // axes
    const bout = (el,cx,a0,a1,y0,y1) => k.surf(el,(u,v) => { const t = (a0+(a1-a0)*v)*rad; return [cx+R*Math.cos(t), y0+u*(y1-y0), R+R*Math.sin(t)]; },1,24,{edges:[]});
    const trou = (el,cx,r,y0,y1) => k.surf(el,(u,v) => { const t = 2*Math.PI*v; return [cx+r*Math.cos(t), y0+u*(y1-y0), R+r*Math.sin(t)]; },1,40,{edges:[]});
    const stade = [[xA,0],[xB,0],...k.arc(xB,R,R,-90,90,24),[xA,H],...k.arc(xA,R,R,90,270,24)];
    const fourche = [[xF,0],[xB,0],...k.arc(xB,R,R,-90,90,24),[xF,H]];
    const cA = k.arc(xA,R,rA,0,360,40), cB = k.arc(xB,R,rB,0,360,40);
    // bouts arrondis et trous
    bout("bloc",xA,90,270,0,Pa);
    bout("bloc",xB,-90,90,0,yFa); bout("bloc",xB,-90,90,yFb,P);
    trou("trouA",xA,rA,0,Pa); trou("trouB",xB,rB,0,yFa); trou("trouB",xB,rB,yFb,P);
    // dessus et dessous (raccords tangents aux bouts : pas d'arête)
    const plan = [[xA,0],[xB,0],[xB,yFa],[xF,yFa],[xF,yFb],[xB,yFb],[xB,P],[xF,P],...k.arc(xCg,P,Rcg,0,-90,12),[xA,Pa]];
    const aretes = [[[xA,0],[xB,0]], [[xB,yFa],[xF,yFa],[xF,yFb],[xB,yFb]], [[xB,P],[xF,P],...k.arc(xCg,P,Rcg,0,-90,12),[xA,Pa]]];
    k.planar("bloc",plan,[],(u,v) => [u,v,H],{edges:aretes}); k.planar("bloc",plan,[],(u,v) => [u,v,0],{edges:aretes});
    [0,H].forEach(z => k.tangent("bloc",[[[xA,0,z],[xA,Pa,z]],[[xB,0,z],[xB,yFa,z]],[[xB,yFb,z],[xB,P,z]]]));
    k.tangent("lang",[[[xCg+Rcg,P,0],[xCg+Rcg,P,H]],[[xCg,P-Rcg,0],[xCg,P-Rcg,H]]]);
    // faces
    k.planar("bloc",stade,[cA,cB],(u,v) => [u,0,v]);
    const lang = [[xCg,0],[xA,0],...k.arc(xA,R,R,270,90,24),[xCg,H]];
    k.planar("lang",lang,[cA],(u,v) => [u,Pa,v],{edges:[[[xCg,0],[xA,0],...k.arc(xA,R,R,270,90,24),[xCg,H]], cA.concat([cA[0]])]});
    k.surf("lang",(u,v) => { const t = (-90+90*v)*rad; return [xCg+Rcg*Math.cos(t), P+Rcg*Math.sin(t), u*H]; },1,12,{edges:[]});
    k.planar("bloc",fourche,[cB],(u,v) => [u,P,v]);
    k.planar("fourche",fourche,[cB],(u,v) => [u,yFa,v]); k.planar("fourche",fourche,[cB],(u,v) => [u,yFb,v]);
    k.poly("fourche",[[xF,yFa,0],[xF,yFb,0],[xF,yFb,H],[xF,yFa,H]]);
  }
};
