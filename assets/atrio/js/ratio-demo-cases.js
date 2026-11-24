const ratioDemoCases = (() => {
  const phase = (title, reading, question, source, excerpt, cues, matrix) => ({
    title, reading, question, source, excerpt, cues, matrix
  });

  return {
    pt: {
      RI: {
        title: "Compra cancelada",
        summary: "A sentença tratou uma tentativa de estorno como restituição de R$ 480.",
        phases: [
          phase("Admissibilidade", "A via escolhida é o Recurso Inominado. A sentença e a petição estão nos autos, mas preciso da data de ciência.",
            "Consulte a certidão e escreva a data de ciência e a data da interposição.",
            "P1 · Certidão e protocolo", "Ciência da sentença em 12/05. Recurso protocolado em 17/05.",
            ["12/05|12 de maio", "17/05|17 de maio"]),
          phase("Relatório técnico", "A sentença citou P2 como prova do reembolso. P2 mostra uma solicitação de estorno. O extrato P3 ainda precisa ser confrontado.",
            "Leia o extrato e diga se houve crédito, indicando a peça que consultou.",
            "P3 · Extrato bancário", "Período de 01 a 31/05. Nenhum crédito de R$ 480 foi registrado.",
            ["p3|extrato", "nenhum|sem credito|nao|ausencia"]),
          phase("TROIA", "Um crédito vinculado ao pedido derrubaria a hipótese de que o valor continua devido. O registro da operadora permite testar esse cenário.",
            "Localize o resultado da tentativa em P4. Diga se a matriz pode seguir e justifique com o dado encontrado.",
            "P4 · Conciliação da operadora", "Pedido 341. Estorno de R$ 480 iniciado. Situação definitiva: recusado. Nenhum crédito efetivado.",
            ["recusad|rejeitad|nao efetivad|sem credito"],
            [
              ["Cenário principal", "O reembolso não foi efetivado."],
              ["Cenário adverso", "P2 pode parecer prova de um crédito já realizado."],
              ["Ponto de ruptura", "Um crédito efetivo vinculado ao pedido mudaria a conclusão."],
              ["Risco", "Permanece até conferir a situação definitiva em P4."],
              ["Decisão do operador", "Consulte P4 e registre se a matriz pode seguir."]
            ]),
          phase("Parecer estratégico", "P2 e P4 descrevem a mesma tentativa. P4 permite distinguir a solicitação de estorno de um crédito efetivo.",
            "Escolha uma rota e explique por que o comprovante aceito pela sentença é insuficiente.",
            "Síntese · P2 e P4", "Rota proposta: reformar a sentença e reconhecer a restituição de R$ 480. P2 registra o início e P4 mostra a recusa do crédito.",
            ["reform|restitu", "recusad|tentativ|solicit"]),
          phase("Minuta / Voto", "Proponho reformar a sentença e determinar a restituição de R$ 480. A premissa é a tentativa de estorno recusada em P4.",
            "Confira o dispositivo e escreva o valor e o que a minuta determina.",
            "Minuta · Dispositivo", "Dar provimento ao recurso para determinar a restituição de R$ 480.",
            ["480", "restitu|devolu"]),
          phase("Validação e refinamento", "O dispositivo e a rota coincidem. A minuta atribui a conclusão ao registro P4 e ao extrato P3.",
            "Confirme expressamente a minuta para encaminhamento ao CERNE e indique o documento que sustenta a conclusão.",
            "Conferência · Voto e lastro", "O registro P4 demonstra a recusa. O extrato P3 demonstra a ausência de crédito.",
            ["confirm|valid|encaminh|aprovo", "p4|p3|extrato|operadora"])
        ]
      },
      ED: {
        title: "Protocolo sem resposta",
        summary: "Os embargos apontam que o voto deixou de enfrentar um protocolo já juntado.",
        phases: [
          phase("Admissibilidade", "A petição indica uma omissão específica. Para instruir a fase, preciso conferir ciência e protocolo.",
            "Leia a certidão e registre as duas datas.",
            "E1 · Certidão e protocolo", "Ciência do acórdão em 04/06. Embargos protocolados em 07/06.",
            ["04/06|4 de junho", "07/06|7 de junho"]),
          phase("Relatório técnico", "Os embargos dizem que o voto descreveu a ausência de pedido administrativo. Preciso identificar a passagem e o documento que ela deixou de enfrentar.",
            "Compare E2 e E3. Escreva qual parágrafo precisará de complementação e qual documento comprova o pedido.",
            "E2 § 8 e E3 · Protocolo", "§ 8 do acórdão: «Não se demonstrou solicitação administrativa». E3: protocolo de solicitação nº 317.",
            ["8", "e3|317|protocolo"]),
          phase("Parecer estratégico", "E3 permite esclarecer a existência do pedido. O fundamento independente do § 12 sustenta o resultado mesmo com essa correção. Neste caso, TROIA fica dispensado.",
            "Escolha se vai acolher a omissão e diga se a correção altera o resultado.",
            "E2 § 12 · Fundamento independente", "O resultado está apoiado em fundamento autônomo. Proposta: acolher para integrar o voto, sem alterar o resultado.",
            ["acolh|integr|complement", "sem alter|mant|preserv|inalter"]),
          phase("Minuta / Voto", "Proponho explicitar o protocolo 317, suprir a omissão do § 8 e preservar a conclusão.",
            "Escreva em uma frase o que deve constar no dispositivo dos embargos.",
            "Minuta · Dispositivo", "Acolher os embargos para suprir a omissão, sem alteração do resultado.",
            ["acolh|suprir|integr", "sem alter|mant|preserv|inalter"]),
          phase("Validação e refinamento", "A minuta enfrenta E3, complementa o § 8 e mantém o resultado fundado no § 12.",
            "Confirme a minuta para encaminhamento ao CERNE e indique o ponto que foi integrado.",
            "Conferência · Voto integrado", "Protocolo 317 (peça E3), enfrentado na complementação do § 8.",
            ["confirm|valid|encaminh|aprovo", "317|e3|omiss|8"])
        ]
      },
      MS: {
        title: "Pedido de certidão sem decisão",
        summary: "A pessoa pede uma resposta formal a um requerimento administrativo.",
        phases: [
          phase("Cabimento e admissibilidade", "A inicial aponta uma omissão e anexa prova documental. Preciso saber quem tem a atribuição de responder.",
            "Leia a atribuição em M1 e indique a autoridade apontada.",
            "M1 · Inicial e regulamento do órgão", "A atribuição para decidir o pedido de certidão é da diretora do Cadastro.",
            ["diretor|direcao", "cadastro"]),
          phase("Mapa do ato coator", "O pedido é de decisão administrativa expressa. Vou mapear a omissão a partir do protocolo e do estado do requerimento.",
            "Localize o número do protocolo e registre o estado indicado no sistema do órgão.",
            "M2 · Comprovante e consulta", "Protocolo 782. Situação: aguardando decisão. Não consta resposta comunicada.",
            ["782", "aguard|penden|sem resposta|nao consta"]),
          phase("Decisão liminar", "O protocolo demonstra a pendência. Para a proposta liminar, falta confirmar a urgência alegada.",
            "Confira a peça da urgência e diga se ela traz uma data limite comprovada.",
            "M3 · Alegação de urgência", "A inicial menciona um cadastro futuro. A peça anexada não contém data limite nem calendário oficial.",
            ["sem data|nao|ausen|falta", "data|prazo|calendario|urgenc"]),
          phase("Processamento pós-liminar", "A proposta ilustrativa foi indeferir a liminar e prosseguir. Chegaram as informações da autoridade.",
            "Leia as informações e diga se o órgão respondeu ao pedido principal ou apenas justificou a demora.",
            "M4 · Informações da autoridade", "O órgão relata fila interna e confirma que ainda não há decisão sobre o protocolo 782.",
            ["demora|fila|atraso|penden|sem decis|nao decid|justific"]),
          phase("Parecer de mérito", "As informações mantêm a omissão em discussão. A rota proposta distingue exigir uma resposta de ordenar a emissão imediata da certidão.",
            "Escolha o alcance da ordem e escreva o que a autoridade deve fazer.",
            "Síntese · Delimitação", "A autoridade deve decidir expressamente o protocolo 782. A ordem ilustrada deixa para o órgão decidir o conteúdo.",
            ["decid|decisao|respond|respost", "782|protocolo|requerimento|pedido"]),
          phase("Sentença / Acórdão", "A minuta propõe determinar que o órgão profira decisão expressa sobre o requerimento, conforme a rota escolhida.",
            "Confira a minuta e registre qual obrigação deve constar no dispositivo.",
            "Minuta · Dispositivo", "Determinar à autoridade que decida o protocolo 782 e comunique a resposta à parte.",
            ["decid|decisao|respost", "782|protocolo|requerimento|pedido"]),
          phase("Validação e refinamento", "O dispositivo trata do dever de responder. O fato que sustenta a conclusão é a pendência confirmada pela autoridade em M4.",
            "Confirme a minuta para encaminhamento ao CERNE e cite o lastro.",
            "Conferência · Fundamento", "M4 confirma que consta fila interna e que o protocolo ainda está sem decisão.",
            ["confirm|valid|encaminh|aprovo", "m4|fila|penden|autoridade"])
        ]
      }
    },
    en: {
      RI: {
        title: "Cancelled purchase",
        summary: "The judgment treated an attempted refund as a completed R$480 reimbursement.",
        phases: [
          phase("Admissibility", "The selected route is a small claims appeal. The judgment and appeal are in the file, but I need the date of notice.",
            "Read the certificate and enter the notice and filing dates.",
            "P1 · Certificate and filing", "Notice on May 12. Appeal filed on May 17.",
            ["may 12|12 may|12/05|05/12", "may 17|17 may|17/05|05/17"]),
          phase("Technical report", "The judgment cited P2 as proof of refund. P2 shows a refund request. I still need to compare it with statement P3.",
            "Read the statement and say whether there was a credit, citing the document.",
            "P3 · Bank statement", "May 1–31. No R$480 credit was recorded.",
            ["p3|statement", "no|absen|none"]),
          phase("TROIA", "A completed credit linked to the order would defeat the hypothesis that the refund is still owed. The provider's record can test this.",
            "Find the result in P4. Say whether the matrix can proceed and explain what you found.",
            "P4 · Provider reconciliation", "Order 341. Refund of R$480 initiated. Final status: declined. No credit issued.",
            ["declin|reject|no credit"],
            [
              ["Main scenario", "The refund was never credited."],
              ["Adverse scenario", "P2 could be read as evidence of a completed refund."],
              ["Breaking point", "A completed credit linked to the order would change the outcome."],
              ["Risk", "Open until the final status is checked in P4."],
              ["Operator decision", "Check P4 and record whether the matrix can proceed."]
            ]),
          phase("Strategic assessment", "P2 and P4 refer to the same attempt. P4 distinguishes a refund request from a completed credit.",
            "Choose a route and explain why the receipt accepted in the judgment is insufficient.",
            "Summary · P2 and P4", "Proposed route: reverse the judgment and order a R$480 refund. P2 records the request and P4 shows it was declined.",
            ["revers|refund|reimburse", "declin|reject|attempt|request"]),
          phase("Draft opinion", "I propose reversing the judgment and ordering a R$480 refund. Record P4 shows the credit was declined.",
            "Check the disposition and write the amount and remedy in the draft.",
            "Draft · Disposition", "Allow the appeal and order reimbursement of R$480.",
            ["480", "refund|reimburse|repay"]),
          phase("Validation and refinement", "The disposition follows the selected route. The draft grounds its conclusion in P4 and statement P3.",
            "Explicitly confirm the draft for handoff to CERNE and identify its supporting document.",
            "Review · Opinion and evidence", "P4 shows the decline. Statement P3 shows that no credit was recorded.",
            ["confirm|valid|approv|send", "p4|p3|statement|provider"])
        ]
      },
      ED: {
        title: "Unaddressed filing",
        summary: "The motion points to a filing already in the record that the opinion did not address.",
        phases: [
          phase("Admissibility", "The motion identifies a specific omission. I need to verify notice and filing.",
            "Read the certificate and enter both dates.",
            "E1 · Certificate and filing", "Notice on June 4. Motion filed on June 7.",
            ["june 4|4 june|04/06|06/04", "june 7|7 june|07/06|06/07"]),
          phase("Technical report", "The motion says the opinion found no administrative application. I need to identify the passage and the document it left unaddressed.",
            "Compare E2 and E3. Give the paragraph that needs supplementation and the document proving the request.",
            "E2 § 8 and E3 · Filing", "Opinion § 8: «No administrative application was proved». E3: application filing number 317.",
            ["8", "e3|317|filing"]),
          phase("Strategic assessment", "E3 establishes that the application existed. The independent ground in § 12 still supports the result. TROIA is dispensed with in this example.",
            "Decide whether to address the omission and say whether the correction changes the outcome.",
            "E2 § 12 · Independent ground", "Proposed route: grant the motion to supplement the opinion while leaving the result unchanged.",
            ["grant|supplement|correct", "unchang|same|preserv|no change|without chang"]),
          phase("Draft opinion", "I propose addressing filing 317, supplementing § 8 and preserving the conclusion.",
            "Describe in one sentence what the disposition should say.",
            "Draft · Disposition", "Grant the motion to remedy the omission without changing the result.",
            ["grant|remedy|supplement", "unchang|same|preserv|no change|without chang"]),
          phase("Validation and refinement", "The draft addresses E3, supplements § 8 and preserves the result grounded in § 12.",
            "Confirm the draft for handoff to CERNE and identify the point that was addressed.",
            "Review · Supplemented opinion", "Filing 317 (E3) is now addressed in the supplement to § 8.",
            ["confirm|valid|approv|send", "317|e3|omission|8"])
        ]
      },
      MS: {
        title: "Unanswered certificate request",
        summary: "The applicant seeks a formal response to an administrative request.",
        phases: [
          phase("Availability and admissibility", "The petition identifies an omission and attaches documents. I need to identify the person responsible for deciding.",
            "Read the authority's remit in M1 and identify the official.",
            "M1 · Petition and agency rules", "The Registry Director is responsible for deciding the certificate application.",
            ["director|head", "registry"]),
          phase("Map of the challenged act", "The request seeks an express administrative decision. I will map the omission using the filing and its status.",
            "Find the filing number and record its current status.",
            "M2 · Receipt and status", "Filing 782. Status: awaiting a decision. No response has been communicated.",
            ["782", "await|pend|no response|no decision"]),
          phase("Interim decision", "The filing shows the pending request. The asserted urgency still needs checking before the interim proposal.",
            "Read the urgency exhibit and say whether it contains a documented deadline.",
            "M3 · Urgency exhibit", "The petition mentions a future application. The exhibit contains no deadline or official schedule.",
            ["no|absen|lack|without", "deadline|schedule|date|urgency"]),
          phase("Post-injunction processing", "The illustrative proposal was to deny interim relief and continue. The authority has submitted its response.",
            "Read the response and say whether the authority decided the application or explained the delay.",
            "M4 · Authority response", "The authority reports an internal queue and confirms filing 782 is still awaiting a decision.",
            ["delay|queue|pend|await|no decision"]),
          phase("Merits assessment", "The response confirms that the omission is live. The proposed route distinguishes requiring an answer from ordering immediate issuance of the certificate.",
            "Choose the scope of the order and write what the authority must do.",
            "Summary · Scope", "The authority must expressly decide filing 782. The proposed order leaves the content to the agency.",
            ["decid|decision|respon|answer", "782|filing|application|request"]),
          phase("Judgment", "The draft would require the agency to issue an express decision on the application, following the selected route.",
            "Check the draft and write the obligation that belongs in the disposition.",
            "Draft · Disposition", "Order the authority to decide filing 782 and communicate the response to the applicant.",
            ["decid|decision|respon|answer", "782|filing|application|request"]),
          phase("Validation and refinement", "The disposition requires a response. The authority's confirmation in M4 supports the finding that the request remains pending.",
            "Confirm the draft for handoff to CERNE and cite the supporting document.",
            "Review · Supporting evidence", "M4 confirms the internal queue and that the filing still has no decision.",
            ["confirm|valid|approv|send", "m4|queue|pending|authority"])
        ]
      }
    }
  };
})();
