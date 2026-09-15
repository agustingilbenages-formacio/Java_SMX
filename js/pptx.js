/* ============================================================
   JAVA EN 3 HORES · pptx.js
   Material creat per Agustín Gil - IES La vereda 2026 · CC BY-NC 4.0
   Genera automàticament la presentació llegint la teoria del DOM.
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const btn = $('#btnPptx');
  if (!btn) return;

  const C = {
    fosc: '0A1226', fosc2: '101C36', tinta: '12244A', gris: '51617F',
    blau: '2F7BFF', cian: '0AA8CC', cianClar: '35D6FF', taronja: 'E4692B',
    clar: 'F7F9FC', blanc: 'FFFFFF', vora: 'CDD6E8', verd: '0F9D63'
  };
  const FONT_T = 'Trebuchet MS';
  const FONT_C = 'Calibri';
  const AUTORIA = 'Material creat per Agustín Gil - IES La vereda 2026';
  const LLICENCIA = 'Llicència Creative Commons Reconeixement-NoComercial 4.0 Internacional (CC BY-NC 4.0)';

  /* ---------- Conversió d'imatges per a les diapositives ---------- */
  function svgAPng(svg) {
    return new Promise((res) => {
      try {
        const vb = svg.viewBox && svg.viewBox.baseVal;
        if (!vb || !vb.width) return res(null);
        const xml = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const timer = setTimeout(() => res(null), 4000);
        img.onload = () => {
          try {
            const escala = 2;
            const canvas = document.createElement('canvas');
            canvas.width = vb.width * escala;
            canvas.height = vb.height * escala;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f7f9ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            clearTimeout(timer);
            res({ data: canvas.toDataURL('image/png'), w: vb.width, h: vb.height });
          } catch (e) { clearTimeout(timer); res(null); }
        };
        img.onerror = () => { clearTimeout(timer); res(null); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      } catch (e) { res(null); }
    });
  }

  function imgAPng(imatge) {
    return new Promise((res) => {
      try {
        fetch(imatge.src).then((r) => {
          if (!r.ok) throw new Error('http');
          return r.blob();
        }).then((blob) => new Promise((r2) => {
          const fr = new FileReader();
          fr.onload = () => r2(fr.result);
          fr.onerror = () => r2(null);
          fr.readAsDataURL(blob);
        })).then((data) => {
          if (!data) return res(null);
          const probe = new Image();
          probe.onload = () => res({ data, w: probe.naturalWidth, h: probe.naturalHeight });
          probe.onerror = () => res(null);
          probe.src = data;
        }).catch(() => res(null));
      } catch (e) { res(null); }
    });
  }

  /* ---------- Mini-tokenitzador per a acolorir el codi ---------- */
  const CLAUS = 'abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|volatile|while|true|false|null';
  const TIPUS = 'void|int|long|double|float|char|boolean|byte|short|String|Scanner|Random|ArrayList|Arrays|Math|System|Object';
  const PATRO = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)|("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')|\\b(' + CLAUS + ')\\b|\\b(' + TIPUS + ')\\b|(\\b\\d+(?:\\.\\d+)?[fFdDlL]?\\b)|([A-Za-z_$][\\w$]*(?=\\s*\\())', 'g');

  function runsDeCodi(codi) {
    const colors = { c: '5C6F93', s: 'FFC86B', k: '6EA8FF', t: '3DDC97', n: 'FF9D6B', f: 'C792EA' };
    const runs = [];
    let ultim = 0, m;
    PATRO.lastIndex = 0;
    while ((m = PATRO.exec(codi))) {
      if (m.index > ultim) runs.push({ text: codi.slice(ultim, m.index), options: { color: 'DBE6FF' } });
      const clau = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 't' : m[5] ? 'n' : 'f';
      runs.push({ text: m[0], options: { color: colors[clau], bold: clau === 'k' } });
      ultim = m.index + m[0].length;
    }
    if (ultim < codi.length) runs.push({ text: codi.slice(ultim), options: { color: 'DBE6FF' } });
    return runs;
  }

  /* ---------- Construcció del model de diapositives ---------- */
  function neteja(t) { return (t || '').replace(/\s+/g, ' ').trim(); }

  function construirModel(imatges) {
    const dias = [];
    let titolActual = '';

    function nova(titol) {
      const d = { tipus: 'contingut', titol: titol || titolActual, vinyetes: [], imatge: null };
      dias.push(d);
      return d;
    }
    function actual() { return dias[dias.length - 1]; }
    function calTancar() {
      const a = actual();
      return !a || a.tipus !== 'contingut' || a.imatge || a.vinyetes.length >= 6 ||
             a.vinyetes.join(' ').length > 620;
    }

    /* Portada */
    dias.push({ tipus: 'portada' });

    /* Índex */
    dias.push({
      tipus: 'index',
      items: [
        ['01', 'Introducció i fonaments: per què Java?'],
        ['02', 'Estructures de control: condicionals i bucles'],
        ['03', 'Estructures de dades i modularitat'],
        ['04', 'Una pinzellada de POO i IA'],
        ['🛠', 'Taller de pràctiques: test, programes i reptes']
      ]
    });

    const seccions = ['fonaments', 'control', 'dades', 'poo'].map((id) => document.getElementById(id)).filter(Boolean);

    seccions.forEach((sec) => {
      const num = neteja($('.bloc__num', sec).textContent);
      const titol = neteja($('h2', sec).textContent);
      const etik = neteja($('.bloc__etiqueta', sec).textContent);
      const intro = neteja($('.bloc__intro', sec).textContent);

      dias.push({ tipus: 'divisor', num, titol, etik, intro });
      titolActual = titol;

      const parts = sec.querySelectorAll('h3, ul[data-pptx], figure[data-pptx], .codi[data-pptx], table[data-pptx]');
      parts.forEach((el) => {
        if (el.tagName === 'H3') {
          titolActual = neteja(el.textContent);
          if (actual() && actual().tipus === 'contingut' && (actual().vinyetes.length || actual().imatge)) {
            nova(titolActual);
          } else if (!actual() || actual().tipus !== 'contingut') {
            nova(titolActual);
          } else {
            actual().titol = titolActual;
          }
          return;
        }
        if (el.tagName === 'UL') {
          const items = $$('li', el).map((li) => neteja(li.textContent)).filter(Boolean);
          let desti = actual();
          if (!desti || desti.tipus !== 'contingut' || desti.imatge) desti = nova(titolActual);
          items.forEach((it) => {
            if (desti.vinyetes.length >= 6 || desti.vinyetes.join(' ').length > 620) {
              desti = nova(titolActual + ' (cont.)');
            }
            desti.vinyetes.push(it);
          });
          return;
        }
        if (el.tagName === 'FIGURE') {
          const img = imatges.get(el);
          if (!img) return;
          const capcio = neteja($('figcaption', el) ? $('figcaption', el).textContent : '');
          const a = actual();
          if (a && a.tipus === 'contingut' && !a.imatge && a.vinyetes.length <= 3 && a.vinyetes.join(' ').length <= 300) {
            a.imatge = { ...img, capcio };
          } else {
            const d = nova(titolActual);
            d.imatge = { ...img, capcio };
          }
          return;
        }
        if (el.classList.contains('codi')) {
          dias.push({
            tipus: 'codi',
            titol: el.dataset.fitxer || 'Codi Java',
            codi: $('pre code', el) ? $('pre code', el).textContent : $('pre', el).textContent
          });
          return;
        }
        if (el.tagName === 'TABLE') {
          const files = $$('tr', el).map((tr) => $$('th,td', tr).map((cel) => neteja(cel.textContent)));
          dias.push({ tipus: 'taula', titol: titolActual, files });
        }
      });
    });

    /* Tancament */
    dias.push({
      tipus: 'final',
      vinyetes: [
        'Autoavaluació: 9 preguntes per a comprovar el nivell.',
        'Fes el programa: 7 exercicis guiats amb solució.',
        'Reptes plantejats: 6 casos reals per a calfar el cap.',
        'Recursos: glossari, instal·lació i llicència CC BY-NC 4.0.'
      ]
    });
    dias.push({ tipus: 'credits' });
    return dias;
  }

  /* ---------- Pintat de diapositives ---------- */
  function peuDiapositiva(pptx, s, fosc) {
    s.addText(AUTORIA + '  ·  CC BY-NC 4.0', {
      x: 0.5, y: 7.02, w: 9, h: 0.4, fontSize: 10, color: fosc ? '7C8DB0' : '8A94A6', fontFace: FONT_C
    });
    s.slideNumber = { x: 12.55, y: 7.02, w: 0.6, h: 0.4, fontSize: 10, color: fosc ? '7C8DB0' : '8A94A6', fontFace: FONT_C };
  }

  function ajustarImatge(img, capsa) {
    const rel = img.w / img.h;
    let w = capsa.w, h = w / rel;
    if (h > capsa.h) { h = capsa.h; w = h * rel; }
    return { x: capsa.x + (capsa.w - w) / 2, y: capsa.y + (capsa.h - h) / 2, w, h };
  }

  function pintar(pptx, d) {
    const s = pptx.addSlide();
    switch (d.tipus) {
      case 'portada': {
        s.background = { color: C.fosc };
        s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: C.blau } });
        s.addShape(pptx.ShapeType.rect, { x: 0.9, y: 1.15, w: 2.2, h: 0.06, fill: { color: C.cianClar } });
        s.addText('OPTATIVA SMX · INTRODUCCIÓ A LA PROGRAMACIÓ', {
          x: 0.9, y: 1.35, w: 11, h: 0.5, fontSize: 16, color: C.cianClar, fontFace: FONT_T, bold: true, charSpacing: 3
        });
        s.addText('Java en 3 hores', {
          x: 0.85, y: 2.1, w: 11.6, h: 1.6, fontSize: 60, color: C.blanc, fontFace: FONT_T, bold: true
        });
        s.addText('Masterclass intensiva: de la primera variable als objectes i la IA.', {
          x: 0.9, y: 3.7, w: 10.5, h: 0.7, fontSize: 24, color: 'B9C6E4', fontFace: FONT_C
        });
        s.addText(AUTORIA, { x: 0.9, y: 5.5, w: 11, h: 0.5, fontSize: 18, color: 'FF8A4C', fontFace: FONT_C, bold: true });
        s.addText(LLICENCIA, { x: 0.9, y: 6.05, w: 11, h: 0.4, fontSize: 12, color: '7C8DB0', fontFace: FONT_C });
        break;
      }
      case 'index': {
        s.background = { color: C.clar };
        s.addText('Índex de la sessió', { x: 0.7, y: 0.5, w: 11, h: 0.9, fontSize: 40, color: C.tinta, fontFace: FONT_T, bold: true });
        s.addShape(pptx.ShapeType.rect, { x: 0.78, y: 1.35, w: 1.6, h: 0.07, fill: { color: C.blau } });
        const runs = [];
        d.items.forEach((it, i) => {
          runs.push({ text: it[0] + '   ', options: { fontSize: 26, bold: true, color: C.blau, fontFace: FONT_T } });
          runs.push({ text: it[1], options: { fontSize: 26, color: C.tinta, fontFace: FONT_C, breakLine: i < d.items.length - 1, paraSpaceAfter: 22 } });
        });
        s.addText(runs, { x: 0.8, y: 1.9, w: 11.7, h: 4.8, valign: 'top' });
        peuDiapositiva(pptx, s, false);
        break;
      }
      case 'divisor': {
        s.background = { color: C.fosc };
        s.addText(d.num, { x: 0.8, y: 1.5, w: 4, h: 2.6, fontSize: 120, color: C.cianClar, fontFace: FONT_T, bold: true });
        s.addText(d.etik.toUpperCase(), { x: 0.95, y: 3.9, w: 10, h: 0.5, fontSize: 16, color: 'FF8A4C', fontFace: FONT_T, bold: true, charSpacing: 3 });
        s.addText(d.titol, { x: 0.9, y: 4.4, w: 11.5, h: 1.2, fontSize: 40, color: C.blanc, fontFace: FONT_T, bold: true });
        if (d.intro) s.addText(d.intro, { x: 0.95, y: 5.6, w: 10.8, h: 1, fontSize: 16, color: '93A3C6', fontFace: FONT_C });
        s.addShape(pptx.ShapeType.rect, { x: 0.95, y: 3.55, w: 2.4, h: 0.06, fill: { color: C.blau } });
        break;
      }
      case 'contingut': {
        s.background = { color: C.clar };
        s.addShape(pptx.ShapeType.rect, { x: 0.62, y: 0.55, w: 0.12, h: 0.85, fill: { color: C.blau } });
        s.addText(d.titol, { x: 0.9, y: 0.5, w: 11.8, h: 0.95, fontSize: 32, color: C.tinta, fontFace: FONT_T, bold: true, valign: 'middle' });
        const ambImatge = !!d.imatge;
        const bx = 0.75, bw = ambImatge ? 6.1 : 11.8;
        if (d.vinyetes.length) {
          const mida = d.vinyetes.length <= 4 ? 24 : d.vinyetes.length <= 6 ? 22 : 20;
          s.addText(d.vinyetes.map((v, i) => ({
            text: v,
            options: { bullet: { code: '2022', indent: 14 }, breakLine: i < d.vinyetes.length - 1, paraSpaceAfter: 14, color: C.gris }
          })), { x: bx, y: 1.7, w: bw, h: 5.2, fontSize: mida, color: C.tinta, fontFace: FONT_C, valign: 'top', lineSpacingMultiple: 1.02 });
        }
        if (ambImatge) {
          const pos = ajustarImatge(d.imatge, { x: 7.05, y: 1.7, w: 5.75, h: d.imatge.capsio ? 4.7 : 5.2 });
          s.addImage({ data: d.imatge.data, x: pos.x, y: pos.y, w: pos.w, h: pos.h });
          if (d.imatge.capsio) {
            s.addText(d.imatge.capsio, { x: 7.0, y: 6.5, w: 5.9, h: 0.5, fontSize: 12, color: '8A94A6', fontFace: FONT_C, align: 'center' });
          }
        }
        peuDiapositiva(pptx, s, false);
        break;
      }
      case 'codi': {
        s.background = { color: C.fosc2 };
        s.addText('💻 ' + d.titol, { x: 0.7, y: 0.45, w: 11.9, h: 0.8, fontSize: 28, color: C.blanc, fontFace: FONT_T, bold: true });
        const linies = d.codi.split('\n').length;
        const mida = linies <= 12 ? 16 : linies <= 18 ? 14 : 12;
        s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.45, w: 12.1, h: 5.5, rectRadius: 0.12, fill: { color: '0B1120' }, line: { color: '24345C', width: 1 } });
        const runs = runsDeCodi(d.codi);
        runs.forEach((r) => { r.options.fontFace = 'Consolas'; r.options.fontSize = mida; });
        s.addText(runs, { x: 0.9, y: 1.65, w: 11.5, h: 5.1, valign: 'top', lineSpacingMultiple: 1.0 });
        peuDiapositiva(pptx, s, true);
        break;
      }
      case 'taula': {
        s.background = { color: C.clar };
        s.addShape(pptx.ShapeType.rect, { x: 0.62, y: 0.55, w: 0.12, h: 0.85, fill: { color: C.taronja } });
        s.addText(d.titol, { x: 0.9, y: 0.5, w: 11.8, h: 0.95, fontSize: 32, color: C.tinta, fontFace: FONT_T, bold: true });
        const files = d.files.map((fila, fi) => fila.map((cel) => ({
          text: cel,
          options: fi === 0
            ? { bold: true, color: 'FFFFFF', fill: { color: '123C8C' }, fontSize: 16, fontFace: FONT_T }
            : { color: C.tinta, fill: { color: fi % 2 ? 'FFFFFF' : 'EAF0FB' }, fontSize: 14, fontFace: FONT_C }
        })));
        s.addTable(files, { x: 0.6, y: 1.7, w: 12.1, border: { type: 'solid', pt: 1, color: C.vora }, colW: d.files[0].length === 2 ? [4.2, 7.9] : [2.2, 4.2, 3.6, 2.1], rowH: 0.55, valign: 'middle', margin: 6 });
        peuDiapositiva(pptx, s, false);
        break;
      }
      case 'final': {
        s.background = { color: C.fosc };
        s.addText('I ara… a practicar!', { x: 0.8, y: 1.2, w: 11.7, h: 1.2, fontSize: 48, color: C.blanc, fontFace: FONT_T, bold: true });
        s.addShape(pptx.ShapeType.rect, { x: 0.9, y: 2.5, w: 2.4, h: 0.07, fill: { color: C.cianClar } });
        s.addText(d.vinyetes.map((v, i) => ({
          text: v,
          options: { bullet: { code: '25B8', indent: 14 }, breakLine: i < d.vinyetes.length - 1, paraSpaceAfter: 20, color: 'B9C6E4' }
        })), { x: 0.9, y: 3.0, w: 11.4, h: 3.4, fontSize: 26, color: C.blanc, fontFace: FONT_C, valign: 'top' });
        peuDiapositiva(pptx, s, true);
        break;
      }
      case 'credits': {
        s.background = { color: C.fosc };
        s.addShape(pptx.ShapeType.rect, { x: 0, y: 3.4, w: 13.33, h: 0.05, fill: { color: C.blau } });
        s.addText(AUTORIA, { x: 1, y: 2.6, w: 11.3, h: 0.8, fontSize: 30, color: C.blanc, fontFace: FONT_T, bold: true, align: 'center' });
        s.addText(LLICENCIA, { x: 1.5, y: 3.9, w: 10.3, h: 0.9, fontSize: 16, color: '93A3C6', fontFace: FONT_C, align: 'center' });
        s.addText('creativecommons.org/licenses/by-nc/4.0/deed.ca', { x: 1.5, y: 4.7, w: 10.3, h: 0.5, fontSize: 14, color: C.cianClar, fontFace: FONT_C, align: 'center' });
        break;
      }
    }
  }

  /* ---------- Botó principal ---------- */
  btn.addEventListener('click', async () => {
    if (typeof PptxGenJS === 'undefined') {
      const t = $('#toast');
      if (t) { t.textContent = '⚠️ No s’ha pogut carregar PptxGenJS: revisa la connexió a internet.'; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 3500); }
      return;
    }
    btn.disabled = true;
    const textOriginal = btn.innerHTML;
    btn.textContent = 'Muntant diapositives…';

    try {
      /* 1) Converteix tots els esquemes (SVG i imatges) de la teoria */
      const imatges = new Map();
      const figures = $$('figure[data-pptx]');
      for (const fig of figures) {
        const svg = $('svg', fig);
        const img = $('img', fig);
        const conv = svg ? await svgAPng(svg) : img ? await imgAPng(img) : null;
        if (conv) imatges.set(fig, conv);
      }

      /* 2) Construeix el model i pinta'l */
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'Agustín Gil';
      pptx.company = 'IES La Vereda';
      pptx.title = 'Java en 3 hores · Optativa SMX';
      pptx.subject = 'Introducció a la programació';

      const model = construirModel(imatges);
      model.forEach((d) => pintar(pptx, d));

      /* 3) Descarrega */
      await pptx.writeFile({ fileName: 'Java_en_3_hores_Optativa_SMX_Agustin_Gil.pptx' });
      const t = $('#toast');
      if (t) { t.textContent = '📽️ PowerPoint descarregat: ' + model.length + ' diapositives!'; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 4000); }
    } catch (err) {
      console.error('Error generant el PPTX:', err);
      const t = $('#toast');
      if (t) { t.textContent = '⚠️ S’ha produït un error en generar el PowerPoint.'; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 4000); }
    } finally {
      btn.disabled = false;
      btn.innerHTML = textOriginal;
    }
  });

  /* Exposat per a proves */
  window.JavaSMX = window.JavaSMX || {};
  window.JavaSMX.construirModel = construirModel;
  window.JavaSMX.runsDeCodi = runsDeCodi;
  window.JavaSMX.pintar = pintar;
})();
