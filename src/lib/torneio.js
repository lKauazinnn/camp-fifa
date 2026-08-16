/**
 * Motor do torneio.
 *
 * O estado persistido é mínimo e imutável em relação ao chaveamento:
 *   - `participantes`: cadastro
 *   - `seeds`: ordem sorteada (posições da 1ª fase; `null` = bye)
 *   - `resultados`: mapa `idPartida -> resultado`
 *
 * Todo o chaveamento (quem enfrenta quem, quem avançou, campeão, repescagem)
 * é *derivado* desses três campos por `montarTorneio`. Assim, corrigir o placar
 * de um jogo antigo recalcula automaticamente todas as fases seguintes.
 */

export const CHAVE_PRINCIPAL = 'main'
export const CHAVE_REPESCAGEM = 'rep'

/* ------------------------------------------------------------------ */
/* Helpers de estrutura                                                */
/* ------------------------------------------------------------------ */

export function proximaPotenciaDeDois(quantidade) {
  let potencia = 2
  while (potencia < quantidade) potencia *= 2
  return potencia
}

export function idPartida(chave, rodada, indice) {
  return `${chave}-r${rodada}-m${indice}`
}

/** Nome amigável da fase a partir de quantas rodadas ainda faltam para a decisão. */
export function nomeDaFase(chave, rodada, totalRodadas) {
  const faltam = totalRodadas - rodada

  if (chave === CHAVE_REPESCAGEM) {
    if (faltam === 1) return 'Decisão do 3º Lugar'
    if (faltam === 2) return 'Semifinal da Repescagem'
    if (faltam === 3) return 'Quartas da Repescagem'
    return `Repescagem · Fase ${rodada + 1}`
  }

  if (faltam === 1) return 'Grande Final'
  if (faltam === 2) return 'Semifinal'
  if (faltam === 3) return 'Quartas de Final'
  if (faltam === 4) return 'Oitavas de Final'
  if (faltam === 5) return 'Fase de 32'
  return `Fase ${rodada + 1}`
}

/** Versão curta, usada nas abas/chips do mobile. */
export function nomeCurtoDaFase(chave, rodada, totalRodadas) {
  const faltam = totalRodadas - rodada
  if (chave === CHAVE_REPESCAGEM) {
    if (faltam === 1) return '3º Lugar'
    if (faltam === 2) return 'Semi'
    if (faltam === 3) return 'Quartas'
    return `Fase ${rodada + 1}`
  }
  if (faltam === 1) return 'Final'
  if (faltam === 2) return 'Semi'
  if (faltam === 3) return 'Quartas'
  if (faltam === 4) return 'Oitavas'
  return `Fase ${rodada + 1}`
}

/* ------------------------------------------------------------------ */
/* Sorteio                                                             */
/* ------------------------------------------------------------------ */

function embaralhar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/**
 * Sorteia os confrontos da 1ª fase.
 * Retorna um array de tamanho igual à próxima potência de dois, onde cada par
 * (2i, 2i+1) é um confronto. Byes ficam espalhados nas últimas chaves.
 */
export function sortearSeeds(participantes) {
  const embaralhados = embaralhar(participantes.map((participante) => participante.id))
  const tamanho = proximaPotenciaDeDois(Math.max(2, embaralhados.length))
  const totalPartidas = tamanho / 2
  const seeds = new Array(tamanho).fill(null)

  // Primeiro preenche o mandante de cada confronto…
  embaralhados.slice(0, totalPartidas).forEach((id, indice) => {
    seeds[indice * 2] = id
  })
  // …depois os visitantes, distribuídos uniformemente, para que os byes fiquem
  // espalhados pela chave em vez de se concentrarem nos primeiros confrontos.
  const visitantes = embaralhados.slice(totalPartidas)
  visitantes.forEach((id, indice) => {
    const partida = Math.round((indice * totalPartidas) / visitantes.length)
    seeds[partida * 2 + 1] = id
  })

  return seeds
}

/* ------------------------------------------------------------------ */
/* Resultado de uma partida                                            */
/* ------------------------------------------------------------------ */

export const RESULTADO_VAZIO = {
  golsA: 0,
  golsB: 0,
  penaltisA: 0,
  penaltisB: 0,
  amarelosA: 0,
  vermelhosA: 0,
  amarelosB: 0,
  vermelhosB: 0,
}

export function normalizarResultado(dados = {}) {
  const inteiro = (valor) => {
    const numero = Number.parseInt(valor, 10)
    return Number.isFinite(numero) && numero > 0 ? numero : 0
  }
  return {
    golsA: inteiro(dados.golsA),
    golsB: inteiro(dados.golsB),
    penaltisA: inteiro(dados.penaltisA),
    penaltisB: inteiro(dados.penaltisB),
    amarelosA: inteiro(dados.amarelosA),
    vermelhosA: inteiro(dados.vermelhosA),
    amarelosB: inteiro(dados.amarelosB),
    vermelhosB: inteiro(dados.vermelhosB),
  }
}

/** Empate no tempo normal exige pênaltis com placar diferente. */
export function resultadoEhValido(resultado) {
  const { golsA, golsB, penaltisA, penaltisB } = normalizarResultado(resultado)
  if (golsA !== golsB) return true
  return penaltisA !== penaltisB
}

export function houvePenaltis(resultado) {
  return Boolean(resultado) && resultado.golsA === resultado.golsB
}

/* ------------------------------------------------------------------ */
/* Montagem do chaveamento                                             */
/* ------------------------------------------------------------------ */

/**
 * `vazioA` / `vazioB` indicam que a vaga *nunca* será preenchida (bye na 1ª fase
 * ou chave sem eliminado correspondente). Uma vaga apenas indefinida — porque o
 * jogo anterior ainda não foi disputado — não gera classificação automática.
 */
function montarPartida({ chave, rodada, indice, totalRodadas, idA, idB, vazioA, vazioB, resultados, mapaParticipantes }) {
  const id = idPartida(chave, rodada, indice)
  const resultado = resultados[id] ?? null

  let vencedorId = null
  let perdedorId = null
  let bye = false

  if (idA && !idB && vazioB) {
    vencedorId = idA
    bye = true
  } else if (!idA && idB && vazioA) {
    vencedorId = idB
    bye = true
  } else if (idA && idB && resultado) {
    if (resultado.golsA > resultado.golsB) {
      vencedorId = idA
      perdedorId = idB
    } else if (resultado.golsB > resultado.golsA) {
      vencedorId = idB
      perdedorId = idA
    } else if (resultado.penaltisA > resultado.penaltisB) {
      vencedorId = idA
      perdedorId = idB
    } else if (resultado.penaltisB > resultado.penaltisA) {
      vencedorId = idB
      perdedorId = idA
    }
  }

  // Confronto que jamais acontecerá (as duas vagas estão definitivamente vazias).
  const vazia = !idA && !idB && vazioA && vazioB

  let status = 'aguardando'
  if (vazia) status = 'vazia'
  else if (bye) status = 'bye'
  else if (vencedorId) status = 'finalizada'
  else if (idA && idB) status = 'pronta'

  return {
    vazia,
    id,
    chave,
    rodada,
    indice,
    numero: indice + 1,
    fase: nomeDaFase(chave, rodada, totalRodadas),
    faseCurta: nomeCurtoDaFase(chave, rodada, totalRodadas),
    a: mapaParticipantes.get(idA) ?? null,
    b: mapaParticipantes.get(idB) ?? null,
    resultado,
    vencedorId,
    perdedorId,
    bye,
    status,
    penaltis: houvePenaltis(resultado),
    editavel: Boolean(idA && idB),
  }
}

function montarRodadas({ chave, totalRodadas, tamanho, resultados, mapaParticipantes, slotsIniciais, vaziosIniciais }) {
  const rodadas = []
  const porId = new Map()

  for (let rodada = 0; rodada < totalRodadas; rodada += 1) {
    const quantidade = tamanho / 2 ** (rodada + 1)
    const partidas = []

    for (let indice = 0; indice < quantidade; indice += 1) {
      let idA = null
      let idB = null
      let vazioA = false
      let vazioB = false

      if (rodada === 0) {
        idA = slotsIniciais[indice * 2] ?? null
        idB = slotsIniciais[indice * 2 + 1] ?? null
        // Na chave principal, vaga sem ninguém é bye. Na repescagem, a vaga só é
        // definitivamente vazia quando o confronto de origem não gera eliminado —
        // se ele apenas ainda não foi disputado, a vaga continua pendente.
        vazioA = Boolean(vaziosIniciais[indice * 2])
        vazioB = Boolean(vaziosIniciais[indice * 2 + 1])
      } else {
        const origemA = porId.get(idPartida(chave, rodada - 1, indice * 2))
        const origemB = porId.get(idPartida(chave, rodada - 1, indice * 2 + 1))
        idA = origemA?.vencedorId ?? null
        idB = origemB?.vencedorId ?? null
        vazioA = Boolean(origemA?.vazia)
        vazioB = Boolean(origemB?.vazia)
      }

      const partida = montarPartida({
        chave,
        rodada,
        indice,
        totalRodadas,
        idA,
        idB,
        vazioA,
        vazioB,
        resultados,
        mapaParticipantes,
      })
      porId.set(partida.id, partida)
      partidas.push(partida)
    }

    rodadas.push({
      chave,
      rodada,
      nome: nomeDaFase(chave, rodada, totalRodadas),
      nomeCurto: nomeCurtoDaFase(chave, rodada, totalRodadas),
      partidas,
    })
  }

  return { rodadas, porId }
}

/**
 * Constrói o torneio completo (chave principal + repescagem) a partir do estado.
 * @returns {{ ativo: boolean, principal: array, repescagem: array, porId: Map, campeao, vice, terceiro, quarto, totalPartidas: number, partidasFinalizadas: number, todasPartidas: array }}
 */
export function montarTorneio({ participantes = [], seeds = [], resultados = {} } = {}) {
  const mapaParticipantes = new Map(participantes.map((participante) => [participante.id, participante]))

  if (!Array.isArray(seeds) || seeds.length < 2) {
    return {
      ativo: false,
      principal: [],
      repescagem: [],
      porId: new Map(),
      todasPartidas: [],
      campeao: null,
      vice: null,
      terceiro: null,
      quarto: null,
      totalPartidas: 0,
      partidasFinalizadas: 0,
      progresso: 0,
    }
  }

  const tamanho = seeds.length
  const rodadasPrincipal = Math.log2(tamanho)
  const principal = montarRodadas({
    chave: CHAVE_PRINCIPAL,
    totalRodadas: rodadasPrincipal,
    tamanho,
    resultados,
    mapaParticipantes,
    slotsIniciais: seeds,
    vaziosIniciais: seeds.map((participanteId) => !participanteId),
  })

  // A repescagem recebe os perdedores da 1ª fase, na mesma ordem dos confrontos.
  const partidasPrimeiraFase = principal.rodadas[0].partidas
  const perdedoresPrimeiraFase = partidasPrimeiraFase.map((partida) => partida.perdedorId ?? null)
  // Confronto que terminou em bye (ou nem existe) nunca vai mandar alguém para cá.
  const vagasSemEliminado = partidasPrimeiraFase.map(
    (partida) => partida.status === 'bye' || partida.status === 'vazia',
  )
  const tamanhoRepescagem = perdedoresPrimeiraFase.length
  const rodadasRepescagem = tamanhoRepescagem >= 2 ? Math.log2(tamanhoRepescagem) : 0

  const repescagem =
    rodadasRepescagem > 0
      ? montarRodadas({
          chave: CHAVE_REPESCAGEM,
          totalRodadas: rodadasRepescagem,
          tamanho: tamanhoRepescagem,
          resultados,
          mapaParticipantes,
          slotsIniciais: perdedoresPrimeiraFase,
          vaziosIniciais: vagasSemEliminado,
        })
      : { rodadas: [], porId: new Map() }

  const porId = new Map([...principal.porId, ...repescagem.porId])
  const todasPartidas = [...porId.values()]

  const finalPrincipal = principal.rodadas.at(-1)?.partidas[0] ?? null
  const finalRepescagem = repescagem.rodadas.at(-1)?.partidas[0] ?? null

  // Partidas que serão de fato disputadas (byes e chaves vazias ficam de fora).
  const disputadas = todasPartidas.filter((partida) => partida.status !== 'bye' && partida.status !== 'vazia')
  const finalizadas = disputadas.filter((partida) => partida.status === 'finalizada')

  return {
    ativo: true,
    principal: principal.rodadas,
    repescagem: repescagem.rodadas,
    porId,
    todasPartidas,
    campeao: mapaParticipantes.get(finalPrincipal?.vencedorId) ?? null,
    vice: mapaParticipantes.get(finalPrincipal?.perdedorId) ?? null,
    terceiro: mapaParticipantes.get(finalRepescagem?.vencedorId) ?? null,
    quarto: mapaParticipantes.get(finalRepescagem?.perdedorId) ?? null,
    totalPartidas: disputadas.length,
    partidasFinalizadas: finalizadas.length,
    progresso: disputadas.length ? Math.round((finalizadas.length / disputadas.length) * 100) : 0,
  }
}
