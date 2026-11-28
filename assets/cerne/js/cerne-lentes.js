/* ==========================================================================
   CERNE: as lentes (o foróptero) no painel AI Governance da home
   --------------------------------------------------------------------------
   Em repouso: a interrogação na janela esquerda e o olho da esfinge na
   direita, sobre o azul do CERNE. O próprio aparelho é o botão: abre a
   rodada do caso 0012345 no 4º estado da demonstração (#demonstracao), com
   linguagem própria. Quem liga o botão à superfície é o acionador da
   demonstração (assets/atrio/demonstracao/gatilho.js), pelo atributo
   data-ld-ir, lido no momento do clique.

   A indicação abaixo do aparelho diz o que o clique faz:
     · "Iniciar a rodada": nada visto ainda, ou a rodada já concluída;
     · "Continuar a rodada": a jornada passou pela TROIA (a minuta foi
       encaminhada ao CERNE) ou a rodada ficou no meio; nesse caso, o clique
       retoma o passo em que ela parou ("cerne@3").
   O estado vem da demonstração (evento ld:estado) e fica só nesta aba
   (sessionStorage), com fallback silencioso. Sem JS, o aparelho fica em
   repouso e o botão e a indicação, ocultos.
   ========================================================================== */
(() => {
  'use strict';
  const fig = document.querySelector('[data-cl]');
  if (!fig) return;
  const play = fig.querySelector('[data-cl-play]');
  const rot = fig.querySelector('[data-cl-rotulo]');
  if (!play) return;

  const EN = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  const T = EN ? {
    iniciar: 'Start the round', continuar: 'Continue the round',
    aIniciar: 'Start the CERNE round on case 0012345', aContinuar: 'Continue the CERNE round on case 0012345'
  } : {
    iniciar: 'Iniciar a rodada', continuar: 'Continuar a rodada',
    aIniciar: 'Iniciar a rodada do CERNE no caso 0012345', aContinuar: 'Continuar a rodada do CERNE no caso 0012345'
  };

  const CHAVE = 'arco.cerne.rodada';
  const le = () => { try { return JSON.parse(sessionStorage.getItem(CHAVE) || 'null') || {}; } catch (_) { return {}; } };
  const grava = (v) => { try { sessionStorage.setItem(CHAVE, JSON.stringify(v)); } catch (_) { /* sem armazenamento: o rótulo vale só nesta visita */ } };
  let mem = le();

  const pinta = () => {
    const k = Number.isInteger(mem.k) && mem.k > 0 ? mem.k : 0;
    const continua = k > 0 || !!mem.troia;
    play.dataset.ldIr = 'cerne' + (k ? '@' + k : '');
    play.setAttribute('aria-label', continua ? T.aContinuar : T.aIniciar);
    if (rot) rot.textContent = continua ? T.continuar : T.iniciar;
  };

  /* a demonstração avisa onde está: TROIA concluída, ou o passo do CERNE */
  document.addEventListener('ld:estado', (ev) => {
    const d = ev.detail || {};
    if (d.cap === 'troia' && d.fim) mem.troia = true;
    if (d.cap === 'cerne') {
      if (d.fim) { mem.k = 0; mem.troia = false; }
      else mem.k = d.k;
    }
    grava(mem);
    pinta();
  });

  rot?.addEventListener('click', () => play.click());
  pinta();
  play.hidden = false;
  fig.dataset.pronto = '';
})();
