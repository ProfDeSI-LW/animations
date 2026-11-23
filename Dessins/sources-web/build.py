#!/usr/bin/env python3
"""Assemble les pages interactives autonomes à partir du moteur commun et des définitions de pièces.

  python3 build.py                    -> site/ : toutes les fiches
  python3 build.py --eleves 1,2,3,13  -> MÉNAGE COMPLET : il ne reste plus dans tout le dossier que ces fiches.
     Sont supprimés pour les autres fiches : site/ (pages, PDF), sources-web/pXX.js, tikz/ficheXX.tex et .pdf,
     tikz/extras/xXX.tex, tikz/orig/oXX*.tex, tikz/rendu/ficheXX*.png. Irréversible : travailler sur une COPIE
     de l'archive complète. Ensuite, « python3 build.py » ne refait que les fiches restantes.
"""
import hashlib, html, json, pathlib, shutil, sys
here = pathlib.Path(__file__).parent
SEL = None
if "--eleves" in sys.argv:
    SEL = {int(x) for x in sys.argv[sys.argv.index("--eleves")+1].replace(" ", "").split(",") if x}
out = here.parent / "site"
out.mkdir(exist_ok=True)
garde = lambda fname: SEL is None or int(fname[5:7]) in SEL   # fiche13a -> 13
engine = (here / "engine.html").read_text()

E = lambda s: html.escape(s, quote=False)

# ---------------------------------------------------------------------
# Verrou par mot de passe (acces.json) : désactivé tant que "actif" vaut false
# ---------------------------------------------------------------------
ACCES = json.loads((here / "acces.json").read_text()) if (here / "acces.json").exists() else {"actif": False}
def acces_script():
    if not ACCES.get("actif"): return ""
    G = {}
    for g in ACCES.get("groupes", []):
        h = hashlib.sha256(("cahier-dessin:" + g["mot_de_passe"]).encode()).hexdigest()
        for f in g["fiches"]: G[f] = {"g": g["nom"], "h": h}
    return """<style>
html.verrou .wrap{visibility:hidden}
.acces-fond{position:fixed;inset:0;z-index:50;background:rgb(20 26 24/.55);display:grid;place-items:center;padding:16px}
.acces-boite{background:var(--surface,#fff);color:var(--fg,#1c2421);border-radius:10px;padding:20px;width:min(360px,100%);box-shadow:0 10px 30px rgb(0 0 0/.3);font-family:var(--f-body,Arial,sans-serif)}
.acces-boite h2{margin:0 0 6px;font-size:1.2rem} .acces-boite p{margin:0 0 12px;color:var(--muted,#5d6b65);font-size:.92rem}
.acces-boite input{width:100%;font:inherit;padding:7px 9px;border:1px solid var(--line,#cdd4d0);border-radius:6px;background:var(--bg,#fff);color:inherit}
.acces-boite .btns{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
.acces-boite button{font:inherit;font-weight:600;border:0;border-radius:6px;padding:7px 14px;cursor:pointer;background:var(--chip,#e3e8e5);color:inherit}
.acces-boite button.ok{background:var(--hl,#e07800);color:#fff}
.acces-boite .err{color:#d01e1e;margin:8px 0 0}
.acces-cadenas{font-size:.8em;opacity:.75;margin-left:.3em}
</style>
<script>
(() => {
  const G = """ + json.dumps(G) + """, KEY = "cahier-dessin-acces", memo = new Set();
  const lus = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const ouvert = h => memo.has(h) || lus().includes(h);
  const garde = h => { memo.add(h); try { const a = lus(); if (!a.includes(h)) { a.push(h); localStorage.setItem(KEY, JSON.stringify(a)); } } catch (e) {} };
  const empreinte = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("cahier-dessin:" + t)))]
    .map(x => x.toString(16).padStart(2, "0")).join("");
  const fiche = href => { const m = /(fiche[0-9]+)[ab]?[.](?:html|pdf)/.exec(href || ""); return m ? m[1] : null; };
  function demande(g, suite, pageEntiere){
    const fond = document.createElement("div"); fond.className = "acces-fond";
    fond.innerHTML = '<form class="acces-boite"><h2></h2><p>Cette fiche est verrouillée. Entrez le mot de passe donné en classe.</p>'
      + '<input type="password" autocomplete="off" aria-label="Mot de passe"><p class="err" hidden>Mot de passe incorrect.</p>'
      + '<div class="btns"><button type="button" class="non"></button><button type="submit" class="ok">Ouvrir</button></div></form>';
    fond.querySelector("h2").textContent = g.g;
    const non = fond.querySelector(".non"); non.textContent = pageEntiere ? "Retour au sommaire" : "Annuler";
    non.onclick = () => { if (pageEntiere) location.href = "index.html"; else fond.remove(); };
    fond.querySelector("form").onsubmit = async ev => { ev.preventDefault();
      if (await empreinte(fond.querySelector("input").value) === g.h) { garde(g.h); fond.remove(); suite(); marque(); }
      else fond.querySelector(".err").hidden = false; };
    document.body.appendChild(fond); fond.querySelector("input").focus();
  }
  function marque(){ document.querySelectorAll("a[href]").forEach(a => { const g = G[fiche(a.getAttribute("href"))];
    const c = a.querySelector(".acces-cadenas"); if (g && !ouvert(g.h)) { if (!c) a.insertAdjacentHTML("beforeend", '<span class="acces-cadenas">(verrouillée)</span>'); } else if (c) c.remove(); }); }
  document.addEventListener("click", ev => { const a = ev.target.closest("a[href]"); if (!a) return;
    const g = G[fiche(a.getAttribute("href"))]; if (!g || ouvert(g.h)) return;
    ev.preventDefault(); demande(g, () => { location.href = a.href; }); });
  const ici = G[document.documentElement.dataset.fiche];
  if (ici && !ouvert(ici.h)) { document.documentElement.classList.add("verrou"); demande(ici, () => document.documentElement.classList.remove("verrou"), true); }
  marque();
})();
</script>"""

PIECES = [
  ("1", "p01", "Entailles et rainure", "fiche01",
   "<p><b>Données :</b> la vue de face ; la vue de droite, la vue de gauche et la vue de dessus incomplètes d’un bloc entaillé et rainuré.</p>"
   "<p><b>Exercice :</b> 1) Reconnaissez les 4 vues dessinées. 2) Terminez les vues de gauche, de droite et de dessus. 3) Repassez en couleur, sur toutes les vues, l’arête repérée sur la perspective.</p>"),
  ("2", "p02", "Équerre à chapeau", "fiche02",
   "<p><b>Données :</b> la vue de face et la vue de gauche incomplètes, l’amorce de la vue de dessus d’une équerre à chapeau.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de dessus. 2) Esquisser les détails sur toutes les vues. 3) Faire la mise au net. 4) Repasser en couleur les arêtes repérées sur la perspective.</p>"),
  ("3", "p03", "Bride ouverte à nez « Norelem »", "fiche03",
   "<p><b>Données :</b> la vue de face et la vue de dessus incomplètes, l’amorce de la vue de gauche d’une bride ouverte.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de gauche. 2) Esquisser les différents détails sur les trois vues. 3) Faire la mise au net. 4) Repasser en couleur les arêtes repérées sur la perspective.</p>"),
  ("4", "p04", "Butée réglable", "fiche04",
   "<p><b>Données :</b> la vue de face et la vue de dessus incomplètes ; l’amorce de la vue de droite d’une butée réglable.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de droite. 2) Esquisser les différents détails sur les trois vues. 3) Faire la mise au net. 4) Repasser en couleur les arêtes repérées sur la perspective.</p>"),
  ("5", "p05", "Porte-outil", "fiche05",
   "<p><b>Données :</b> la vue de face, la vue de gauche et la vue de dessus incomplètes d’un porte-outil d’étau-limeur.</p>"
   "<p><b>Exercice :</b> 1) Esquisser les détails sur toutes les vues. 2) Faire la mise au net.</p>"),
  ("6", "p06", "Bride de serrage", "fiche06",
   "<p><b>Données :</b> la vue de face, la vue de dessus incomplètes, l’amorce de la vue de droite d’une bride de serrage.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de droite. 2) Esquisser les détails sur toutes les vues. 3) Faire la mise au net. 4) Repasser en couleur l’arête repérée sur la perspective.</p>"),
  ("7", "p07", "Vé de serrage", "fiche07",
   "<p><b>Données :</b> la vue de face, la vue de dessus incomplètes, l’amorce de la vue de gauche d’un vé de centrage.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de gauche. 2) Esquisser les détails sur toutes les vues. 3) Faire la mise au net. 4) Repasser en couleur l’arête repérée sur la perspective.</p>"),
  ("8", "p08", "Coulisseau", "fiche08",
   "<p><b>Données :</b> la vue de face, la vue de droite et la vue de dessus incomplètes d’un coulisseau.</p>"
   "<p><b>Exercice :</b> 1) Esquisser les détails sur toutes les vues. 2) Faire la mise au net.</p>"),
  ("9", "p09", "Chape", "fiche09",
   "<p><b>Données :</b> la vue de face, la vue de dessus et la vue de droite incomplètes d’une chape.</p>"
   "<p><b>Exercice :</b> 1) Esquisser les détails sur les trois vues. 2) Faire la mise au net.</p>"),
  ("10", "p10", "Semelle", "fiche10",
   "<p><b>Données :</b> la vue de face, la vue de gauche incomplètes, l’amorce de la vue de dessus d’une semelle.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de dessus. 2) Esquisser les détails sur toutes les vues. 3) Faire la mise au net. 4) Repasser en couleur l’arête repérée sur la perspective.</p>"),
  ("11", "p11", "Coulisseau orientable", "fiche11",
   "<p><b>Données :</b> la vue de face, la vue de dessus incomplètes, l’amorce de la vue de gauche d’une coulisse orientable.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de gauche. 2) Esquisser les détails sur toutes les vues. 3) Faire la mise au net.</p>"),
  ("12", "p12", "Entaille et plan incliné", "fiche12",
   "<p><b>Données :</b> la vue de face, la vue de gauche incomplètes, l’amorce de la vue de dessus d’une butée.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de dessus. 2) Esquisser les détails sur toutes les vues. 3) Faire la mise au net. "
   "4) Repérer les points (1), (2) et (3). Repasser en couleur, sur les trois vues, les arêtes repérées sur la perspective.</p>"),
  ("13 A", "p13a", "Plats sur cylindre", "fiche13a",
   "<p><b>Terminer</b> la vue de face et la vue de dessus de ce cylindre.</p><p>Repasser en couleur, sur les 3 vues, les arêtes repérées sur la perspective.</p>"),
  ("13 B", "p13b", "Cylindre entaillé", "fiche13b",
   "<p><b>Terminer</b> la vue de face et la vue de dessus de ce cylindre.</p><p>Repasser en couleur, sur les 3 vues, l’arête repérée sur la perspective.</p>"),
  ("14", "p14", "Pièce tournée et fraisée", "fiche14",
   "<p>La vue de face, la vue de gauche et la vue de dessus de cette pièce tournée et fraisée sont incomplètes. "
   "Le fraisage du méplat et de la rainure ont déterminé des intersections.</p><p><b>Terminer les 3 vues.</b> Repasser en couleur les arêtes repérées sur la perspective.</p>"),
  ("15", "p15", "Support orientable", "fiche15",
   "<p>La vue de face, la vue de gauche et la vue de dessus de ce support orientable sont incomplètes.</p>"
   "<p><b>Terminer les trois vues.</b> Repasser en couleur les arêtes repérées sur la perspective.</p>"),
  ("16", "p16", "Élément d’étau", "fiche16",
   "<p><b>Exercice :</b> Terminer les trois vues de cet élément d’étau (vue de gauche – coupe A-A).</p>"),
  ("17", "p17", "Bride de serrage (à fourche)", "fiche17",
   "<p><b>Données :</b> la vue de face et la vue de dessus incomplètes, l’axe de la vue de droite d’une bride de serrage.</p>"
   "<p><b>Exercice :</b> 1) Esquisser le rectangle capable de la vue de droite. 2) Esquisser les détails sur toutes les vues. 3) Faire la mise au net, vue de face coupe A-A. 4) Désigner le plan de coupe et la vue en coupe.</p>"),
  ("18", "p18", "Étrier", "fiche18",
   "<p><b>Données :</b> la vue de face, la vue de droite et la vue de dessus incomplètes d’un étrier.</p>"
   "<p><b>Exercice :</b> terminer les trois vues ; vue de droite (coupe A-A). Désigner le plan de coupe et la vue en coupe.</p>"),
  ("19", "p19", "Coulisseau de mors mobile d’étau", "fiche19",
   "<p><b>Données :</b> la vue de face, la vue de gauche et la vue de dessus incomplètes d’un coulisseau de mors d’étau.</p>"
   "<p><b>Exercice :</b> 1) Terminer l’esquisse des trois vues. 2) Faire la mise au net ; vue de face, coupe A-A.</p>"),
  ("20", "p20", "Équerre porte-butée réglable", "fiche20",
   "<p><b>Données :</b> la vue de face, la vue de gauche et la vue de dessus incomplètes d’une équerre porte-butée réglable.</p>"
   "<p><b>Exercice :</b> terminer les trois vues : vue de face (coupe A-A). Désigner la vue en coupe et terminer la désignation des plans de coupe parallèles.</p>"),
]
# fiches présentes : celles dont la définition (pXX.js) existe encore (après un ménage --eleves, seulement celles-là)
PRESENTES = {int(p[3][5:7]) for p in PIECES if (here / f"{p[1]}.js").exists()}
if SEL is None: SEL_SITE = PRESENTES if len(PRESENTES) < 20 else None
else: SEL_SITE = SEL
garde = lambda fname: SEL_SITE is None or int(fname[5:7]) in SEL_SITE
PIECES = [p for p in PIECES if garde(p[3])]
def lien(i, sens):
    # sens = -1 : fiche précédente, +1 : fiche suivante
    j = i + sens
    fl = "←" if sens < 0 else "→"
    txt = "Fiche précédente" if sens < 0 else "Fiche suivante"
    if not 0 <= j < len(PIECES):
        return f'<span aria-hidden="true">{fl} {txt}</span>'
    n, _, nm, fn, _ = PIECES[j]
    corps = f'<b>{E(n)}.</b> {E(nm)}'
    return (f'<a href="{fn}.html" rel="prev" title="{txt}">{fl} {corps}</a>' if sens < 0
            else f'<a href="{fn}.html" rel="next" title="{txt}">{corps} {fl}</a>')

for i, (num, js, name, fname, consigne) in enumerate(PIECES):
    page = (engine.replace("{{TITLE}}", E(name))
                  .replace("{{PAGER}}", lien(i, -1) + lien(i, +1))
                  .replace("{{DESCRIPTION}}", E(f"Fiche {num} de dessin technique : {name}. Vues en projection européenne, traits de construction au survol et pièce en 3D."))
                  .replace("{{NUM}}", E(num)).replace("{{NAME}}", E(name))
                  .replace("{{CONSIGNE}}", consigne)
                  .replace("{{PIECE_JS}}", (here / f"{js}.js").read_text())
                  .replace('<html lang="fr">', f'<html lang="fr" data-fiche="{fname[:7]}">', 1)
                  .replace("</body>", acces_script() + "\n</body>"))
    (out / f"{fname}.html").write_text(page)
    print("écrit", fname + ".html")

# ---------------------------------------------------------------------
# Sommaire du cahier (index.html) + copie des PDF
# ---------------------------------------------------------------------
pdfdir = out / "pdf"; pdfdir.mkdir(exist_ok=True)
for f in ["fiche01","fiche02","fiche03","fiche04","fiche05","fiche06","fiche07","fiche08","fiche09","fiche10","fiche11","fiche12","fiche13","fiche14","fiche15","fiche16","fiche17","fiche18","fiche19","fiche20"]:
    if not garde(f): continue
    src = next((p for p in (here.parent / f"{f}.pdf", here.parent / "tikz" / f"{f}.pdf") if p.exists()), None)
    if src: shutil.copy(src, pdfdir / f"{f}.pdf")
    elif not (pdfdir / f"{f}.pdf").exists(): print("PDF introuvable :", f)
CARDS = [
  ("1","Entailles et rainure","Prisme entaillé : reconnaître les quatre vues et les compléter.",[("fiche01.html","Figure interactive")],"fiche01"),
  ("2","Équerre à chapeau","Équerre en L posée sur une semelle plus large.",[("fiche02.html","Figure interactive")],"fiche02"),
  ("3","Bride ouverte à nez « Norelem »","Nez chanfreiné, pans à 45° et fente oblongue ouverte.",[("fiche03.html","Figure interactive")],"fiche03"),
  ("4","Butée réglable","Montant percé avec tenon, semelle à bout pointu.",[("fiche04.html","Figure interactive")],"fiche04"),
  ("5","Porte-outil","Plaque à dessus arrondi, bloc rainuré et trou débouchant.",[("fiche05.html","Figure interactive")],"fiche05"),
  ("6","Bride de serrage","Talon avec congé et chanfrein, biseaux et lumière oblongue.",[("fiche06.html","Figure interactive")],"fiche06"),
  ("7","Vé de serrage","Vé à 90° avec dégagement, gradin et deux rainures en U.",[("fiche07.html","Figure interactive")],"fiche07"),
  ("8","Coulisseau","Gradin arrière, tenon en contre-dépouille, fente en U et rainure.",[("fiche08.html","Figure interactive")],"fiche08"),
  ("9","Chape","Bouts arrondis, fourche fendue, congé et deux trous.",[("fiche09.html","Figure interactive")],"fiche09"),
  ("10","Semelle","Pans inclinés, portée demi-cylindrique et boutonnière lamée.",[("fiche10.html","Figure interactive")],"fiche10"),
  ("11","Coulisseau orientable","Lamage en U, perçage, trou horizontal et chanfreins.",[("fiche11.html","Figure interactive")],"fiche11"),
  ("12","Entaille et plan incliné","Butée : repérer les points 1, 2, 3 et les arêtes rouge et bleue.",[("fiche12.html","Figure interactive")],"fiche12"),
  ("13","Intersection cylindre-plan","Deux exercices sur la même fiche : plats sur cylindre, cylindre entaillé.",
   [("fiche13a.html","A · Plats sur cylindre"),("fiche13b.html","B · Cylindre entaillé")],"fiche13"),
  ("14","Pièce tournée et fraisée","Méplat et rainure fraisés sur une pièce de révolution.",[("fiche14.html","Figure interactive")],"fiche14"),
  ("15","Support orientable","Congé, dessous cylindrique et rainure traversante.",[("fiche15.html","Figure interactive")],"fiche15"),
  ("16","Élément d’étau","Chanfrein, encoche, rainure et trou ; vue de gauche en coupe A-A.",[("fiche16.html","Figure interactive")],"fiche16"),
  ("17","Bride de serrage (à fourche)","Talon, lumière, fourche et bossage percé ; vue de face en coupe A-A.",[("fiche17.html","Figure interactive")],"fiche17"),
  ("18","Étrier","Fente, dessus arrondi, queue cylindrique et deux trous ; vue de droite en coupe A-A.",[("fiche18.html","Figure interactive")],"fiche18"),
  ("19","Coulisseau de mors mobile d’étau","Semelle à pans coupés, rainure et trous lamés ; vue de face en coupe A-A.",[("fiche19.html","Figure interactive")],"fiche19"),
  ("20","Équerre porte-butée réglable","Bras incliné à bossage, semelle dégagée ; coupe A-A à deux plans parallèles.",[("fiche20.html","Figure interactive")],"fiche20"),
]
CARDS = [c for c in CARDS if garde(c[4])]
cards = "\n".join(
  f'''    <li class="card"><span class="num">{n}</span><div class="body"><h2>{E(t)}</h2><p>{E(desc)}</p>
      <div class="links">{"".join(f'<a class="go" href="{h}">{E(l)}</a>' for h,l in links)}<a class="pdf" href="pdf/{pdf}.pdf">Fiche PDF · énoncé + corrigé</a></div></div></li>'''
  for n,t,desc,links,pdf in CARDS)
STYLE = """<style>
/* Layout : sommaire en une colonne de fiches numérotées, comme la table d'un cahier d'exercices. */
:root{--bg:#eef0ee;--surface:#fff;--fg:#1c2421;--muted:#5d6b65;--line:#cdd4d0;--hl:#e07800;--chip:#e3e8e5;
  --f-display:"Barlow Condensed","Arial Narrow",Arial,sans-serif;--f-body:"Barlow","Segoe UI",Arial,sans-serif}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#151a18;--surface:#1e2522;--fg:#e7ece9;--muted:#9fada7;--line:#33403b;--hl:#ff9a2e;--chip:#2a3330;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#151a18;--surface:#1e2522;--fg:#e7ece9;--muted:#9fada7;--line:#33403b;--hl:#ff9a2e;--chip:#2a3330;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--f-body);font-size:16px;line-height:1.45;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 40px}
.wrap{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
h1{font-family:var(--f-display);font-weight:700;font-size:2.4rem;text-transform:uppercase;letter-spacing:.02em;margin:0;line-height:1;text-wrap:balance}
.lead{color:var(--muted);margin:6px 0 0;max-width:65ch}
ul.list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.card{display:grid;grid-template-columns:64px minmax(0,1fr);gap:14px;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px}
.num{font-family:var(--f-display);font-weight:700;font-size:2.2rem;line-height:1;color:var(--hl);font-variant-numeric:tabular-nums}
.card h2{font-family:var(--f-display);font-weight:600;font-size:1.35rem;text-transform:uppercase;letter-spacing:.03em;margin:0}
.card p{margin:2px 0 10px;color:var(--muted)}
.links{display:flex;flex-wrap:wrap;gap:8px}
.links a{font-weight:600;text-decoration:none;border-radius:6px;padding:6px 12px;color:var(--fg);background:var(--chip)}
.links a.go{background:var(--hl);color:#fff}
.links a:focus-visible{outline:2px solid var(--hl);outline-offset:2px}
footer{color:var(--muted);font-size:.86rem}
</style>"""
BODY = f"""<div class="wrap">
  <header><h1>Cahier de dessin technique</h1>
  <p class="lead">{"Fiches 1 à 20" if SEL_SITE is None else "Fiches"} en projection européenne. Chaque figure interactive montre les traits de construction au survol, le corrigé et la pièce en 3D ; la fiche PDF reprend l’énoncé et le corrigé à l’échelle indiquée sur la fiche.</p></header>
  <ul class="list">
{cards}
  </ul>
  <footer>Les pages fonctionnent hors ligne ; seule la vue 3D a besoin d’Internet (bibliothèque three.js).</footer>
</div>"""
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap">'
(out / "index.html").write_text(f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cahier de dessin technique</title>
{FONTS}
<style>*,*::before,*::after{{box-sizing:border-box}} body{{margin:0}}</style>
{STYLE}
</head>
<body>
{BODY}
{acces_script()}
</body>
</html>
""")
# version « fragment » pour la publication en artefact
if SEL_SITE is None: (here / "index_artefact.html").write_text(f"""<title>Cahier de dessin technique</title>
<meta name="claude:viewport-fit-sides" content="cover">
{FONTS}
{STYLE}
{BODY}
""")
print("écrit index.html")

# ---------------------------------------------------------------------
# Version élèves : ménage de TOUS les fichiers des fiches non retenues
# ---------------------------------------------------------------------
if SEL is not None:
    import re
    racine = here.parent
    tikz = racine / "tikz" if (racine / "tikz").is_dir() else racine
    motifs = [(out, r"fiche(\d\d)[ab]?\.html"), (pdfdir, r"fiche(\d\d)\.pdf"), (here, r"p(\d\d)[ab]?\.js"),
              (tikz, r"fiche(\d\d)\.(tex|pdf|aux|log)"), (tikz / "extras", r"x(\d\d)\.tex"),
              (tikz / "orig", r"o(\d\d)[ab]?\.tex"), (tikz / "rendu", r"fiche(\d\d)[ab]?(_brut)?\.png")]
    for dossier, motif in motifs:
        if not dossier.is_dir(): continue
        for p in sorted(dossier.iterdir()):
            m = re.fullmatch(motif, p.name)
            if m and int(m.group(1)) not in SEL:
                p.unlink(); print("supprimé", p.relative_to(racine))
    if (here / "index_artefact.html").exists(): (here / "index_artefact.html").unlink()
    print("Il ne reste plus que les fiches", ", ".join(str(n) for n in sorted(SEL)))
