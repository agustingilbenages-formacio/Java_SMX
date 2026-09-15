/* ============================================================
   INTRODUCCIÓ A LA PROGRAMACIÓ AMB JAVA · pptx.js
   Material creat per Agustín Gil - IES La vereda 2026 · CC BY-NC 4.0
   Genera la presentació del curs llegint el DOM de la pàgina.
   (En les futures pàgines de tema generarà la presentació del tema.)
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const btn = $('#btnPptx');
  if (!btn) return;

  const C = {
    fosc: '0A1226', fosc2: '101C36', tinta: '12244A', gris: '3D4E70',
    blau: '1D5DE8', cian: '0891B2', cianClar: '55D0F0', taronja: 'E8681A',
    clar: 'F7F9FC', blanc: 'FFFFFF', vora: 'CDD6E8', verd: '0C8A56'
  };
  const FONT_T = 'Trebuchet MS';
  const FONT_C = 'Calibri';
  const AUTORIA = 'Material creat per Agustín Gil - IES La vereda 2026';
  const LLICENCIA = 'Llicència Creative Commons Reconeixement-NoComercial 4.0 Internacional (CC BY-NC 4.0)';

  function neteja(t) { return (t || '').replace(/\s+/g, ' ').trim(); }

  /* ---------- Model ---------- */
  function construirModel() {
    const dias = [];

    /* Portada */
    dias.push({
      tipus: 'portada',
      titol: neteja($('.hero h1') ? $('.hero h1').textContent : 'Introducció a la Programació amb Java'),
      sub: neteja($('.hero__sub') ? $('.hero__sub').textContent : ''),
      xips: $$('.hero__metes .xip').map((x) => neteja(x.textContent))
    });

    /* Filosofia */
    const filos = $$('#curs .principi').map((p) => {
      const t = neteja($('h4', p) ? $('h4', p).textContent : '');
      const d = neteja($('p', p) ? $('p', p).textContent : '');
      return t + ': ' + d;
    });
    dias.push({ tipus: 'contingut', titol: 'Com entenem este curs', vinyetes: filos });
    const cites = $$('.cita');
    if (cites[0]) dias.push({ tipus: 'cita', text: neteja(cites[0].textContent) });

    /* Torn de 3 hores */
    const torn = $$('#curs .torn li').map((li) => {
      const temps = neteja($('.temps', li) ? $('.temps', li).textContent : '');
      const t = neteja($('h4', li) ? $('h4', li).textContent : '');
      const d = neteja($('p', li) ? $('p', li).textContent : '');
      return temps + ' — ' + t + ': ' + d;
    });
    dias.push({ tipus: 'contingut', titol: 'Una sessió de 3 hores, pas a pas', vinyetes: torn });

    /* Exemples propers */
    const tags = $$('#curs .nubol .tag').map((t) => neteja(t.textContent));
    if (tags.length) {
      dias.push({ tipus: 'contingut', titol: 'Exemples que parlen el seu idioma (1/2)', vinyetes: tags.slice(0, 7) });
      dias.push({ tipus: 'contingut', titol: 'Exemples que parlen el seu idioma (2/2)', vinyetes: tags.slice(7) });
    }

    /* Frases de classe */
    const frases = $$('#curs .frase').map((f) => neteja(f.textContent));
    if (frases.length) dias.push({ tipus: 'contingut', titol: 'A classe parlem així', vinyetes: frases });

    /* Temari: una diapositiva per tema */
    $$('#temari .tema-card').forEach((card) => {
      dias.push({
        tipus: 'tema',
        num: card.dataset.num || '',
        titol: neteja($('.tema-card__titol', card).textContent),
        dur: card.dataset.dur || '',
        objectiu: neteja($('.tema-card__objectiu', card).textContent),
        vinyetes: $$('ul li', card).map((li) => neteja(li.textContent))
      });
    });

    /* Ordre final del curs */
    const taulaOrdre = $('#temari table[data-pptx]');
    if (taulaOrdre) {
      const files = $$('tr', taulaOrdre).map((tr) => $$('th,td', tr).map((cel) => neteja(cel.textContent)));
      dias.push({ tipus: 'taula', titol: 'Ordre final del curs', files });
    }
    if (cites[1]) dias.push({ tipus: 'cita', text: neteja(cites[1].textContent) });

    /* Norma del codi */
    const proh = $$('#norma .prohibit span').map((s) => neteja(s.textContent));
    if (proh.length) {
      dias.push({
        tipus: 'contingut',
        titol: 'Res abans d’hora',
        vinyetes: proh.concat(['«De moment no necessitem entendre esta part; ja arribarem més avant.»'])
      });
    }

    /* Estructura fixa, en dues diapositives */
    const parts = $$('#estructura .estructura li').map((li) => {
      const b = neteja($('b', li) ? $('b', li).textContent : '');
      const d = neteja($('p', li) ? $('p', li).textContent : '');
      return b + ' ' + d;
    });
    dias.push({ tipus: 'contingut', titol: 'Cada tema, onze peces (1/2)', vinyetes: parts.slice(0, 6) });
    dias.push({ tipus: 'contingut', titol: 'Cada tema, onze peces (2/2)', vinyetes: parts.slice(6) });

    /* Activitats i exportació */
    const acts = $$('.bloc-act').map((b) => neteja($('h4', b).textContent) + ': ' + neteja($('p', b).textContent));
    acts.push('Imprimir PDF: manual docent amb lletra gran i només 3 preguntes del test.');
    acts.push('Crear PowerPoint: presentació automàtica per a projectar a l’aula.');
    dias.push({ tipus: 'contingut', titol: 'Activitats i botons de màgia', vinyetes: acts });

    /* Arquitectura */
    const arbre = $('#arquitectura pre code');
    if (arbre) dias.push({ tipus: 'codi', titol: 'Arquitectura del material', codi: arbre.textContent });

    dias.push({ tipus: 'credits' });
    return dias;
  }

  /* ---------- Pintat ---------- */
  function peu(pptx, s, fosc) {
    s.addText(AUTORIA + '  ·  CC BY-NC 4.0', { x: 0.5, y: 7.02, w: 9, h: 0.4, fontSize: 10, color: fosc ? '93A3C6' : '6B7894', fontFace: FONT_C });
    s.slideNumber = { x: 12.55, y: 7.02, w: 0.6, h: 0.4, fontSize: 10, color: fosc ? '93A3C6' : '6B7894', fontFace: FONT_C };
  }

  function vinyetes(s, items, x, w, mida) {
    s.addText(items.map((v, i) => ({
      text: v,
      options: { bullet: { code: '2022', indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: 12, color: C.gris }
    })), { x, y: 1.75, w, h: 5.1, fontSize: mida || (items.length <= 4 ? 24 : 20), color: C.tinta, fontFace: FONT_C, valign: 'top', lineSpacingMultiple: 1.02 });
  }

  function capcaleraDiapo(s, titol, colorBarra) {
    s.background = { color: C.clar };
    s.addShape('rect', { x: 0.62, y: 0.55, w: 0.12, h: 0.85, fill: { color: colorBarra || C.blau } });
    s.addText(titol, { x: 0.9, y: 0.5, w: 11.8, h: 0.95, fontSize: 32, color: C.tinta, fontFace: FONT_T, bold: true, valign: 'middle' });
  }

  function pintar(pptx, d) {
    const s = pptx.addSlide();
    switch (d.tipus) {
      case 'portada': {
        s.background = { color: C.fosc };
        s.addShape('rect', { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: C.blau } });
        s.addShape('rect', { x: 0.9, y: 1.15, w: 2.2, h: 0.06, fill: { color: C.cianClar } });
        s.addText('OPTATIVA SMX · INTRODUCCIÓ A LA PROGRAMACIÓ', { x: 0.9, y: 1.35, w: 11, h: 0.5, fontSize: 16, color: C.cianClar, fontFace: FONT_T, bold: true, charSpacing: 3 });
        s.addText(d.titol, { x: 0.85, y: 2.0, w: 11.6, h: 1.7, fontSize: 54, color: C.blanc, fontFace: FONT_T, bold: true });
        s.addText(d.sub, { x: 0.9, y: 3.75, w: 10.6, h: 1.1, fontSize: 22, color: 'C6D2EA', fontFace: FONT_C });
        if (d.xips && d.xips.length) {
          s.addText(d.xips.map((x, i) => ({ text: x, options: { breakLine: i < d.xips.length - 1, paraSpaceAfter: 8, color: '9FE0F5', bullet: { code: '25B8', indent: 12 } } })),
            { x: 0.95, y: 5.0, w: 10, h: 1.4, fontSize: 16, fontFace: FONT_C, valign: 'top' });
        }
        s.addText(AUTORIA, { x: 0.9, y: 6.3, w: 11, h: 0.45, fontSize: 16, color: 'FFAB73', fontFace: FONT_C, bold: true });
        s.addText(LLICENCIA, { x: 0.9, y: 6.75, w: 11, h: 0.4, fontSize: 11, color: '93A3C6', fontFace: FONT_C });
        break;
      }
      case 'cita': {
        s.background = { color: C.fosc };
        s.addShape('rect', { x: 0.9, y: 2.4, w: 2.4, h: 0.07, fill: { color: C.cianClar } });
        s.addText('«' + d.text.replace(/«|»/g, '') + '»', { x: 1, y: 2.8, w: 11.3, h: 2.4, fontSize: 36, color: C.blanc, fontFace: FONT_T, bold: true, align: 'center', valign: 'middle' });
        peu(pptx, s, true);
        break;
      }
      case 'contingut': {
        capcaleraDiapo(s, d.titol);
        vinyetes(s, d.vinyetes, 0.75, 11.8);
        peu(pptx, s, false);
        break;
      }
      case 'tema': {
        s.background = { color: C.fosc };
        s.addText('TEMA ' + d.num, { x: 0.9, y: 0.7, w: 5, h: 0.7, fontSize: 24, color: C.cianClar, fontFace: FONT_T, bold: true, charSpacing: 3 });
        s.addText(d.titol, { x: 0.87, y: 1.35, w: 11.6, h: 1.1, fontSize: 40, color: C.blanc, fontFace: FONT_T, bold: true });
        s.addText('⏱ ' + d.dur.toUpperCase(), { x: 0.95, y: 2.5, w: 5, h: 0.5, fontSize: 16, color: 'FFAB73', fontFace: FONT_C, bold: true });
        s.addText(d.objectiu, { x: 0.95, y: 3.1, w: 11.4, h: 0.8, fontSize: 20, color: 'C6D2EA', fontFace: FONT_C, italic: true });
        s.addText(d.vinyetes.map((v, i) => ({
          text: v,
          options: { bullet: { code: '2022', indent: 14 }, breakLine: i < d.vinyetes.length - 1, paraSpaceAfter: 12, color: 'B9C6E4' }
        })), { x: 0.95, y: 4.0, w: 11.4, h: 3.0, fontSize: 20, color: C.blanc, fontFace: FONT_C, valign: 'top' });
        peu(pptx, s, true);
        break;
      }
      case 'codi': {
        s.background = { color: C.fosc2 };
        s.addText('🗂 ' + d.titol, { x: 0.7, y: 0.45, w: 11.9, h: 0.8, fontSize: 28, color: C.blanc, fontFace: FONT_T, bold: true });
        s.addShape('roundRect', { x: 0.6, y: 1.45, w: 12.1, h: 5.5, rectRadius: 0.12, fill: { color: '0B1120' }, line: { color: '24345C', width: 1 } });
        s.addText([{ text: d.codi, options: { color: 'E4ECFF', fontFace: 'Consolas', fontSize: 16 } }], { x: 0.9, y: 1.7, w: 11.5, h: 5.0, valign: 'top' });
        peu(pptx, s, true);
        break;
      }
      case 'taula': {
        capcaleraDiapo(s, d.titol, C.taronja);
        const files = d.files.map((fila, fi) => fila.map((cel) => ({
          text: cel,
          options: fi === 0
            ? { bold: true, color: 'FFFFFF', fill: { color: '1D5DE8' }, fontSize: 18, fontFace: FONT_T }
            : { color: C.tinta, fill: { color: fi % 2 ? 'FFFFFF' : 'EAF0FB' }, fontSize: 16, fontFace: FONT_C }
        })));
        s.addTable(files, { x: 0.7, y: 1.75, w: 11.9, border: { type: 'solid', pt: 1, color: C.vora }, colW: [1.6, 7.6, 2.7], rowH: 0.44, valign: 'middle', margin: 6 });
        peu(pptx, s, false);
        break;
      }
      case 'credits': {
        s.background = { color: C.fosc };
        s.addShape('rect', { x: 0, y: 3.4, w: 13.33, h: 0.05, fill: { color: C.blau } });
        s.addText(AUTORIA, { x: 1, y: 2.6, w: 11.3, h: 0.8, fontSize: 30, color: C.blanc, fontFace: FONT_T, bold: true, align: 'center' });
        s.addText(LLICENCIA, { x: 1.5, y: 3.9, w: 10.3, h: 0.9, fontSize: 16, color: '93A3C6', fontFace: FONT_C, align: 'center' });
        s.addText('creativecommons.org/licenses/by-nc/4.0/deed.ca', { x: 1.5, y: 4.7, w: 10.3, h: 0.5, fontSize: 14, color: C.cianClar, fontFace: FONT_C, align: 'center' });
        break;
      }
    }
  }

  /* ---------- Botó ---------- */
  btn.addEventListener('click', async () => {
    if (typeof PptxGenJS === 'undefined') {
      const t = $('#toast');
      if (t) { t.textContent = '⚠️ No s’ha pogut carregar PptxGenJS: revisa la connexió.'; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 3500); }
      return;
    }
    btn.disabled = true;
    const original = btn.innerHTML;
    btn.textContent = 'Muntant diapositives…';
    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'Agustín Gil';
      pptx.company = 'IES La Vereda';
      pptx.title = 'Introducció a la Programació amb Java · Optativa SMX';

      const model = construirModel();
      model.forEach((d) => pintar(pptx, d));

      await pptx.writeFile({ fileName: 'Curs_Java_Optativa_SMX_Agustin_Gil.pptx' });
      const t = $('#toast');
      if (t) { t.textContent = '📽️ PowerPoint del curs descarregat: ' + model.length + ' diapositives!'; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 4000); }
    } catch (err) {
      console.error('Error generant el PPTX:', err);
      const t = $('#toast');
      if (t) { t.textContent = '⚠️ S’ha produït un error en generar el PowerPoint.'; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 4000); }
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });

  window.JavaSMX = window.JavaSMX || {};
  window.JavaSMX.construirModel = construirModel;
  window.JavaSMX.pintar = pintar;
})();
