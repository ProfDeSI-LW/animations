// 1. ENTAILLES ET RAINURE
// Repère : x longueur, y profondeur (0 à l'arrière), z hauteur ; origine au coin arrière gauche du dessous.
// La pièce est un prisme : le profil de la vue de face est extrudé sur toute la profondeur.
// Feuille : vue de droite à GAUCHE, vue de gauche à DROITE de la vue de face, vue de dessus en dessous.
return {
  side: "deux",
  defaults: {Long:60, Prof:33, Haut:66.5, xRa:20, zRa:13.5, zRb:40, xEh:33.5, zEh:53.5, xEb:46.5, zEb:33.5},
  dims: [["Bloc",null],["Long","Longueur"],["Prof","Profondeur"],["Haut","Hauteur"],
         ["Rainure (à gauche)",null],["xRa","Fond"],["zRa","Bas"],["zRb","Haut"],
         ["Entaille haute (à droite)",null],["xEh","Flanc"],["zEh","Fond"],
         ["Entaille basse (à droite)",null],["xEb","Flanc"],["zEb","Plafond"]],
  elements: [
    {id:"bloc", name:"Contour du bloc", info:"Profil de la vue de face, extrudé sur toute la profondeur"},
    {id:"rain", name:"Rainure", info:"Ouverte à gauche, vue de gauche, cachée de droite et de dessus"},
    {id:"eh",   name:"Entaille haute", info:"Vue de droite et de dessus, cachée de gauche"},
    {id:"eb",   name:"Entaille basse", info:"Vue de droite, cachée de gauche et de dessus"},
    {id:"rouge",name:"Fond de l’entaille haute", info:"Arête au pied du flanc", color:"rouge"}],
  derive(p){
    const d = {...p, EcG:14, EcD:10.5, Deb:4};
    d.XD = -d.EcG; d.XG = p.Long+d.EcG;
    return d;
  },
  check(d){
    const w = [];
    if (d.zRa >= d.zRb) w.push("Le bas de la rainure doit être sous son haut.");
    if (d.zEb >= d.zEh) w.push("Le plafond de l’entaille basse doit être sous le fond de l’entaille haute.");
    if (d.xRa >= d.xEb || d.xEh >= d.Long || d.xEb >= d.Long) w.push("Les entailles sortent de la pièce.");
    if (d.zEh >= d.Haut || d.zRb >= d.Haut) w.push("Une entaille dépasse la hauteur.");
    return w;
  },
  views(d, cor, a){
    const {Long:L, Prof:P, Haut:H, xRa, zRa, zRb, xEh, zEh, xEb, zEb, XD, XG, EcD} = d;
    const F = (x,z) => [x,-z], T = (x,y) => [x,EcD+y], G = (y,z) => [XG+y,-z], D = (y,z) => [XD-y,-z];
    a.label([0,-H-9],"Vue de face"); a.label([XG,-H-9],"Vue de gauche"); a.label([XD-P,-H-9],"Vue de droite"); a.label([0,EcD+P+9],"Vue de dessus");
    // vue de face (donnée complète)
    a.line("bloc",[F(0,zRa),F(0,0),F(xEb,0)]); a.line("bloc",[F(xEh,H),F(0,H),F(0,zRb)]);
    a.line("rain",[F(0,zRb),F(xRa,zRb),F(xRa,zRa),F(0,zRa)]);
    a.line("eb",[F(xEb,0),F(xEb,zEb),F(L,zEb)]); a.line("bloc",[F(L,zEb),F(L,zEh)]);
    a.line("eh",[F(L,zEh),F(xEh,zEh),F(xEh,H)]);
    a.dot("rouge",F(xEh,zEh));
    // vues de côté et de dessus : rectangles donnés
    a.line("bloc",[G(0,0),G(P,0),G(P,H),G(0,H),G(0,0)]);
    a.line("bloc",[D(0,0),D(P,0),D(P,H),D(0,H),D(0,0)]);
    a.line("bloc",[T(0,0),T(L,0),T(L,P),T(0,P),T(0,0)]);
    // vue de gauche
    [zRa,zRb].forEach(z => a.line("rain",[G(0,z),G(P,z)],"vu",true));
    a.line("eb",[G(0,zEb),G(P,zEb)],"cache",true); a.line("eh",[G(0,zEh),G(P,zEh)],"cache",true);
    // vue de droite
    a.line("eh",[D(0,zEh),D(P,zEh)],"vu",true); a.line("eb",[D(0,zEb),D(P,zEb)],"vu",true);
    [zRa,zRb].forEach(z => a.line("rain",[D(0,z),D(P,z)],"cache",true));
    a.line("rouge",[D(0,zEh),D(P,zEh)],"vu",true);
    // vue de dessus
    a.line("eh",[T(xEh,0),T(xEh,P)],"vu",true); a.line("rouge",[T(xEh,0),T(xEh,P)],"vu",true);
    a.line("rain",[T(xRa,0),T(xRa,P)],"cache",true); a.line("eb",[T(xEb,0),T(xEb,P)],"cache",true);
    // droites à 45°
    a.line("bloc",[[XG-3,EcD-3],[XG+P+4,EcD+P+4]],"fin",true);
    a.line("bloc",[[XD+3,EcD-3],[XD-P-4,EcD+P+4]],"fin",true);
    // traits de construction (R4)
    // départ au bout de l'arête de la vue de face le plus proche de la vue visée
    const fg = (el,x0,z) => a.cons(el,[F(x0,z), G(cor?0:P, z)]);
    const fd = (el,x0,z) => a.cons(el,[F(x0,z), D(cor?0:P, z)]);
    const ft = (el,x,zs) => a.cons(el,[F(x,zs), T(x, P)]);
    const tg = (el,y) => a.cons(el,[T(L,y), [XG+y,EcD+y], G(y,H)]);
    const td = (el,y) => a.cons(el,[T(0,y), [XD-y,EcD+y], D(y,H)]);
    fg("rain",xRa,zRa); fg("rain",xRa,zRb); fg("eb",L,zEb); fg("eh",L,zEh); fg("bloc",xEb,0); fg("bloc",xEh,H);
    fd("rain",0,zRa); fd("rain",0,zRb); fd("eb",xEb,zEb); fd("eh",xEh,zEh); fd("rouge",xEh,zEh); fd("bloc",0,0); fd("bloc",0,H);
    ft("eh",xEh,zEh); ft("rouge",xEh,zEh); ft("rain",xRa,zRa); ft("eb",xEb,0); ft("bloc",0,0); ft("bloc",L,zEb);
    [0,P].forEach(y => { tg("bloc",y); td("bloc",y); });
  },
  solid(d, k){
    const {Long:L, Prof:P, Haut:H, xRa, zRa, zRb, xEh, zEh, xEb, zEb} = d;
    const prof = [[0,0],[xEb,0],[xEb,zEb],[L,zEb],[L,zEh],[xEh,zEh],[xEh,H],[0,H],[0,zRb],[xRa,zRb],[xRa,zRa],[0,zRa]];
    k.planar("bloc",prof,[],(u,v) => [u,P,v]); k.planar("bloc",prof,[],(u,v) => [u,0,v]);
    const el = i => { const a0 = prof[i], b0 = prof[(i+1)%prof.length];
      if (i >= 8 && i <= 10) return "rain"; if (i >= 1 && i <= 2) return "eb"; if (i >= 4 && i <= 5) return "eh"; return "bloc"; };
    prof.forEach((p0,i) => { const p1 = prof[(i+1)%prof.length];
      k.poly(el(i),[[p0[0],0,p0[1]],[p1[0],0,p1[1]],[p1[0],P,p1[1]],[p0[0],P,p0[1]]]); });
    k.edge("rouge",[[xEh,0,zEh],[xEh,P,zEh]]);
  }
};
