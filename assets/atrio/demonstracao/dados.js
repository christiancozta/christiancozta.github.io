/* ==========================================================================
   Demonstração de Legal Engineering: o caso 0012345 (fictício).
   Carregado só depois do clique no relógio (import() em demonstracao.js).

   Fonte dos outputs do RATIO e da TROIA: ATRIO\JORNADA\0012345 (25/11/2026):
   ratio\RI_01 a RI_06 e estado_do_caso.md; troia\resultado_troia.md
   (execução EXE-20261125T1346140300-rodar-3b68957a, contrato r3). Os textos
   abaixo preservam argumentos, fundamentos, recomendações e deliberações
   registrados; só a forma de apresentação mudou.

   O recurso é ilustrativo: as linhas simulam texto e não constituem conteúdo
   jurídico. Legíveis ficam só o tipo de peça, as partes, o pedido e os dados
   sujeitos à pseudonimização. O recurso e a minuta permanecem em português
   também na versão inglesa, como peças do processo (lang="pt-BR").
   ========================================================================== */

/* Dados sujeitos à pseudonimização. A mesma pessoa ou entidade recebe sempre
   a mesma etiqueta (consistência referencial). Todos os valores são fictícios. */
const DADOS = {
  parte: { original: "Christian da Costa", etiqueta: "PARTE_01" },
  cpf:   { original: "111.222.333-44", etiqueta: "CPF_01" },
  end:   { original: "Rua das Araucárias, 120, Curitiba/PR", etiqueta: "END_01" },
  banco: { original: "Banco ECHO", etiqueta: "CPARTE_PJ_01" },
  cnpj:  { original: "00.123.456/0001-00", etiqueta: "CNPJ_01" },
  conta: { original: "ag. 0001, c/c 12345-6", etiqueta: "CONTA_01" },
  tel:   { original: "(41) 90000-0000", etiqueta: "TEL_01" }
};

/* O recurso em duas páginas A4. Em "linhas", número = barra (largura em %
   da linha); "@id" = dado sujeito à pseudonimização; "#texto" = texto legível. */
const RECURSO = [
  [
    { k: "linhas", linhas: [[34], [22]], classe: "topo" },
    { k: "titulo", t: "RECURSO INOMINADO" },
    { k: "campo", rotulo: "Recorrente", d: "parte" },
    { k: "campo", rotulo: "Recorrida", d: "banco" },
    { k: "linhas", linhas: [
      ["@parte", 12, 9, "#CPF", "@cpf", 10],
      [14, "#residente na", "@end", 8],
      [31, 18, 27, 16],
      [20, "#em face de", "@banco", 9, "#CNPJ", "@cnpj"],
      [24, 30, 19, 21],
      [38, 22, 17],
      [44]
    ] },
    { k: "secao", t: "DOS FATOS" },
    { k: "linhas", linhas: [
      [27, 19, 33, 15],
      [16, 29, 22, 26],
      [33, 18, 24, 19],
      [21, 35, 30],
      [18, 26, 15, 31],
      [29, 24, 37],
      [52]
    ] },
    { k: "linhas", linhas: [
      [25, 31, 17, 21],
      [19, 23, 34, 18],
      [36, 20, 28],
      [31]
    ] },
    { k: "pe", t: "1 / 2" }
  ],
  [
    { k: "linhas", linhas: [
      ["@parte", 21, 18, 27],
      [15, "#conta", "@conta", 19, 11],
      [28, 17, 25, 24],
      [11, "#ligação de", "@tel", 23, 14],
      [33, 21, 30],
      [24, 18, "@banco", 16],
      [40]
    ] },
    { k: "secao", t: "DO DIREITO" },
    { k: "linhas", linhas: [
      [22, 34, 19, 20],
      [31, 16, 26, 22],
      [18, 29, 33, 14],
      [27, 22, 31],
      [48]
    ] },
    { k: "secao", t: "DOS PEDIDOS" },
    { k: "texto", t: "Requer o conhecimento e o provimento do recurso, para condenar a recorrida à restituição integral de R$\u00a010.000,00 e ao pagamento de indenização por danos morais." },
    { k: "linhas", linhas: [[26], [18, 14]], classe: "fecho" },
    { k: "pe", t: "2 / 2" }
  ]
];

/* A minuta formada na RI_05 e validada na RI_06 (texto registrado). Os
   índices 0 (ementa) e 10 (dispositivo) são lidos no ritmo de leitura; os
   demais, no ritmo de montagem. "marca": o trecho conferido na RI_06. */
const MINUTA = [
  { t: "DIREITO DO CONSUMIDOR. RECURSO INOMINADO. FRAUDE BANCÁRIA. TRANSFERÊNCIAS VIA PIX REALIZADAS APÓS O FORNECIMENTO DO CÓDIGO DE SEGURANÇA A TERCEIRO. CONCORRÊNCIA ENTRE A CONDUTA DO CORRENTISTA E A FALTA DE RETENÇÃO DE OPERAÇÕES ATÍPICAS PELA INSTITUIÇÃO, COM RESTITUIÇÃO DE METADE DO VALOR E DANO MORAL NÃO DEMONSTRADO. RECURSO CONHECIDO E PARCIALMENTE PROVIDO.", ementa: true, marca: "PARCIALMENTE PROVIDO" },
  { t: "Relatório dispensado, nos termos do Enunciado nº 92 do Fonaje." },
  { t: "Satisfeitos os pressupostos processuais de admissibilidade, tanto objetivos quanto subjetivos, o presente recurso merece ser conhecido." },
  { t: "Cinge-se a controvérsia à responsabilidade da instituição financeira por duas transferências via PIX feitas a partir da conta do recorrente, depois que ele forneceu a um golpista o código de segurança recebido por mensagem." },
  { t: "Na madrugada de 15 de abril de 2025, após ligação de pessoa que se apresentou como funcionária do banco, o recorrente informou o código de segurança, e duas transferências de R$\u00a05.000,00, às 2h03 e às 2h11, zeraram sua conta em favor de terceiro desconhecido. As duas partes reconhecem esses fatos." },
  { t: "Tratando-se de relação de consumo entre correntista e banco (Súmula 297 do STJ), cabia ao recorrido demonstrar a culpa exclusiva do consumidor ou de terceiro para afastar sua responsabilidade (art. 14, § 3º, II, da Lei nº 8.078, de 11 de setembro de 1990, Código de Defesa do Consumidor). O recorrido demonstrou que as operações foram autenticadas com a senha e o código do titular, mas não demonstrou ter adotado qualquer medida de confirmação diante de duas transferências seguidas, de madrugada, que consumiram todo o saldo." },
  { t: "O recorrente contribuiu para o golpe ao entregar o código. O banco, porém, também falhou, porque duas transferências desse porte, em oito minutos e de madrugada, compõem padrão que um sistema de segurança tinha condições de reter para confirmação. O limite disponível na conta fixa o teto das operações e não torna regular toda operação que nele cabe." },
  { t: "O serviço que não oferece a segurança que dele se pode esperar é defeituoso (art. 14, § 1º, do CDC), e a instituição financeira responde pelas fraudes praticadas por terceiros no âmbito de suas operações (Súmula 479 do STJ). Como a conduta do recorrente também concorreu para o dano, a culpa não é exclusiva de nenhuma das partes, e a indenização deve observar a contribuição de cada uma (art. 945 da Lei nº 10.406, de 10 de janeiro de 2002, Código Civil). Diante do peso equivalente das condutas, o recorrido deve restituir metade do valor transferido, ou seja, R$\u00a05.000,00." },
  { t: "Quanto aos danos morais, cabia ao recorrente demonstrar o fato constitutivo do seu direito (art. 373, I, da Lei nº 13.105, de 16 de março de 2015, Código de Processo Civil). O recorrente alegou susto e angústia, mas não apresentou elemento concreto de repercussão além do prejuízo em dinheiro, que esta decisão repara em parte. A pretensão, por isso, não comporta acolhimento." },
  { t: "Sendo assim, à luz da legalidade e da jurisprudência, a reforma parcial da sentença é a medida que se impõe." },
  { t: "Ante o exposto, voto pelo CONHECIMENTO e PARCIAL PROVIMENTO do recurso interposto, para o fim de condenar o recorrido à restituição de R$\u00a05.000,00 (cinco mil reais), com correção monetária desde a data das transferências e juros de mora desde a citação, mantida a improcedência do pedido de indenização por danos morais, nos termos da fundamentação acima.", dispositivo: true, marca: "PARCIAL PROVIMENTO" },
  { t: "Diante do parcial êxito recursal, inaplicável a condenação da parte recorrente ao pagamento de verbas sucumbenciais, nos termos do art. 55 da Lei nº 9.099, de 26 de setembro de 1995, e em conformidade com o entendimento firmado no PUIL nº 3.874/PR." }
];

/* Trechos da minuta confrontados pela TROIA (citações literais de MINUTA). */
const TRECHOS = {
  legalidade: "Como a conduta do recorrente também concorreu para o dano, a culpa não é exclusiva de nenhuma das partes, e a indenização deve observar a contribuição de cada uma (art. 945 da Lei nº 10.406, de 10 de janeiro de 2002, Código Civil).",
  seguranca: "Diante do peso equivalente das condutas, o recorrido deve restituir metade do valor transferido, ou seja, R$\u00a05.000,00.",
  isonomia: "O recorrente contribuiu para o golpe ao entregar o código. O banco, porém, também falhou, porque duas transferências desse porte, em oito minutos e de madrugada, compõem padrão que um sistema de segurança tinha condições de reter para confirmação."
};

/* Adjudicação registrada: por julgador, as três rodadas (true = derruba). */
const JULGADORES = {
  legalidade: [[false, false, false], [false, false, false]],
  seguranca:  [[true, true, true],    [false, false, false]],
  isonomia:   [[true, true, true],    [true, false, false]]
};

export default {
  dados: DADOS,
  recurso: RECURSO,
  minuta: MINUTA,
  trechos: TRECHOS,
  julgadores: JULGADORES,
  execucao: "EXE-20261125T1346140300-rodar-3b68957a",
  registroData: { pt: "25/11/2026", en: "25 Nov 2026" },
  /* Arquivos originais da execução, em versão pública e pseudonimizada, quando
     publicados (em assets/data/lastro/): { rotulo, href } com href relativo à
     raiz do site. Vazio: o rastro diz que ainda não foram publicados. */
  arquivos: [],

  pt: {
    ui: {
      regiao: "Demonstração de Legal Engineering",
      registro: "Reprodução de execução registrada",
      caso: "Caso 0012345 · fictício",
      pausar: "Pausar", retomar: "Retomar", avancar: "Avançar", retroceder: "Retroceder",
      encerrar: "Encerrar", recomecar: "Recomeçar",
      desgovernar: "Desgovernar", desgovernarRot: "Desgovernar: ir ao estado final",
      saltado: ["Percurso saltado. O ", "rastro", " permanece."],
      teclas: "Espaço pausa ou retoma; setas avançam e retrocedem; Esc encerra.",
      percurso: "Percurso da demonstração",
      ia: "IA", humano: "Humano",
      humanoReg: "Intervenção humana registrada",
      ilustrativo: "Recurso fictício · linhas ilustrativas",
      carregando: "Carregando a demonstração",
      falha: "Não foi possível carregar a demonstração.",
      etapa: "Etapa"
    },
    rastro: {
      titulo: "Rastro",
      caso: "Caso 0012345",
      execucao: "Execução",
      voltar: "Voltar à reprodução",
      abrir: "Abrir o rastro da execução",
      limite: "Reconstrução das passagens a partir dos outputs registrados da execução: ordem, módulo, fase, ator e o que cada um registrou. Não inclui horários, hashes nem versões. A taxonomia de pseudonimização segue a vigente (PARTE_01, CPARTE_PJ_01).",
      arquivos: "Arquivos originais da execução",
      semArquivos: "ainda não publicados.",
      julgadores: "Julgadores", estado: "Estado",
      atrio: [
        { nome: "Entrada", ia: "Recurso, sentença, certidão e contrarrazões do caso 0012345.", humano: "Recebe as peças." },
        { nome: "Pseudonimização", ia: "O recorrente vira PARTE_01 e o banco vira CPARTE_PJ_01; outros cinco tipos de dado recebem etiqueta. A lista de volta fica no cofre, segregado no backend.", humano: "Confere a troca." }
      ]
    },
    atrio: {
      linha: "Entrada e pseudonimização",
      documento: "Recurso · original",
      documentoPseudo: "Recurso · pseudonimizado",
      originais: "Dados originais",
      ocorrencias: (n, t) => n + " ocorrências · " + t + " tipos",
      cofre: "Cofre",
      cofreSub: "Correspondências entre dados originais e etiquetas. Permitem a reversão controlada.",
      cofreFechado: (n) => n + " correspondências · fechado",
      colOriginal: "Original", colEtiqueta: "Etiqueta",
      pasta: "Backend",
      pastaSub: "Custódia separada do documento que segue ao RATIO.",
      etapas: [
        ["Ingresso documental", "O recurso entra na superfície: duas páginas, como chegam ao ATRIO."],
        ["Identificação", "Os dados sujeitos à pseudonimização são localizados e destacados, página a página."],
        ["Substituição", "Cada dado dá lugar à sua etiqueta, na mesma posição do documento. A mesma pessoa recebe sempre a mesma etiqueta."],
        ["Desprendimento", "Os dados originais deixam o documento e permanecem à vista, fora dele."],
        ["Cofre", "Surge o cofre, onde ficará a correspondência entre cada original e sua etiqueta."],
        ["Custódia", "Os originais e suas etiquetas são acondicionados no cofre, par a par."],
        ["Fechamento", "O cofre se fecha. A correspondência deixa de estar à vista."],
        ["Segregação", "O cofre é acondicionado na pasta de backend, separado do documento."],
        ["Liberação", "O documento pseudonimizado fica disponível. O RATIO trabalha sobre ele."]
      ]
    },
    ratio: {
      linha: "Formação progressiva da decisão",
      fases: "Fases do RATIO",
      entrada: "Entrada · recurso pseudonimizado",
      minuta: "Minuta · caso 0012345",
      minutaMontagem: "Montagem da minuta",
      fonte: "Peça examinada",
      validada: "validada",
      rotas: "Rotas",
      recomendada: "recomendada",
      escolhida: "escolhida",
      naoSeguida: "não seguida",
      coerente: "coerente",
      ecoMontador: "montador do ECHO",
      fasesDados: [
        { id: "RI_01", nome: "Admissibilidade", resumo: "Admissível",
          fonte: "Certidão",
          ia: "Ciência da sentença em 16/07. O prazo de 10 dias úteis corre desde 17/07. Recurso pago e protocolado em 18/07, dentro do prazo. Admissível.",
          humano: "Valida a RI_01. Decisão registrada: o recurso avança ao mérito." },
        { id: "RI_02", nome: "Controvérsia", resumo: "Controvérsia fixada",
          fonte: "Recurso e contrarrazões",
          ia: "A controvérsia é uma só: o banco devia ter desconfiado de R$\u00a010.000 saindo em oito minutos, de madrugada?",
          posicoes: [["PARTE_01", "O banco devia ter desconfiado."], ["CPARTE_PJ_01", "A culpa é só de quem passou o código."]],
          humano: "Valida a RI_02." },
        { id: "RI_03", nome: "Matriz argumentativa", resumo: "Risco médio",
          fonte: "Síntese das RI_01 e RI_02",
          ia: "Os dois erraram, cada um numa coisa.",
          matriz: [
            ["Tese", "Os dois erraram, cada um numa coisa."],
            ["Fundamento", "PARTE_01 passou o código; o banco deixou sair todo o saldo, de madrugada."],
            ["Objeção", "O banco não adivinha golpe."],
            ["Ruptura", "Um alerta ignorado mudaria o quadro: não alegado."],
            ["Risco", "Médio."]
          ],
          humano: "Valida a RI_03." },
        { id: "RI_04", nome: "Parecer", resumo: "Parcial provimento",
          fonte: "Matriz da RI_03",
          ia: "Rotas possíveis: negar, prover ou prover em parte. Recomendação: prover em parte. Se os dois erraram, não é tudo nem nada: cada um arca com uma parte.",
          rotas: [["Negar provimento", ""], ["Dar provimento", ""], ["Prover em parte", "recomendada"]],
          escolha: 2,
          humano: "Escolhe a rota: parcial provimento.",
          nota: "Deliberação registrada nesta execução. A reprodução não a apresenta como a única decisão juridicamente admissível." },
        { id: "RI_05", nome: "Minuta", resumo: "R$\u00a05.000,00",
          fonte: "Rota escolhida na RI_04",
          ia: "Minuta pelo montador do ECHO: metade de volta, R$\u00a05.000,00. Danos morais, não.",
          humano: "Valida a RI_05." },
        { id: "RI_06", nome: "Validação", resumo: "Minuta liberada",
          fonte: "Minuta da RI_05",
          ia: "Fundamentação e dispositivo dizem o mesmo. Minuta liberada.",
          conferencia: [["Ementa", "PARCIALMENTE PROVIDO"], ["Dispositivo", "PARCIAL PROVIMENTO"]],
          humano: "Libera a minuta." }
      ]
    },
    troia: {
      linha: "Confronto adversarial da minuta",
      lentes: "Lentes de confronto",
      lente: "Lente",
      sobConfronto: "Minuta sob confronto",
      tese: "Parcial provimento: restituição de metade, R$\u00a05.000,00; danos morais afastados.",
      execucao: "Execução",
      contrato: "contrato r3",
      contraTese: "Tese contraposta",
      trecho: "Trecho da minuta confrontado",
      adjudicacao: "Adjudicação",
      julgador: (n) => "Julgador " + n,
      julgadoresNota: "Julgadores automatizados da TROIA, três rodadas cada. Não são o julgador humano.",
      derruba: "derruba", naoDerruba: "não derruba",
      placar: (d, t) => d + " de " + t + " derrubam",
      divergencia: "Divergência entre julgadores",
      convergencia: "Julgadores convergem",
      estados: { resiste: "Resiste", instavel: "Instável" },
      estabilidade: "Estabilidade das conclusões",
      lentesDados: [
        { id: "legalidade", nome: "Legalidade", estado: "resiste",
          contra: "Culpa concorrente não reduz a indenização no CDC." },
        { id: "seguranca", nome: "Segurança jurídica", estado: "instavel",
          contra: "A metade foi fixada sem critério." },
        { id: "isonomia", nome: "Isonomia", estado: "instavel",
          contra: "O risco é do banco: cabe-lhe mais da metade." }
      ],
      encaminhamento: {
        nome: "Encaminhamento",
        ia: "A legalidade resiste. A divisão em metade fica instável. A TROIA contraria a minuta, mas não a decide: a conclusão é do julgador humano.",
        humano: "Encaminha a minuta ao CERNE, para auditoria.",
        distincao: "Contrariar ≠ auditar."
      },
      fim: {
        titulo: "Fim da reprodução",
        minuta: "Ler a minuta",
        voltar: "Voltar ao confronto",
        cerne: "Ir ao CERNE",
        cerneNota: "O CERNE é autônomo. A demonstração dele, logo abaixo, examina atos judiciais reais, não este caso."
      }
    }
  },

  en: {
    ui: {
      regiao: "Legal Engineering demonstration",
      registro: "Replay of a recorded execution",
      caso: "Case 0012345 · fictional",
      pausar: "Pause", retomar: "Resume", avancar: "Forward", retroceder: "Back",
      encerrar: "Close", recomecar: "Restart",
      desgovernar: "Ungovern", desgovernarRot: "Ungovern: go to the final state",
      saltado: ["Path skipped. The ", "trace", " remains."],
      teclas: "Space pauses or resumes; arrow keys move forward and back; Esc closes.",
      percurso: "Demonstration path",
      ia: "AI", humano: "Human",
      humanoReg: "Recorded human intervention",
      ilustrativo: "Fictional appeal · illustrative lines · original in Portuguese",
      carregando: "Loading the demonstration",
      falha: "The demonstration could not be loaded.",
      etapa: "Step"
    },
    rastro: {
      titulo: "Trace",
      caso: "Case 0012345",
      execucao: "Execution",
      voltar: "Back to the replay",
      abrir: "Open the execution trace",
      limite: "Passages reconstructed from the execution's recorded outputs: order, module, phase, actor and what each recorded. It does not include times, hashes or versions. The pseudonymization taxonomy follows the current one (PARTE_01, CPARTE_PJ_01).",
      arquivos: "Original execution files",
      semArquivos: "not yet published.",
      julgadores: "Judges", estado: "State",
      atrio: [
        { nome: "Intake", ia: "Appeal, judgment, certificate and response brief of case 0012345.", humano: "Receives the filings." },
        { nome: "Pseudonymization", ia: "The appellant becomes PARTE_01 and the bank becomes CPARTE_PJ_01; five other data types get labels. The list back stays in the vault, kept apart in the backend.", humano: "Checks the swap." }
      ]
    },
    atrio: {
      linha: "Intake and pseudonymization",
      documento: "Appeal · original",
      documentoPseudo: "Appeal · pseudonymized",
      originais: "Original data",
      ocorrencias: (n, t) => n + " occurrences · " + t + " types",
      cofre: "Vault",
      cofreSub: "Correspondences between original data and labels. They allow controlled reversal.",
      cofreFechado: (n) => n + " correspondences · closed",
      colOriginal: "Original", colEtiqueta: "Label",
      pasta: "Backend",
      pastaSub: "Custody kept apart from the document that goes on to RATIO.",
      etapas: [
        ["Document intake", "The appeal enters the surface: two pages, as they reach ATRIO."],
        ["Identification", "The data subject to pseudonymization is located and highlighted, page by page."],
        ["Substitution", "Each item gives way to its label, in the same place in the document. The same person always gets the same label."],
        ["Detachment", "The original data leaves the document and stays in view, outside it."],
        ["Vault", "The vault appears, where each original and its label will be matched."],
        ["Custody", "The originals and their labels are placed in the vault, pair by pair."],
        ["Closing", "The vault closes. The correspondence is no longer in view."],
        ["Segregation", "The vault is placed in the backend folder, apart from the document."],
        ["Release", "The pseudonymized document is available. RATIO works on it."]
      ]
    },
    ratio: {
      linha: "Progressive formation of the decision",
      fases: "RATIO phases",
      entrada: "Input · pseudonymized appeal",
      minuta: "Draft · case 0012345",
      minutaMontagem: "Draft assembly",
      fonte: "Filing examined",
      validada: "validated",
      rotas: "Routes",
      recomendada: "recommended",
      escolhida: "chosen",
      naoSeguida: "not followed",
      coerente: "consistent",
      ecoMontador: "ECHO assembler",
      fasesDados: [
        { id: "RI_01", nome: "Admissibility", resumo: "Admissible",
          fonte: "Certificate",
          ia: "Notice of the judgment on 07/16. The 10-business-day deadline runs from 07/17. Appeal paid and filed on 07/18, within the deadline. Admissible.",
          humano: "Validates RI_01. Recorded decision: the appeal moves on to the merits." },
        { id: "RI_02", nome: "Dispute", resumo: "Dispute defined",
          fonte: "Appeal and response brief",
          ia: "There is one dispute: should the bank have been suspicious of R$\u00a010,000 leaving in eight minutes, at night?",
          posicoes: [["PARTE_01", "The bank should have been suspicious."], ["CPARTE_PJ_01", "The fault is only of whoever gave the code."]],
          humano: "Validates RI_02." },
        { id: "RI_03", nome: "Argument matrix", resumo: "Medium risk",
          fonte: "Synthesis of RI_01 and RI_02",
          ia: "Both sides failed, each in one thing.",
          matriz: [
            ["Thesis", "Both sides failed, each in one thing."],
            ["Ground", "PARTE_01 gave the code; the bank let the whole balance go, at night."],
            ["Objection", "A bank cannot guess a scam."],
            ["Breaking point", "An ignored alert would change the picture: not claimed."],
            ["Risk", "Medium."]
          ],
          humano: "Validates RI_03." },
        { id: "RI_04", nome: "Opinion", resumo: "Granted in part",
          fonte: "RI_03 matrix",
          ia: "Possible routes: deny, grant or grant in part. Recommendation: grant in part. If both sides failed, it is not all or nothing: each bears a part.",
          rotas: [["Deny the appeal", ""], ["Grant the appeal", ""], ["Grant in part", "recommended"]],
          escolha: 2,
          humano: "Chooses the route: granted in part.",
          nota: "Deliberation recorded in this execution. The replay does not present it as the only legally admissible decision." },
        { id: "RI_05", nome: "Draft", resumo: "R$\u00a05,000.00",
          fonte: "Route chosen in RI_04",
          ia: "Draft built with the ECHO assembler: half returned, R$\u00a05,000.00. Moral damages, no.",
          humano: "Validates RI_05." },
        { id: "RI_06", nome: "Validation", resumo: "Draft released",
          fonte: "RI_05 draft",
          ia: "Reasoning and operative part say the same. Draft released.",
          conferencia: [["Headnote", "PARCIALMENTE PROVIDO"], ["Operative part", "PARCIAL PROVIMENTO"]],
          humano: "Releases the draft." }
      ]
    },
    troia: {
      linha: "Adversarial confrontation of the draft",
      lentes: "Confrontation lenses",
      lente: "Lens",
      sobConfronto: "Draft under confrontation",
      tese: "Granted in part: half refunded, R$\u00a05,000.00; moral damages dismissed.",
      execucao: "Execution",
      contrato: "contract r3",
      contraTese: "Opposing thesis",
      trecho: "Draft passage confronted",
      adjudicacao: "Adjudication",
      julgador: (n) => "Judge " + n,
      julgadoresNota: "TROIA's automated judges, three rounds each. They are not the human judge.",
      derruba: "knocks down", naoDerruba: "does not knock down",
      placar: (d, t) => d + " of " + t + " knock it down",
      divergencia: "Judges diverge",
      convergencia: "Judges converge",
      estados: { resiste: "Holds", instavel: "Unstable" },
      estabilidade: "Stability of the conclusions",
      lentesDados: [
        { id: "legalidade", nome: "Legality", estado: "resiste",
          contra: "Shared fault does not reduce damages under the consumer code." },
        { id: "seguranca", nome: "Legal certainty", estado: "instavel",
          contra: "The half was set without a criterion." },
        { id: "isonomia", nome: "Equality", estado: "instavel",
          contra: "The risk is the bank's: more than half is on it." }
      ],
      encaminhamento: {
        nome: "Referral",
        ia: "Legality holds. The half split is unstable. TROIA contests the draft, but does not decide it: the conclusion belongs to the human judge.",
        humano: "Sends the draft to CERNE, for audit.",
        distincao: "Contest ≠ audit."
      },
      fim: {
        titulo: "End of the replay",
        minuta: "Read the draft",
        voltar: "Back to the confrontation",
        cerne: "Go to CERNE",
        cerneNota: "CERNE is autonomous. Its demonstration, just below, examines real judicial rulings, not this case."
      }
    }
  }
};
