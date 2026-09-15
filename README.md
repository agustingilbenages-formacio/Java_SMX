# Java_SMX · Java en 3 hores ☕

**Material creat per Agustín Gil - IES La vereda 2026**
Optativa SMX · Introducció a la programació — Masterclass intensiva d'una sola sessió (≈3 hores).
Llicència: [Creative Commons Reconeixement-NoComercial 4.0 Internacional (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/deed.ca)

## Què és

Una pàgina web autocontinguda (HTML + CSS + JS vanilla, sense cap framework que necessite Node)
pensada per a projectar-se a l'aula, estudiar-se a casa i exportar-se en dos formats docents:

- **📄 Imprimir PDF** — dossier de teoria en estil llibre de text (lletra gran, esquemes quadrats i
  al seu lloc, `@page { margin: 1cm; size: auto; }`), on només s'imprimeixen les 3 primeres
  preguntes del test; la resta del test, «Fes el programa» i els reptes queden ocults.
- **📽 Crear PowerPoint** — presentació `.pptx` generada automàticament llegint la teoria del DOM
  (PptxGenJS via CDN amb còpia local de reserva a `js/vendor/`): portada amb autor i llicència,
  índex, diapositives divisores, bullet points grans, taules, codi acolorit i tots els esquemes
  incrustats a la diapositiva que els toca.

## Contingut

1. **Introducció i fonaments** — per què Java, JVM/bytecode, variables, tipus, sintaxi, Scanner.
2. **Estructures de control** — `if`/`switch`, `for`/`while`/`do-while`, break/continue, diagrames de flux.
3. **Estructures de dades i modularitat** — arrays, for-each, ArrayList, mètodes.
4. **Una pinzellada de POO i IA** — classe/objecte, constructor, i com usar la IA com a copilot.
5. **Pràctiques** — tres pestanyes: autoavaluació (9 preguntes amb solució raonada),
   «Fes el programa» (7 exercicis amb pista i solució) i reptes sense solució (6 casos reals).

Extres: widget «Prediu l'eixida», tema clar/fosc, barra de progrés de lectura, scroll-reveal,
glossari i avís legal CC BY-NC 4.0.

## Com executar-la

No cal res: obri `index.html` al navegador (funciona també des d'un USB o servida amb
`python3 -m http.server`). La connexió a internet només fa falta per a les fonts i el CDN de
PptxGenJS (si falla, es carrega la còpia local de `js/vendor/`).

## Estructura

```
index.html            Pàgina única amb tota la teoria i els tallers
css/estils.css        Disseny premium + estils d'impressió (@media print)
js/app.js             Interacció: test, pestanyes, sintaxi, widgets, impressió
js/pptx.js            Generador del PowerPoint (llegix el DOM)
js/vendor/            PptxGenJS 4.0.1 (reserva fora de línia)
assets/img/           Imatges de capçalera i de la secció d'IA
```
