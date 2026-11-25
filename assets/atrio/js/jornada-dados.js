/* ==========================================================================
   ATRIO: a jornada do caso 0012345 (fictício), jogada a jogada.
   Fonte: ATRIO\JORNADA\0012345 (25/11/2026): ratio\RI_01 a RI_06 e
   estado_do_caso.md; troia\resultado_troia.md (execução
   EXE-20261125T1346140300-rodar-3b68957a, contrato r3).
   Cada jogada: módulo, casa do rei (o caso), rótulo da casa, o lance da IA
   e o lance humano. Na TROIA o humano não joga: a rival entra pela casa
   indicada e ataca o rei; o estado é o dos julgadores.
   ========================================================================== */
window.ATRIO_JORNADA = {
  pt: {
    caso: "Caso 0012345 · fictício",
    cabeca: "ATRIO · percurso do caso 0012345",
    rotulos: { ia: "IA", humano: "Humano", troia: "TROIA" },
    estados: { resiste: "resiste", instavel: "instável" },
    modulos: {
      atrio: { nome: "ATRIO", linha: "Entrada e proteção" },
      ratio: { nome: "RATIO", linha: "Seis fases, o humano valida" },
      troia: { nome: "TROIA", linha: "Três rivais, sem humano" }
    },
    relogio: {
      pronto: ["Pronta", "Começar"], ia: ["Joga", "Aguarda"], humano: ["Aguarda", "Sua vez"],
      troia: ["Contraria", "Fora"], fim: ["Encerrou", "Encerrou"],
      botaoTrava: "Botão do relógio, travado na vez da IA"
    },
    status: {
      pronto: "Bata o relógio para o caso entrar no tabuleiro.",
      ia: "Vez da IA.",
      fim: "Fim do percurso. A minuta segue para o CERNE."
    },
    arquivo: { titulo: "Folhas guardadas", vazio: "A impressora corta a folha quando ela chega ao tabuleiro.", folha: "Folha", minuta: "Ver a minuta", cerne: "Ir ao CERNE", fechar: "Fechar" },
    minutaTitulo: "Minuta do RATIO · caso 0012345",
    minutaNota: "Texto validado na RI_06. Caso fictício.",
    recomecar: "Recomeçar",
    jogadas: [
      { mod: "atrio", casa: "e1", rotulo: "Entrada",
        ia: "Entrada: recurso, sentença, certidão e contrarrazões do caso 0012345.",
        humano: "Recebe as peças.", pede: "Bata o relógio para receber as peças.", botao: "Receber" },
      { mod: "atrio", casa: "e2", rotulo: "PESSOA_01",
        ia: "Proteção de dados: Christian da Costa passa a PESSOA_01. O mapa de volta fica no cofre.",
        humano: "Confere a troca.", pede: "Bata o relógio para conferir a troca.", botao: "Conferir" },
      { mod: "ratio", casa: "d3", rotulo: "RI_01",
        ia: "RI_01 · Admissibilidade: ciência em 16/07, protocolo em 30/07, preparo no evento 50.2. Admissível.",
        humano: "Valida RI_01.", pede: "Bata o relógio para validar a RI_01.", botao: "Validar" },
      { mod: "ratio", casa: "d4", rotulo: "RI_02",
        ia: "RI_02 · Relatório: o banco devia ter segurado duas transferências de R$ 5.000,00, em oito minutos, de madrugada?",
        humano: "Valida RI_02.", pede: "Bata o relógio para validar a RI_02.", botao: "Validar" },
      { mod: "ratio", casa: "e5", rotulo: "RI_03",
        ia: "RI_03 · Matriz: os dois erraram. Objeção: o banco não adivinha golpe. Ruptura, um alerta ignorado: não alegado. Risco médio.",
        humano: "Valida RI_03.", pede: "Bata o relógio para validar a RI_03.", botao: "Validar" },
      { mod: "ratio", casa: "e5", rotulo: "RI_04", depois: "f6",
        rotas: [{ casa: "d6", r: "negar" }, { casa: "e6", r: "prover" }, { casa: "f6", r: "em parte", escolha: true }],
        ia: "RI_04 · Parecer: negar, prover ou prover em parte. Recomenda em parte.",
        humano: "Escolhe a rota: parcial provimento.", pede: "A rota é sua. Bata o relógio para escolher prover em parte.", botao: "Escolher" },
      { mod: "ratio", casa: "f7", rotulo: "RI_05",
        ia: "RI_05 · Minuta pelo montador do ECHO: metade de volta, R$ 5.000,00. Danos morais, não.",
        humano: "Valida RI_05.", pede: "Bata o relógio para validar a RI_05.", botao: "Validar" },
      { mod: "ratio", casa: "e7", rotulo: "RI_06",
        ia: "RI_06 · Validação: fundamentação e dispositivo dizem o mesmo. Minuta liberada.",
        humano: "Libera a minuta.", pede: "Bata o relógio para liberar a minuta.", botao: "Liberar" },
      { mod: "troia", casa: "e7", rival: { casa: "c6", rotulo: "Legalidade", estado: "resiste" },
        ia: "Legalidade: culpa concorrente não reduz a indenização no CDC. Julgadores: 0 de 6 derrubam. Resiste.",
        pede: "A TROIA joga sozinha. Bata o relógio para a próxima rival.", botao: "Seguir" },
      { mod: "troia", casa: "e7", rival: { casa: "g6", rotulo: "Segurança", estado: "instavel" },
        ia: "Segurança jurídica: a metade foi fixada sem critério. Julgador 1: 3 de 3 derrubam. Julgador 2: 0 de 3. Instável.",
        pede: "A TROIA joga sozinha. Bata o relógio para a próxima rival.", botao: "Seguir" },
      { mod: "troia", casa: "e7", rival: { casa: "d5", rotulo: "Isonomia", estado: "instavel" },
        ia: "Isonomia: o risco é do banco, mais da metade. Julgador 1: 3 de 3. Julgador 2: 1 de 3. Instável.",
        pede: "A TROIA joga sozinha. Bata o relógio para encerrar.", botao: "Seguir" },
      { mod: "troia", casa: "e8", rotulo: "Sem mate", saida: true,
        ia: "Xeque sem mate: o mate é do julgador. Contrariar ≠ auditar.",
        humano: "Encaminha a minuta ao CERNE.", pede: "Bata o relógio para encaminhar ao CERNE.", botao: "Encaminhar" }
    ]
  },
  en: {
    caso: "Case 0012345 · fictional",
    cabeca: "ATRIO · path of case 0012345",
    rotulos: { ia: "AI", humano: "Human", troia: "TROIA" },
    estados: { resiste: "holds", instavel: "unstable" },
    modulos: {
      atrio: { nome: "ATRIO", linha: "Intake and protection" },
      ratio: { nome: "RATIO", linha: "Six phases, the human validates" },
      troia: { nome: "TROIA", linha: "Three rivals, no human" }
    },
    relogio: {
      pronto: ["Ready", "Start"], ia: ["Playing", "Waiting"], humano: ["Waiting", "Your turn"],
      troia: ["Contesting", "Out"], fim: ["Done", "Done"],
      botaoTrava: "Clock button, locked during the AI's turn"
    },
    status: {
      pronto: "Press the clock to bring the case onto the board.",
      ia: "AI's turn.",
      fim: "End of the path. The draft goes on to CERNE."
    },
    arquivo: { titulo: "Stored sheets", vazio: "The printer cuts the sheet when it reaches the board.", folha: "Sheet", minuta: "Read the draft", cerne: "Go to CERNE", fechar: "Close" },
    minutaTitulo: "RATIO draft · case 0012345",
    minutaNota: "Text validated in RI_06, kept in the original Portuguese. Fictional case.",
    recomecar: "Restart",
    jogadas: [
      { mod: "atrio", casa: "e1", rotulo: "Intake",
        ia: "Intake: appeal, judgment, certificate and response brief of case 0012345.",
        humano: "Receives the filings.", pede: "Press the clock to receive the filings.", botao: "Receive" },
      { mod: "atrio", casa: "e2", rotulo: "PESSOA_01",
        ia: "Data protection: Christian da Costa becomes PESSOA_01. The map back stays in the vault.",
        humano: "Checks the swap.", pede: "Press the clock to check the swap.", botao: "Check" },
      { mod: "ratio", casa: "d3", rotulo: "RI_01",
        ia: "RI_01 · Admissibility: notice on 07/16, filing on 07/30, fee at entry 50.2. Admissible.",
        humano: "Validates RI_01.", pede: "Press the clock to validate RI_01.", botao: "Validate" },
      { mod: "ratio", casa: "d4", rotulo: "RI_02",
        ia: "RI_02 · Report: should the bank have held two transfers of R$ 5,000.00, eight minutes apart, in the small hours?",
        humano: "Validates RI_02.", pede: "Press the clock to validate RI_02.", botao: "Validate" },
      { mod: "ratio", casa: "e5", rotulo: "RI_03",
        ia: "RI_03 · Matrix: both sides failed. Objection: a bank cannot guess a scam. Breaking point, an ignored alert: not claimed. Medium risk.",
        humano: "Validates RI_03.", pede: "Press the clock to validate RI_03.", botao: "Validate" },
      { mod: "ratio", casa: "e5", rotulo: "RI_04", depois: "f6",
        rotas: [{ casa: "d6", r: "deny" }, { casa: "e6", r: "grant" }, { casa: "f6", r: "in part", escolha: true }],
        ia: "RI_04 · Opinion: deny, grant or grant in part. Recommends in part.",
        humano: "Chooses the route: granted in part.", pede: "The route is yours. Press the clock to grant in part.", botao: "Choose" },
      { mod: "ratio", casa: "f7", rotulo: "RI_05",
        ia: "RI_05 · Draft built with the ECHO assembler: half returned, R$ 5,000.00. Moral damages, no.",
        humano: "Validates RI_05.", pede: "Press the clock to validate RI_05.", botao: "Validate" },
      { mod: "ratio", casa: "e7", rotulo: "RI_06",
        ia: "RI_06 · Validation: reasoning and operative part say the same. Draft released.",
        humano: "Releases the draft.", pede: "Press the clock to release the draft.", botao: "Release" },
      { mod: "troia", casa: "e7", rival: { casa: "c6", rotulo: "Legality", estado: "resiste" },
        ia: "Legality: shared fault does not reduce damages under the consumer code. Judges: 0 of 6 knock it down. Holds.",
        pede: "TROIA plays alone. Press the clock for the next rival.", botao: "Next" },
      { mod: "troia", casa: "e7", rival: { casa: "g6", rotulo: "Certainty", estado: "instavel" },
        ia: "Legal certainty: the half was set without a criterion. Judge 1: 3 of 3 knock it down. Judge 2: 0 of 3. Unstable.",
        pede: "TROIA plays alone. Press the clock for the next rival.", botao: "Next" },
      { mod: "troia", casa: "e7", rival: { casa: "d5", rotulo: "Equality", estado: "instavel" },
        ia: "Equality: the risk is the bank's, more than half. Judge 1: 3 of 3. Judge 2: 1 of 3. Unstable.",
        pede: "TROIA plays alone. Press the clock to close.", botao: "Next" },
      { mod: "troia", casa: "e8", rotulo: "No mate", saida: true,
        ia: "Check without mate: the mate belongs to the judge. Contest ≠ audit.",
        humano: "Sends the draft to CERNE.", pede: "Press the clock to send it to CERNE.", botao: "Send" }
    ]
  },
  minuta: [
    "DIREITO DO CONSUMIDOR. RECURSO INOMINADO. FRAUDE BANCÁRIA. TRANSFERÊNCIAS VIA PIX REALIZADAS APÓS O FORNECIMENTO DO CÓDIGO DE SEGURANÇA A TERCEIRO. CONCORRÊNCIA ENTRE A CONDUTA DO CORRENTISTA E A FALTA DE RETENÇÃO DE OPERAÇÕES ATÍPICAS PELA INSTITUIÇÃO, COM RESTITUIÇÃO DE METADE DO VALOR E DANO MORAL NÃO DEMONSTRADO. RECURSO CONHECIDO E PARCIALMENTE PROVIDO.",
    "Relatório dispensado, nos termos do Enunciado nº 92 do Fonaje.",
    "Satisfeitos os pressupostos processuais de admissibilidade, tanto objetivos quanto subjetivos, o presente recurso merece ser conhecido.",
    "Cinge-se a controvérsia à responsabilidade da instituição financeira por duas transferências via PIX feitas a partir da conta do recorrente, depois que ele forneceu a um golpista o código de segurança recebido por mensagem.",
    "Na madrugada de 15 de abril de 2025, após ligação de pessoa que se apresentou como funcionária do banco, o recorrente informou o código de segurança, e duas transferências de R$ 5.000,00, às 2h03 e às 2h11, zeraram sua conta em favor de terceiro desconhecido. As duas partes reconhecem esses fatos.",
    "Tratando-se de relação de consumo entre correntista e banco (Súmula 297 do STJ), cabia ao recorrido demonstrar a culpa exclusiva do consumidor ou de terceiro para afastar sua responsabilidade (art. 14, § 3º, II, da Lei nº 8.078, de 11 de setembro de 1990, Código de Defesa do Consumidor). O recorrido demonstrou que as operações foram autenticadas com a senha e o código do titular, mas não demonstrou ter adotado qualquer medida de confirmação diante de duas transferências seguidas, de madrugada, que consumiram todo o saldo.",
    "O recorrente contribuiu para o golpe ao entregar o código. O banco, porém, também falhou, porque duas transferências desse porte, em oito minutos e de madrugada, compõem padrão que um sistema de segurança tinha condições de reter para confirmação. O limite disponível na conta fixa o teto das operações e não torna regular toda operação que nele cabe.",
    "O serviço que não oferece a segurança que dele se pode esperar é defeituoso (art. 14, § 1º, do CDC), e a instituição financeira responde pelas fraudes praticadas por terceiros no âmbito de suas operações (Súmula 479 do STJ). Como a conduta do recorrente também concorreu para o dano, a culpa não é exclusiva de nenhuma das partes, e a indenização deve observar a contribuição de cada uma (art. 945 da Lei nº 10.406, de 10 de janeiro de 2002, Código Civil). Diante do peso equivalente das condutas, o recorrido deve restituir metade do valor transferido, ou seja, R$ 5.000,00.",
    "Quanto aos danos morais, cabia ao recorrente demonstrar o fato constitutivo do seu direito (art. 373, I, da Lei nº 13.105, de 16 de março de 2015, Código de Processo Civil). O recorrente alegou susto e angústia, mas não apresentou elemento concreto de repercussão além do prejuízo em dinheiro, que esta decisão repara em parte. A pretensão, por isso, não comporta acolhimento.",
    "Sendo assim, à luz da legalidade e da jurisprudência, a reforma parcial da sentença é a medida que se impõe.",
    "Ante o exposto, voto pelo CONHECIMENTO e PARCIAL PROVIMENTO do recurso interposto, para o fim de condenar o recorrido à restituição de R$ 5.000,00 (cinco mil reais), com correção monetária desde a data das transferências e juros de mora desde a citação, mantida a improcedência do pedido de indenização por danos morais, nos termos da fundamentação acima.",
    "Diante do parcial êxito recursal, inaplicável a condenação da parte recorrente ao pagamento de verbas sucumbenciais, nos termos do art. 55 da Lei nº 9.099, de 26 de setembro de 1995, e em conformidade com o entendimento firmado no PUIL nº 3.874/PR."
  ]
};

/* A vez do humano: antes de bater o relógio, o visitante lê o trecho do caso
   e escolhe. A escolha certa libera o relógio; a errada devolve a dica.
   Índice = jogada (null: a TROIA joga sozinha). Trechos das peças em
   ATRIO\JORNADA\0012345\entrada e ratio. */
window.ATRIO_JORNADA.escolhas = {
  pt: [
    { peca: "Recurso inominado", trecho: "CHRISTIAN DA COSTA, nos autos da ação movida contra BANCO FINANÇAS MÚLTIPLAS S.A., vem interpor RECURSO INOMINADO contra a sentença do evento 45.1.",
      pergunta: "Por qual via o caso entra?", opcoes: ["Recurso Inominado", "Embargos de Declaração", "Mandado de Segurança"], certa: 0,
      dica: "O próprio recurso diz a via: recurso inominado." },
    { peca: "Recurso inominado", trecho: "CHRISTIAN DA COSTA, nos autos da ação movida contra BANCO FINANÇAS MÚLTIPLAS S.A. [...]",
      pergunta: "O que vira código antes de seguir?", opcoes: ["O nome da pessoa: Christian da Costa", "O número dos autos", "O nome do tribunal"], certa: 0,
      dica: "A proteção alcança o dado pessoal: o nome de quem recorre." },
    { peca: "Certidão", trecho: "Ciência da sentença em 16/07/2026. Prazo de 10 dias úteis de 17/07 a 30/07/2026. Recurso protocolado em 30/07/2026. Preparo comprovado no evento 50.2.",
      pergunta: "O recurso pode ser examinado?", opcoes: ["Sim: no prazo e com preparo", "Não: fora do prazo", "Não: sem preparo"], certa: 0,
      dica: "Protocolo em 30/07, último dia do prazo. Preparo no evento 50.2." },
    { peca: "Sentença e recurso", trecho: "Sentença: o golpe aconteceu fora do banco, por culpa da vítima. Recurso: duas transferências seguidas, em oito minutos, levando todo o dinheiro, é algo que qualquer sistema de segurança deveria estranhar.",
      pergunta: "O que está em disputa?", opcoes: ["Se o banco devia ter segurado as transferências", "Se as transferências aconteceram", "Se o recurso chegou no prazo"], certa: 0,
      dica: "Os dois lados admitem as transferências. A briga é sobre o dever do banco." },
    { peca: "Contrarrazões", trecho: "O banco não pode adivinhar que o próprio cliente está sendo enganado. Os valores cabiam no limite da conta.",
      pergunta: "Qual é a objeção mais forte à hipótese de que os dois erraram?", opcoes: ["O banco não pode adivinhar o golpe", "O valor é pequeno", "O recurso não tem preparo"], certa: 0,
      dica: "A objeção está nas contrarrazões, na primeira frase." },
    { peca: "Parecer (RI_04)", trecho: "Os dois erraram: o recorrente passou o código; o banco deixou sair tudo, de madrugada, sem confirmar. Recomendação: dar parcial provimento.",
      pergunta: "A rota é sua. Qual?", opcoes: ["Negar provimento", "Dar provimento", "Dar parcial provimento (recomendada)"], certa: 2,
      dica: "As outras rotas existem, mas pediriam outra minuta. Nesta partida, a rota é a recomendada." },
    { peca: "Minuta (RI_05)", trecho: "[...] o recorrido deve restituir metade do valor transferido, ou seja, R$ 5.000,00 [...] mantida a improcedência do pedido de indenização por danos morais.",
      pergunta: "A minuta cumpre a rota escolhida?", opcoes: ["Sim: metade de volta, sem danos morais", "Não: devolve tudo", "Não: nega tudo"], certa: 0,
      dica: "Parcial provimento: um pedido aceito pela metade, o outro recusado." },
    { peca: "Minuta (RI_06)", trecho: "Ementa: RECURSO CONHECIDO E PARCIALMENTE PROVIDO. Dispositivo: voto pelo CONHECIMENTO e PARCIAL PROVIMENTO.",
      pergunta: "Ementa e dispositivo dizem o mesmo?", opcoes: ["Sim: liberar a minuta", "Não: voltar à RI_05"], certa: 0,
      dica: "Compare as duas frases: dizem o mesmo resultado." },
    null, null, null,
    { peca: "Resultado da TROIA", trecho: "Legalidade: resiste. Segurança jurídica e isonomia: instável, sobre a divisão em metade. Nenhuma rival derrubou a minuta por inteiro.",
      pergunta: "Quem dá o mate?", opcoes: ["O julgador", "A TROIA", "O RATIO"], certa: 0,
      dica: "A IA contraria e audita; a decisão final é humana." }
  ],
  en: [
    { peca: "Appeal", trecho: "CHRISTIAN DA COSTA, in the action against BANCO FINANÇAS MÚLTIPLAS S.A., hereby files a RECURSO INOMINADO (small-claims appeal) against the judgment at entry 45.1.",
      pergunta: "Through which track does the case enter?", opcoes: ["Small-claims appeal (RI)", "Motion for clarification (ED)", "Writ of mandamus (MS)"], certa: 0,
      dica: "The filing names its own track: a small-claims appeal." },
    { peca: "Appeal", trecho: "CHRISTIAN DA COSTA, in the action against BANCO FINANÇAS MÚLTIPLAS S.A. [...]",
      pergunta: "What becomes a code before moving on?", opcoes: ["The person's name: Christian da Costa", "The case number", "The court's name"], certa: 0,
      dica: "Protection covers personal data: the appellant's name." },
    { peca: "Certificate", trecho: "Notice of judgment on 07/16/2026. Ten business days, 07/17 to 07/30/2026. Appeal filed on 07/30/2026. Fee paid at entry 50.2.",
      pergunta: "Can the appeal be examined?", opcoes: ["Yes: on time and fee paid", "No: late", "No: fee unpaid"], certa: 0,
      dica: "Filed on 07/30, the last day. Fee at entry 50.2." },
    { peca: "Judgment and appeal", trecho: "Judgment: the scam happened outside the bank, through the victim's fault. Appeal: two transfers in a row, eight minutes apart, taking all the money, is something any security system should flag.",
      pergunta: "What is in dispute?", opcoes: ["Whether the bank should have held the transfers", "Whether the transfers happened", "Whether the appeal was on time"], certa: 0,
      dica: "Both sides admit the transfers. The fight is about the bank's duty." },
    { peca: "Response brief", trecho: "The bank cannot guess that its own client is being deceived. The amounts fit within the account limit.",
      pergunta: "What is the strongest objection to 'both sides failed'?", opcoes: ["The bank cannot guess the scam", "The amount is small", "The appeal fee is unpaid"], certa: 0,
      dica: "The objection is in the response brief, first sentence." },
    { peca: "Opinion (RI_04)", trecho: "Both failed: the appellant gave the code; the bank let everything go, at night, without confirming. Recommendation: grant in part.",
      pergunta: "The route is yours. Which one?", opcoes: ["Deny", "Grant", "Grant in part (recommended)"], certa: 2,
      dica: "The other routes exist, but would need another draft. In this game, the route is the recommended one." },
    { peca: "Draft (RI_05)", trecho: "[...] the respondent must return half of the amount transferred, R$ 5,000.00 [...] the claim for moral damages remains dismissed.",
      pergunta: "Does the draft carry out the chosen route?", opcoes: ["Yes: half back, no moral damages", "No: returns everything", "No: denies everything"], certa: 0,
      dica: "Granted in part: one claim halved, the other dismissed." },
    { peca: "Draft (RI_06)", trecho: "Headnote: APPEAL HEARD AND GRANTED IN PART. Operative part: I vote to HEAR the appeal and GRANT IT IN PART.",
      pergunta: "Do headnote and operative part say the same?", opcoes: ["Yes: release the draft", "No: back to RI_05"], certa: 0,
      dica: "Compare both sentences: same outcome." },
    null, null, null,
    { peca: "TROIA result", trecho: "Legality: holds. Legal certainty and equality: unstable, on the half split. No rival knocked the draft down entirely.",
      pergunta: "Who gives the mate?", opcoes: ["The judge", "TROIA", "RATIO"], certa: 0,
      dica: "AI contests and audits; the final decision is human." }
  ]
};
