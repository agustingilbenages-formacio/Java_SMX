# Java_SMX · Introducció a la Programació amb Java ☕

**Material creat per Agustín Gil - IES La vereda 2026**
Optativa SMX · Introducció a la programació — curs complet per a alumnat de 16 anys que ix de zero.
Llicència: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.ca)

## El curs

- **Tema 0** (introducció motivadora) **+ 9 temes de 3 hores** ≈ 27 h lectives.
- Progressió molt gradual: variables → decisions → bucles → arrays → mètodes → objectes →
  programa complet → IA → futur. La POO no apareix fins que l'alumnat té eines per a entendre-la.
- Cada sessió de 3 h combina: explicació (30–45 min), programació guiada (60–75 min),
  exercicis (60–75 min) i repàs/autoavaluació/repte (15–30 min).

## Estat del material

`index.html` és la **portada-arquitectura** del curs: filosofia, torn de sessió, temari complet
(Tema 0–9), estructura fixa d'onze peces de cada tema i arquitectura de fitxers.
**Cap tema està desenvolupat encara**: cada tema es crearà a petició («Desenvolupa el Tema X»)
com a pàgina pròpia (`tema0.html` … `tema9.html`) amb teoria, exemples pas a pas, programació
guiada, mini exercicis, exercicis principals, repte, errors habituals, resum visual i les tres
sales d'activitats (autoavaluació de 9 preguntes, «Fes el programa» i reptes sense solució),
més els botons **Imprimir PDF** i **Crear PowerPoint** (PptxGenJS via CDN + còpia local).

## Execució

Sense Node ni frameworks: obri `index.html` al navegador o servisca la carpeta
(`python3 -m http.server`). Internet només cal per a fonts/CDN (hi ha reserva local).

## Estructura

```
index.html            Portada-arquitectura del curs
css/estils.css        Sistema de disseny compartit (clar per defecte, fosc opcional)
js/app.js             Interaccions comunes (tema, test, pestanyes, sintaxi, impressió)
js/pptx.js            Generador de PowerPoint llegint el DOM
js/vendor/            PptxGenJS 4.0.1 (reserva fora de línia)
assets/img/           Imatgeria
tema0.html…tema9.html Pàgines de tema, a petició
```
