/* ==========================================================================
   CERNE: as lentes (o foróptero) no painel AI Governance da home
   --------------------------------------------------------------------------
   Só o aparelho, sem texto em volta. Em repouso: a interrogação na janela
   esquerda e o olho da esfinge na direita, sobre o azul do CERNE. Acionado
   (o próprio aparelho é o botão), reproduz uma rodada registrada:
   leitura do ato (fora de foco), as doze lentes em sequência, o confronto
   (o foco alterna) e os trechos que resistiram, em foco e sublinhados, com
   o parágrafo à esquerda. Ao fim, volta ao repouso. Por ora, um caso só.
   O que se lê na tela fica no aparelho; o andamento vai, por extenso, para
   leitores de tela (role="status"). Movimento reduzido: sem animação, o
   clique mostra o primeiro trecho em foco e o seguinte volta ao repouso.
   Sem JS, o aparelho fica em repouso e o botão, oculto.
   ========================================================================== */
(() => {
  'use strict';
  const fig = document.querySelector('[data-cl]');
  if (!fig) return;
  const $ = (s) => fig.querySelector(s);
  const play = $('[data-cl-play]'), txt = $('[data-cl-txt]'), sec = $('[data-cl-sec]'),
        status = $('[data-cl-status]'), ponteiro = $('[data-cl-ponteiro]');
  const lentes = [...fig.querySelectorAll('[data-cl-lente]')];
  if (!play || !txt || !sec || !status || lentes.length !== 12) return;

  const CASO = {
    "id": "stj-previdencia-coisa-julgada",
    "titulo": "Previdência complementar e coisa julgada",
    "origem": "STJ",
    "paragrafos": 55,
    "leitura": [
      "PROCESSUAL CIVIL E PREVIDÊNCIA PRIVADA. RECURSO ESPECIAL. AÇÃO REVISIONAL EM RELAÇÃO DE TRATO CONTINUADO. ART. 505, I, DO CPC. AUSÊNCIA DE…",
      "1. Recurso especial contra acórdão que manteve a extinção da ação revisional fundada no art. 505, I, do CPC, proposta por entidade de previdência…",
      "2. O objetivo recursal é decidir se há violação do art. 505, I, do CPC. 3. A cláusula rebus sic stantibus do art. 505, I, do CPC permite revisar…",
      "4. Inexiste precedente obrigatório sobre o mérito que desobrigue o pagamento das rubricas incorporadas; o Tema n. 936 do STJ versa somente sobre a…",
      "Trata-se de recurso especial interposto por FUNDAÇÃO BANRISUL DE SEGURIDADE SOCIAL (FUNDAÇÃO BANRISUL) contra acórdão do Tribunal de Justiça do Rio…"
    ],
    "contagens": {
      "formadas": 10,
      "achados": 9,
      "afastadas": 1,
      "perguntas": 3
    },
    "perguntas": [
      {
        "p": "p31",
        "trecho": "FUNDAÇÃO BANRISUL apontou, em síntese, violação do art. 505, I, do CPC, sustentando que, em se tratando de relação jurídica de trato continuado,…",
        "pergunta": "Como os repetitivos citados se ajustam ao critério de mudança do estado de direito adotado no voto?"
      },
      {
        "p": "p35",
        "trecho": "Já no estado de direito, é caracterizado por uma alteração no arcabouço normativo aplicável ao caso, a exemplo da publicação de uma nova lei, ou,…",
        "pergunta": "O que justifica considerar uma tese vinculante diferente como mudança do estado de direito?"
      },
      {
        "p": "p47",
        "trecho": "No caso dos autos, constata-se que não há nenhum precedente de natureza estritamente vinculante que determine a desobrigação do pagamento da referida…",
        "pergunta": "Por que só alteração legislativa ou precedente vinculante que determine a desobrigação permitiria reconhecer mudança do estado de direito?"
      }
    ]
  };

  const EN = (document.documentElement.lang || '').toLowerCase().startsWith('en');
  const T = EN ? {
    rodar: 'Replay a recorded CERNE round', emCurso: 'CERNE round in progress',
    leitura: 'Reading the act.', lente: (i) => `Lens ${i} of 12.`, confronto: 'Doubts put to the test.',
    pergunta: (i, n, q) => `Question ${i} of ${n}, on paragraph ${q.p.slice(1)}: ${q.pergunta}`,
    fim: (n) => `Round complete: ${n} questions. The operator decides.`
  } : {
    rodar: 'Reproduzir uma rodada registrada do CERNE', emCurso: 'Rodada do CERNE em reprodução',
    leitura: 'Leitura do ato.', lente: (i) => `Lente ${i} de 12.`, confronto: 'Dúvidas postas à prova.',
    pergunta: (i, n, q) => `Pergunta ${i} de ${n}, sobre o parágrafo ${q.p.slice(1)}: ${q.pergunta}`,
    fim: (n) => `Rodada concluída: ${n} perguntas. O operador decide.`
  };
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');
  const P = CASO.perguntas, m = Math.min(3, P.length);
  const FIM = 22 + 11 * m, TOTAL = FIM + 16, PASSO = 320;
  let t = 0, iv = 0, dito = '';

  const diz = (s) => { if (s !== dito) { dito = s; status.textContent = s; } };
  const acende = (f) => lentes.forEach((l, j) => l.setAttribute('fill-opacity', String(f(j))));
  const janela = (texto, blur, foco) => {
    if (txt.textContent !== texto) txt.textContent = texto;
    txt.style.setProperty('--cl-blur', blur + 'px');
    txt.classList.toggle('is-foco', !!foco);
  };
  const gira = (graus) => ponteiro && ponteiro.setAttribute('transform', `rotate(${graus} 530 200)`);

  const repouso = () => {
    clearInterval(iv); iv = 0; t = 0;
    fig.dataset.estado = 'repouso';
    acende(() => 0); gira(0); sec.textContent = ''; janela('', 0, false);
    play.disabled = false; play.setAttribute('aria-label', T.rodar);
  };

  const quadro = () => {
    const sec_ = (p) => '§ ' + p.slice(1);
    if (t < 4) {
      janela(CASO.leitura[t % CASO.leitura.length], 2.2, false); sec.textContent = '';
      diz(T.leitura);
    } else if (t < 16) {
      const li = t - 4;
      acende((j) => j < li ? 0.35 : (j === li ? 1 : 0)); gira(30 * (li + 1));
      janela(CASO.leitura[t % CASO.leitura.length], 2.2, false);
      diz(T.lente(li + 1));
    } else if (t < 22) {
      const c = t - 16; acende(() => 0.35); gira(360);
      janela(P[0].trecho, c % 2 ? 0 : 2.2, false);
      diz(T.confronto);
    } else if (t < FIM) {
      const q = Math.floor((t - 22) / 11), d = (t - 22) % 11;
      acende(() => 0.35);
      janela(P[q].trecho, d < 1 ? 1.4 : 0, d >= 2);
      sec.textContent = sec_(P[q].p);
      diz(T.pergunta(q + 1, P.length, P[q]));
    } else {
      diz(T.fim(P.length));
    }
  };

  const rodar = () => {
    if (fig.dataset.estado === 'rodada') return;
    if (reduz.matches) {
      if (fig.dataset.estado === 'estatico') { repouso(); return; }
      fig.dataset.estado = 'estatico';
      acende(() => 0.35); janela(P[0].trecho, 0, true); sec.textContent = '§ ' + P[0].p.slice(1);
      diz(T.pergunta(1, P.length, P[0]));
      return;
    }
    fig.dataset.estado = 'rodada';
    play.disabled = true; play.setAttribute('aria-label', T.emCurso);
    t = 0; quadro();
    iv = setInterval(() => {
      t += 1;
      if (t >= TOTAL) { repouso(); play.focus({ preventScroll: true }); return; }
      quadro();
    }, PASSO);
  };

  play.hidden = false;
  play.addEventListener('click', rodar);
  repouso();
})();
