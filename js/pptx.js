/* ============================================================
   INTRODUCCIÓ A LA PROGRAMACIÓ AMB JAVA · pptx.js
   Material creat per Agustín Gil - IES La vereda 2026 · CC BY-NC 4.0
   Generador genèric de PowerPoint: llig el DOM de la pàgina
   (portada del curs o qualsevol temaN.html) i munta una
   presentació per a classe: lletra gran, bullet points, codi
   gran i esquemes/imatges a la diapositiva que els toca.
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const btn = $('#btnPptx');
  if (!btn) return;

  const C = {
    fosc: '0A1226', fosc2: '101C36', tinta: '12244A', gris: '3D4E70',
    blau: '1D5DE8', cianClar: '55D0F0', taronja: 'E8681A',
    clar: 'F7F9FC', blanc: 'FFFFFF', vora: 'CDD6E8'
  };
  const FONT_T = 'Trebuchet MS';
  const FONT_C = 'Calibri';
  const AUTORIA = 'Material creat per Agustín Gil - IES La vereda 2026';
  const LLICENCIA = 'Llicència Creative Commons Reconeixement-NoComercial 4.0 Internacional (CC BY-NC 4.0)';

  function neteja(t) { return (t || '').replace(/\s+/g, ' ').trim(); }

  /* ---------- Conversió d'imatges (SVG inline i <img>) ---------- */
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
            canvas.width = vb.width * escala; canvas.height = vb.height * escala;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f7f9ff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        fetch(imatge.src).then((r) => { if (!r.ok) throw new Error('http'); return r.blob(); })
          .then((blob) => new Promise((r2) => { const fr = new FileReader(); fr.onload = () => r2(fr.result); fr.onerror = () => r2(null); fr.readAsDataURL(blob); }))
          .then((data) => {
            if (!data) return res(null);
            const probe = new Image();
            probe.onload = () => res({ data, w: probe.naturalWidth, h: probe.naturalHeight });
            probe.onerror = () => res(null);
            probe.src = data;
          }).catch(() => res(null));
      } catch (e) { res(null); }
    });
  }

  /* ---------- Tokenitzador per a acolorir el codi ---------- */
  const CLAUS = 'abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|volatile|while|true|false|null';
  const TIPUS = 'void|int|long|double|float|char|boolean|byte|short|String|Scanner|Random|ArrayList|Arrays|Math|System|Object';
  const PATRO = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)|("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')|\\b(' + CLAUS + ')\\b|\\b(' + TIPUS + ')\\b|(\\b\\d+(?:\\.\\d+)?[fFdDlL]?\\b)|([A-Za-z_$][\\w$]*(?=\\s*\\())', 'g');

  function runsDeCodi(codi) {
    const colors = { c: '8FA3C8', s: 'FFCF87', k: '7FB0FF', t: '4CE0A5', n: 'FFA578', f: 'D5A6F5' };
    const runs = []; let ultim = 0, m;
    PATRO.lastIndex = 0;
    while ((m = PATRO.exec(codi))) {
      if (m.index > ultim) runs.push({ text: codi.slice(ultim, m.index), options: { color: 'E4ECFF' } });
      const clau = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 't' : m[5] ? 'n' : 'f';
      runs.push({ text: m[0], options: { color: colors[clau], bold: clau === 'k' } });
      ultim = m.index + m[0].length;
    }
    if (ultim < codi.length) runs.push({ text: codi.slice(ultim), options: { color: 'E4ECFF' } });
    return runs;
  }

  /* ---------- Model ---------- */
  function construirModel(imatges) {
    imatges = imatges || new Map();
    const dias = [];
    let titolActual = '';
    let actual = null;

    function nova(titol) {
      actual = { tipus: 'contingut', titol: titol || titolActual, vinyetes: [], imatge: null };
      dias.push(actual); return actual;
    }
    function vinyetesDe(items) {
      let desti = actual;
      if (!desti || desti.tipus !== 'contingut' || desti.imatge) desti = nova(titolActual);
      items.forEach((it) => {
        if (desti.vinyetes.length >= 6 || desti.vinyetes.join(' ').length > 620) desti = nova(titolActual + ' (cont.)');
        desti.vinyetes.push(it);
      });
    }

    /* Portada */
    const num = $('.tema-hero .hero__num');
    dias.push({
      tipus: 'portada',
      num: num ? 'TEMA ' + (neteja(num.textContent).replace(/\D+/g, '') || '?') : '',
      titol: neteja($('.hero h1') ? $('.hero h1').textContent : ''),
      sub: neteja($('.hero__sub') ? $('.hero__sub').textContent : ''),
      xips: $$('.hero__metes .xip').map((x) => neteja(x.textContent))
    });

    /* Índex */
    const seccions = $$('main section').filter((s) => $('h2', s));
    dias.push({ tipus: 'index', items: seccions.map((s, i) => [String(i + 1).padStart(2, '0'), neteja($('h2', s).textContent)]) });

    /* Recorregut */
    seccions.forEach((sec) => {
      const etik = $('.seccio__etiqueta', sec);
      const intro = $('.seccio__intro', sec);
      dias.push({
        tipus: 'divisor',
        num: neteja($('.bloc__num', sec) ? $('.bloc__num', sec).textContent : ''),
        titol: neteja($('h2', sec).textContent),
        etik: etik ? neteja(etik.textContent) : '',
        intro: intro ? neteja(intro.textContent) : ''
      });
      actual = null;
      titolActual = neteja($('h2', sec).textContent);

      sec.querySelectorAll('h3, [data-pptx], .cita').forEach((el) => {
        if (el.tagName === 'H3') {
          titolActual = neteja(el.textContent);
          if (actual && actual.tipus === 'contingut' && (actual.vinyetes.length || actual.imatge)) nova(titolActual);
          else if (!actual || actual.tipus !== 'contingut') nova(titolActual);
          else actual.titol = titolActual;
          return;
        }
        const cls = el.className && el.className.baseVal !== undefined ? '' : String(el.className);

        if (cls.includes('tema-card')) {
          dias.push({
            tipus: 'tema', num: el.dataset.num || '', titol: neteja($('.tema-card__titol', el).textContent),
            dur: el.dataset.dur || '', objectiu: neteja($('.tema-card__objectiu', el).textContent),
            vinyetes: $$('ul li', el).map((li) => neteja(li.textContent))
          });
          actual = null; return;
        }
        if (cls.includes('nubol')) { vinyetesDe($$('.tag', el).map((t) => neteja(t.textContent))); return; }
        if (cls.includes('torn')) {
          vinyetesDe($$('li', el).map((li) => {
            const temps = neteja($('.temps', li) ? $('.temps', li).textContent : '');
            return temps + ' — ' + neteja($('h4', li).textContent) + ': ' + neteja($('p', li).textContent);
          })); return;
        }
        if (cls.includes('principis')) {
          vinyetesDe($$('.principi', el).map((p) => neteja($('h4', p).textContent) + ': ' + neteja($('p', p).textContent))); return;
        }
        if (cls.includes('frases')) {
          vinyetesDe($$('.frase', el).map((f) => neteja(f.textContent))); return;
        }
        if (cls.includes('prohibit')) {
          vinyetesDe($$('span', el).map((s) => neteja(s.textContent)).concat(['«De moment no necessitem entendre esta part; ja arribarem més avant.»'])); return;
        }
        if (cls.includes('cita')) { dias.push({ tipus: 'cita', text: neteja(el.textContent) }); actual = null; return; }
        if (cls.includes('resum-grid')) {
          vinyetesDe($$('.resum-item', el).map((r) => neteja(r.textContent))); return;
        }
        if (cls.includes('errors-grid')) {
          vinyetesDe($$('.error-card', el).map((e) => neteja($('h4', e).textContent) + ' — ' + neteja(e.textContent.replace($('h4', e).textContent, '')))); return;
        }
        if (cls.includes('mini-ex')) { vinyetesDe($$('li', el).map((li) => neteja(li.textContent))); return; }
        if (el.tagName === 'UL' || el.tagName === 'OL') {
          vinyetesDe($$('li', el).map((li) => neteja(li.textContent))); return;
        }
        if (el.tagName === 'FIGURE') {
          const img = imatges.get(el); if (!img) return;
          const capcio = $('figcaption', el) ? neteja($('figcaption', el).textContent) : '';
          if (actual && actual.tipus === 'contingut' && !actual.imatge && actual.vinyetes.length <= 3 && actual.vinyetes.join(' ').length <= 300) {
            actual.imatge = { ...img, capcio };
          } else { const d = nova(titolActual); d.imatge = { ...img, capcio }; }
          return;
        }
        if (cls.includes('codi')) {
          const pre = $('pre code', el) || $('pre', el);
          dias.push({ tipus: 'codi', titol: el.dataset.fitxer || 'Codi Java', codi: pre.textContent });
          actual = null; return;
        }
        if (el.tagName === 'TABLE') {
          const files = $$('tr', el).map((tr) => $$('th,td', tr).map((cel) => neteja(cel.textContent)));
          dias.push({ tipus: 'taula', titol: titolActual, files });
          actual = null; return;
        }
      });
    });

    dias.push({ tipus: 'credits' });
    return dias;
  }

  /* ---------- Pintat ---------- */
  function peu(pptx, s, fosc) {
    s.addText(AUTORIA + '  ·  CC BY-NC 4.0', { x: 0.5, y: 7.02, w: 9, h: 0.4, fontSize: 10, color: fosc ? '93A3C6' : '6B7894', fontFace: FONT_C });
    s.slideNumber = { x: 12.55, y: 7.02, w: 0.6, h: 0.4, fontSize: 10, color: fosc ? '93A3C6' : '6B7894', fontFace: FONT_C };
  }
  function vinyetes(s, items, x, w) {
    s.addText(items.map((v, i) => ({
      text: v,
      options: { bullet: { code: '2022', indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: 12, color: C.gris }
    })), { x, y: 1.75, w, h: 5.1, fontSize: items.length <= 4 ? 24 : 20, color: C.tinta, fontFace: FONT_C, valign: 'top', lineSpacingMultiple: 1.02 });
  }
  function capcaleraDiapo(s, titol, colorBarra) {
    s.background = { color: C.clar };
    s.addShape('rect', { x: 0.62, y: 0.55, w: 0.12, h: 0.85, fill: { color: colorBarra || C.blau } });
    s.addText(titol, { x: 0.9, y: 0.5, w: 11.8, h: 0.95, fontSize: 32, color: C.tinta, fontFace: FONT_T, bold: true, valign: 'middle' });
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
        s.addShape('rect', { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: C.blau } });
        s.addShape('rect', { x: 0.9, y: 1.05, w: 2.2, h: 0.06, fill: { color: C.cianClar } });
        s.addText(d.num ? d.num + ' · OPTATIVA SMX' : 'OPTATIVA SMX · INTRODUCCIÓ A LA PROGRAMACIÓ', { x: 0.9, y: 1.25, w: 11, h: 0.5, fontSize: 16, color: C.cianClar, fontFace: FONT_T, bold: true, charSpacing: 3 });
        s.addText(d.titol, { x: 0.85, y: 1.95, w: 11.6, h: 1.7, fontSize: d.titol.length > 40 ? 44 : 54, color: C.blanc, fontFace: FONT_T, bold: true });
        s.addText(d.sub, { x: 0.9, y: 3.7, w: 10.6, h: 1.1, fontSize: 22, color: 'C6D2EA', fontFace: FONT_C });
        if (d.xips.length) {
          s.addText(d.xips.map((x, i) => ({ text: x, options: { breakLine: i < d.xips.length - 1, paraSpaceAfter: 8, color: '9FE0F5', bullet: { code: '25B8', indent: 12 } } })),
            { x: 0.95, y: 4.95, w: 10, h: 1.5, fontSize: 16, fontFace: FONT_C, valign: 'top' });
        }
        s.addText(AUTORIA, { x: 0.9, y: 6.3, w: 11, h: 0.45, fontSize: 16, color: 'FFAB73', fontFace: FONT_C, bold: true });
        s.addText(LLICENCIA, { x: 0.9, y: 6.75, w: 11, h: 0.4, fontSize: 11, color: '93A3C6', fontFace: FONT_C });
        break;
      }
      case 'index': {
        capcaleraDiapo(s, 'Índex');
        const runs = [];
        d.items.forEach((it, i) => {
          runs.push({ text: it[0] + '  ', options: { fontSize: 24, bold: true, color: C.blau, fontFace: FONT_T } });
          runs.push({ text: it[1], options: { fontSize: 24, color: C.tinta, fontFace: FONT_C, breakLine: i < d.items.length - 1, paraSpaceAfter: 16 } });
        });
        s.addText(runs, { x: 0.8, y: 1.8, w: 11.7, h: 5.1, valign: 'top' });
        peu(pptx, s, false);
        break;
      }
      case 'divisor': {
        s.background = { color: C.fosc };
        if (d.num) s.addText(d.num, { x: 0.8, y: 1.4, w: 4, h: 2.4, fontSize: 110, color: C.cianClar, fontFace: FONT_T, bold: true });
        s.addShape('rect', { x: 0.95, y: 3.5, w: 2.4, h: 0.06, fill: { color: C.blau } });
        if (d.etik) s.addText(d.etik.toUpperCase(), { x: 0.95, y: 3.8, w: 10, h: 0.5, fontSize: 16, color: 'FFAB73', fontFace: FONT_T, bold: true, charSpacing: 3 });
        s.addText(d.titol, { x: 0.9, y: 4.3, w: 11.5, h: 1.2, fontSize: 40, color: C.blanc, fontFace: FONT_T, bold: true });
        if (d.intro) s.addText(d.intro, { x: 0.95, y: 5.5, w: 10.8, h: 1, fontSize: 16, color: '93A3C6', fontFace: FONT_C });
        break;
      }
      case 'contingut': {
        capcaleraDiapo(s, d.titol);
        const ambImatge = !!d.imatge;
        if (d.vinyetes.length) vinyetes(s, d.vinyetes, 0.75, ambImatge ? 6.1 : 11.8);
        if (ambImatge) {
          const pos = ajustarImatge(d.imatge, { x: 7.05, y: 1.7, w: 5.75, h: d.imatge.capsio ? 4.7 : 5.2 });
          s.addImage({ data: d.imatge.data, x: pos.x, y: pos.y, w: pos.w, h: pos.h });
          if (d.imatge.capsio) s.addText(d.imatge.capsio, { x: 7.0, y: 6.5, w: 5.9, h: 0.5, fontSize: 12, color: '6B7894', fontFace: FONT_C, align: 'center' });
        }
        peu(pptx, s, false);
        break;
      }
      case 'tema': {
        s.background = { color: C.fosc };
        s.addText('TEMA ' + d.num, { x: 0.9, y: 0.7, w: 5, h: 0.7, fontSize: 24, color: C.cianClar, fontFace: FONT_T, bold: true, charSpacing: 3 });
        s.addText(d.titol, { x: 0.87, y: 1.35, w: 11.6, h: 1.1, fontSize: 40, color: C.blanc, fontFace: FONT_T, bold: true });
        s.addText('⏱ ' + String(d.dur).toUpperCase(), { x: 0.95, y: 2.5, w: 5, h: 0.5, fontSize: 16, color: 'FFAB73', fontFace: FONT_C, bold: true });
        s.addText(d.objectiu, { x: 0.95, y: 3.1, w: 11.4, h: 0.8, fontSize: 20, color: 'C6D2EA', fontFace: FONT_C, italic: true });
        s.addText(d.vinyetes.map((v, i) => ({ text: v, options: { bullet: { code: '2022', indent: 14 }, breakLine: i < d.vinyetes.length - 1, paraSpaceAfter: 12, color: 'B9C6E4' } })),
          { x: 0.95, y: 4.0, w: 11.4, h: 3.0, fontSize: 20, color: C.blanc, fontFace: FONT_C, valign: 'top' });
        peu(pptx, s, true);
        break;
      }
      case 'cita': {
        s.background = { color: C.fosc };
        s.addShape('rect', { x: 0.9, y: 2.4, w: 2.4, h: 0.07, fill: { color: C.cianClar } });
        s.addText('«' + d.text.replace(/«|»/g, '').slice(0, 220) + '»', { x: 1, y: 2.8, w: 11.3, h: 2.4, fontSize: 32, color: C.blanc, fontFace: FONT_T, bold: true, align: 'center', valign: 'middle' });
        peu(pptx, s, true);
        break;
      }
      case 'codi': {
        s.background = { color: C.fosc2 };
        s.addText('💻 ' + d.titol, { x: 0.7, y: 0.45, w: 11.9, h: 0.8, fontSize: 28, color: C.blanc, fontFace: FONT_T, bold: true });
        const linies = d.codi.split('\n').length;
        const mida = linies <= 12 ? 16 : linies <= 18 ? 14 : 12;
        s.addShape('roundRect', { x: 0.6, y: 1.45, w: 12.1, h: 5.5, rectRadius: 0.12, fill: { color: '0B1120' }, line: { color: '24345C', width: 1 } });
        const runs = runsDeCodi(d.codi);
        runs.forEach((r) => { r.options.fontFace = 'Consolas'; r.options.fontSize = mida; });
        s.addText(runs, { x: 0.9, y: 1.65, w: 11.5, h: 5.1, valign: 'top' });
        peu(pptx, s, true);
        break;
      }
      case 'taula': {
        capcaleraDiapo(s, d.titol, C.taronja);
        const nCols = d.files[0].length;
        const files = d.files.map((fila, fi) => fila.map((cel) => ({
          text: cel,
          options: fi === 0
            ? { bold: true, color: 'FFFFFF', fill: { color: '1D5DE8' }, fontSize: 16, fontFace: FONT_T }
            : { color: C.tinta, fill: { color: fi % 2 ? 'FFFFFF' : 'EAF0FB' }, fontSize: 14, fontFace: FONT_C }
        })));
        s.addTable(files, { x: 0.6, y: 1.7, w: 12.1, border: { type: 'solid', pt: 1, color: C.vora }, colW: nCols === 3 ? [1.6, 7.8, 2.7] : nCols === 2 ? [4.2, 7.9] : [2.4, 3.9, 3.6, 2.2], rowH: 0.5, valign: 'middle', margin: 6 });
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
      const imatges = new Map();
      for (const fig of $$('figure[data-pptx]')) {
        const svg = $('svg', fig); const img = $('img', fig);
        const conv = svg ? await svgAPng(svg) : img ? await imgAPng(img) : null;
        if (conv) imatges.set(fig, conv);
      }
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'Agustín Gil';
      pptx.company = 'IES La Vereda';
      pptx.title = document.title;
      const model = construirModel(imatges);
      model.forEach((d) => pintar(pptx, d));
      const nom = (document.body.dataset.pptxNom || 'Curs_Java_Optativa_SMX') + '_Agustin_Gil.pptx';
      await pptx.writeFile({ fileName: nom });
      const t = $('#toast');
      if (t) { t.textContent = '📽️ PowerPoint descarregat: ' + model.length + ' diapositives!'; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 4000); }
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
