import { useCallback, useEffect, useMemo, useState } from 'react'
import { ESTADO_EXEMPLO } from '../data/mock.js'
import { montarTorneio, normalizarResultado, sortearSeeds } from '../lib/torneio.js'
import { calcularEstatisticas, calcularResumo } from '../lib/estatisticas.js'

const CHAVE_STORAGE = 'unidos-acamp-fifa@1'

function clonarExemplo() {
  return JSON.parse(JSON.stringify(ESTADO_EXEMPLO))
}

function carregarEstado() {
  if (typeof window === 'undefined') return clonarExemplo()
  try {
    const bruto = window.localStorage.getItem(CHAVE_STORAGE)
    if (!bruto) return clonarExemplo()
    const salvo = JSON.parse(bruto)
    return {
      participantes: Array.isArray(salvo.participantes) ? salvo.participantes : [],
      seeds: Array.isArray(salvo.seeds) ? salvo.seeds : [],
      resultados: salvo.resultados && typeof salvo.resultados === 'object' ? salvo.resultados : {},
    }
  } catch {
    return clonarExemplo()
  }
}

function novoId() {
  return `p${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Fonte única de verdade da aplicação: cadastro, sorteio, resultados,
 * chaveamento derivado, estatísticas e persistência em localStorage.
 */
export function useTorneio() {
  const [estado, setEstado] = useState(carregarEstado)

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado))
    } catch {
      /* modo privado / storage cheio: a aplicação segue funcionando em memória */
    }
  }, [estado])

  const torneio = useMemo(() => montarTorneio(estado), [estado])
  const estatisticas = useMemo(
    () => calcularEstatisticas(estado.participantes, torneio.todasPartidas),
    [estado.participantes, torneio.todasPartidas],
  )
  const resumo = useMemo(() => calcularResumo(estatisticas, torneio.todasPartidas), [estatisticas, torneio.todasPartidas])

  /* ----------------------------- participantes ----------------------------- */

  const adicionarParticipante = useCallback(({ nome, timeId }) => {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) return
    setEstado((anterior) => ({
      ...anterior,
      participantes: [...anterior.participantes, { id: novoId(), nome: nomeLimpo, timeId }],
    }))
  }, [])

  const atualizarParticipante = useCallback((id, dados) => {
    setEstado((anterior) => ({
      ...anterior,
      participantes: anterior.participantes.map((participante) =>
        participante.id === id ? { ...participante, ...dados } : participante,
      ),
    }))
  }, [])

  /** Remover alguém invalida o chaveamento em andamento — ele é zerado junto. */
  const removerParticipante = useCallback((id) => {
    setEstado((anterior) => {
      const estavaNoChaveamento = anterior.seeds.includes(id)
      return {
        participantes: anterior.participantes.filter((participante) => participante.id !== id),
        seeds: estavaNoChaveamento ? [] : anterior.seeds,
        resultados: estavaNoChaveamento ? {} : anterior.resultados,
      }
    })
  }, [])

  /* -------------------------------- sorteio -------------------------------- */

  const sortear = useCallback(() => {
    setEstado((anterior) => ({
      ...anterior,
      seeds: sortearSeeds(anterior.participantes),
      resultados: {},
    }))
  }, [])

  /* ------------------------------- resultados ------------------------------ */

  const salvarResultado = useCallback((idDaPartida, dados) => {
    setEstado((anterior) => ({
      ...anterior,
      resultados: { ...anterior.resultados, [idDaPartida]: normalizarResultado(dados) },
    }))
  }, [])

  const limparResultado = useCallback((idDaPartida) => {
    setEstado((anterior) => {
      const resultados = { ...anterior.resultados }
      delete resultados[idDaPartida]
      return { ...anterior, resultados }
    })
  }, [])

  /* --------------------------------- reset --------------------------------- */

  const zerarResultados = useCallback(() => {
    setEstado((anterior) => ({ ...anterior, resultados: {} }))
  }, [])

  const desfazerChaveamento = useCallback(() => {
    setEstado((anterior) => ({ ...anterior, seeds: [], resultados: {} }))
  }, [])

  const restaurarExemplo = useCallback(() => setEstado(clonarExemplo()), [])

  const limparTudo = useCallback(() => setEstado({ participantes: [], seeds: [], resultados: {} }), [])

  return {
    participantes: estado.participantes,
    seeds: estado.seeds,
    resultados: estado.resultados,
    torneio,
    estatisticas,
    resumo,
    acoes: {
      adicionarParticipante,
      atualizarParticipante,
      removerParticipante,
      sortear,
      salvarResultado,
      limparResultado,
      zerarResultados,
      desfazerChaveamento,
      restaurarExemplo,
      limparTudo,
    },
  }
}
