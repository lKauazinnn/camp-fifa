/**
 * Agregação de gols, cartões e campanha de cada participante a partir das
 * partidas já finalizadas (chave principal + repescagem).
 */

export const LIMITE_AMARELOS = 2

function linhaVazia(participante) {
  return {
    participante,
    jogos: 0,
    vitorias: 0,
    derrotas: 0,
    gols: 0,
    golsSofridos: 0,
    saldo: 0,
    amarelos: 0,
    vermelhos: 0,
    decididosNosPenaltis: 0,
  }
}

function acumular(linha, { gols, golsSofridos, amarelos, vermelhos, venceu, penaltis }) {
  linha.jogos += 1
  linha.gols += gols
  linha.golsSofridos += golsSofridos
  linha.saldo = linha.gols - linha.golsSofridos
  linha.amarelos += amarelos
  linha.vermelhos += vermelhos
  linha.vitorias += venceu ? 1 : 0
  linha.derrotas += venceu ? 0 : 1
  linha.decididosNosPenaltis += penaltis ? 1 : 0
}

/** @returns {Array} uma linha por participante, ordenada por gols. */
export function calcularEstatisticas(participantes, partidas) {
  const linhas = new Map(participantes.map((participante) => [participante.id, linhaVazia(participante)]))

  partidas
    .filter((partida) => partida.status === 'finalizada' && partida.resultado && partida.a && partida.b)
    .forEach((partida) => {
      const { resultado } = partida
      const linhaA = linhas.get(partida.a.id)
      const linhaB = linhas.get(partida.b.id)

      if (linhaA) {
        acumular(linhaA, {
          gols: resultado.golsA,
          golsSofridos: resultado.golsB,
          amarelos: resultado.amarelosA,
          vermelhos: resultado.vermelhosA,
          venceu: partida.vencedorId === partida.a.id,
          penaltis: partida.penaltis,
        })
      }
      if (linhaB) {
        acumular(linhaB, {
          gols: resultado.golsB,
          golsSofridos: resultado.golsA,
          amarelos: resultado.amarelosB,
          vermelhos: resultado.vermelhosB,
          venceu: partida.vencedorId === partida.b.id,
          penaltis: partida.penaltis,
        })
      }
    })

  return [...linhas.values()].sort(
    (a, b) => b.gols - a.gols || b.saldo - a.saldo || a.jogos - b.jogos || a.participante.nome.localeCompare(b.participante.nome),
  )
}

/** Situação disciplinar exibida na aba de estatísticas. */
export function situacaoDisciplinar(linha) {
  if (linha.vermelhos > 0) {
    return { rotulo: 'Suspenso · vermelho', tom: 'vermelho' }
  }
  if (linha.amarelos >= LIMITE_AMARELOS) {
    return { rotulo: 'Suspenso · amarelos', tom: 'amarelo' }
  }
  if (linha.amarelos === LIMITE_AMARELOS - 1) {
    return { rotulo: 'Pendurado', tom: 'atencao' }
  }
  return { rotulo: 'Regular', tom: 'ok' }
}

/** Números do topo da aba de estatísticas. */
export function calcularResumo(linhas, partidas) {
  const finalizadas = partidas.filter((partida) => partida.status === 'finalizada' && partida.resultado)
  const totalGols = linhas.reduce((total, linha) => total + linha.gols, 0)

  return {
    totalGols,
    totalPartidas: finalizadas.length,
    mediaGols: finalizadas.length ? (totalGols / finalizadas.length).toFixed(1).replace('.', ',') : '0,0',
    totalAmarelos: linhas.reduce((total, linha) => total + linha.amarelos, 0),
    totalVermelhos: linhas.reduce((total, linha) => total + linha.vermelhos, 0),
    decisoesNosPenaltis: finalizadas.filter((partida) => partida.penaltis).length,
    artilheiro: linhas.find((linha) => linha.gols > 0) ?? null,
  }
}
