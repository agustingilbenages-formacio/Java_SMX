/* ============================================================
   JAVA EN 3 HORES · app.js
   Material creat per Agustín Gil - IES La vereda 2026 · CC BY-NC 4.0
   Interacció: tema, revelat, pestanyes, test, widgets i sintaxi.
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2800);
  }

  /* ---------- Tema clar / fosc ---------- */
  const btnTema = $('#btnTema');
  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    try { localStorage.setItem('javasmx-tema', tema); } catch (e) { /* privació */ }
  }
  try {
    const guardat = localStorage.getItem('javasmx-tema');
    if (guardat === 'clar' || guardat === 'fosc') aplicarTema(guardat);
  } catch (e) { /* sense localStorage */ }
  if (btnTema) {
    btnTema.addEventListener('click', () => {
      const ara = document.documentElement.getAttribute('data-tema');
      aplicarTema(ara === 'fosc' ? 'clar' : 'fosc');
      toast(ara === 'fosc' ? '☀️ Tema clar activat' : '🌙 Tema fosc activat');
    });
  }

  /* ---------- Barra de progrés de lectura ---------- */
  const barra = $('#barraProgres');
  function actualitzaBarra() {
    if (!barra) return;
    const alt = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = (alt > 0 ? (window.scrollY / alt) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', actualitzaBarra, { passive: true });
  actualitzaBarra();

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entrades) => {
      entrades.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Scrollspy del menú ---------- */
  const enllacos = $$('.nav a[data-seccio]');
  if ('IntersectionObserver' in window && enllacos.length) {
    const spy = new IntersectionObserver((entrades) => {
      entrades.forEach((e) => {
        if (e.isIntersecting) {
          enllacos.forEach((a) => a.classList.toggle('actiu', a.dataset.seccio === e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    enllacos.map((a) => a.dataset.seccio).filter(Boolean).forEach((id) => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Menú mòbil ---------- */
  const menuMobil = $('#menuMobil'), nav = $('#nav');
  if (menuMobil && nav) {
    menuMobil.addEventListener('click', () => nav.classList.toggle('oberta'));
    nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') nav.classList.remove('oberta'); });
  }

  /* ---------- Pestanyes de pràctiques ---------- */
  const pestanyes = $$('.pestanya');
  pestanyes.forEach((tab) => {
    tab.addEventListener('click', () => {
      pestanyes.forEach((t) => {
        const actiu = t === tab;
        t.setAttribute('aria-selected', actiu ? 'true' : 'false');
        const panell = document.getElementById(t.getAttribute('aria-controls'));
        if (panell) panell.hidden = !actiu;
      });
    });
  });

  /* ---------- Ressaltat de sintaxi Java ---------- */
  const CLAUS = 'abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|volatile|while|true|false|null';
  const TIPUS = 'void|int|long|double|float|char|boolean|byte|short|String|Scanner|Random|ArrayList|Arrays|Math|System|Object';
  const PATRO = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)' +                      // 1 comentaris
    '|("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')' +          // 2 cadenes
    '|\\b(' + CLAUS + ')\\b' +                                     // 3 claus
    '|\\b(' + TIPUS + ')\\b' +                                     // 4 tipus
    '|(\\b\\d+(?:\\.\\d+)?[fFdDlL]?\\b)' +                         // 5 nombres
    '|([A-Za-z_$][\\w$]*(?=\\s*\\())',                             // 6 crides
    'g');

  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function tokenitzar(codi) {
    let html = '', ultim = 0, m;
    PATRO.lastIndex = 0;
    while ((m = PATRO.exec(codi))) {
      html += esc(codi.slice(ultim, m.index));
      const cls = m[1] ? 'tk-c' : m[2] ? 'tk-s' : m[3] ? 'tk-k' : m[4] ? 'tk-t' : m[5] ? 'tk-n' : 'tk-f';
      html += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
      ultim = m.index + m[0].length;
    }
    html += esc(codi.slice(ultim));
    return html;
  }
  window.JavaSMX = window.JavaSMX || {};
  window.JavaSMX.tokenitzar = tokenitzar;

  $$('.codi pre code').forEach((bloc) => {
    bloc.innerHTML = tokenitzar(bloc.textContent);
  });

  /* ---------- Botons «Copia» ---------- */
  $$('.codi__copia').forEach((boto) => {
    boto.addEventListener('click', async () => {
      const codi = boto.closest('.codi').querySelector('pre code');
      const text = codi.textContent;
      try {
        await navigator.clipboard.writeText(text);
        toast('📋 Codi copiat al porta-retalls');
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast('📋 Codi copiat al porta-retalls'); }
        catch (e2) { toast('No s’ha pogut copiar: selecciona el codi a mà'); }
        ta.remove();
      }
    });
  });

  /* ---------- Test d'autoavaluació ---------- */
  const preguntes = $$('#panell-test .pregunta');
  preguntes.forEach((preg) => {
    const solucio = parseInt(preg.dataset.solucio, 10);
    $$('.opcio', preg).forEach((op) => {
      op.addEventListener('click', () => {
        if (preg.classList.contains('mostrada')) return;
        $$('.opcio', preg).forEach((o) => o.classList.remove('seleccionada'));
        op.classList.add('seleccionada');
      });
    });
    const botoSol = $('.pregunta__boto', preg);
    if (botoSol) {
      botoSol.addEventListener('click', () => mostraSolucio(preg, solucio));
    }
  });

  function mostraSolucio(preg, solucio) {
    if (preg.classList.contains('mostrada')) return;
    preg.classList.add('mostrada');
    $$('.opcio', preg).forEach((op) => {
      const i = parseInt(op.dataset.i, 10);
      if (i === solucio) op.classList.add('es-correcta');
      else if (op.classList.contains('seleccionada')) op.classList.add('es-erronia');
    });
    const botoSol = $('.pregunta__boto', preg);
    if (botoSol) { botoSol.textContent = 'Solució mostrada ✔'; botoSol.disabled = true; }
  }

  const btnTotes = $('#btnTotesSolucions');
  if (btnTotes) {
    btnTotes.addEventListener('click', () => {
      preguntes.forEach((preg) => mostraSolucio(preg, parseInt(preg.dataset.solucio, 10)));
      toast('✅ Totes les solucions a la vista');
    });
  }
  const btnReinicia = $('#btnReiniciaTest');
  if (btnReinicia) {
    btnReinicia.addEventListener('click', () => {
      preguntes.forEach((preg) => {
        preg.classList.remove('mostrada');
        $$('.opcio', preg).forEach((o) => o.classList.remove('seleccionada', 'es-correcta', 'es-erronia'));
        const b = $('.pregunta__boto', preg);
        if (b) { b.textContent = 'Mostrar solució'; b.disabled = false; }
      });
      toast('🔄 Test reiniciat: altra volta!');
    });
  }

  /* ---------- Solucions plegables dels exercicis ---------- */
  $$('.solucio-boto').forEach((boto) => {
    boto.addEventListener('click', () => {
      const bloc = boto.parentElement.querySelector('.solucio-bloq');
      if (!bloc) return;
      const oberta = bloc.classList.toggle('oberta');
      boto.textContent = oberta ? (boto.dataset.amaga || 'Amagar solució') : (boto.dataset.mostra || 'Mostrar solució');
    });
  });

  /* ---------- Widget «Prediu l'eixida» ---------- */
  function normalitza(t) {
    return t.trim().toLowerCase().replace(/\s+/g, ' ');
  }
  $$('.prediü__comprova').forEach((boto) => {
    boto.addEventListener('click', () => {
      const caixa = boto.closest('.prediü');
      const input = $('input', caixa);
      const feedback = $('.prediü__feedback', caixa);
      const esperat = normalitza(input.dataset.esperat);
      const donat = normalitza(input.value);
      if (!donat) { toast('✍️ Escriu primer la teua predicció!'); return; }
      if (donat === esperat) {
        feedback.className = 'prediü__feedback encert';
        feedback.textContent = '🎉 Exacte! ' + (feedback.dataset.explicacio || '');
      } else {
        feedback.className = 'prediü__feedback fall';
        feedback.textContent = '❌ Ni això… l’eixida correcta és «' + input.dataset.esperat + '». ' + (feedback.dataset.explicacio || '');
      }
    });
  });

  /* ---------- Botó Imprimir PDF ---------- */
  const btnImprimir = $('#btnImprimir');
  if (btnImprimir) {
    btnImprimir.addEventListener('click', () => {
      toast('📄 Preparant el dossier… tria «Guarda com a PDF»');
      setTimeout(() => window.print(), 400);
    });
  }
})();
