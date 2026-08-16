import { useCallback, useEffect, useMemo, useState } from 'react'
import { ESTADO_EXEMPLO } from '../data/mock.js'
import { TIMES } from '../data/times.js'
import { montarTorneio, normalizarResultado, sortearSeeds } from '../lib/torneio.js'
import { calcularEstatisticas, calcularResumo } from '../lib/estatisticas.js'
import {
  apagarEstadoSalvo,
  baixarBackup,
  estadoDaURL,
  gerarLinkCompartilhavel,
  lerArquivoDeBackup,
  lerEstadoSalvo,
  limparLinkDaURL,
  salvarEstado,
} from '../lib/persistencia.js'

function clonarExemplo() {
  return JSON.parse(JSON.stringify(ESTADO_EXEMPLO))
}

function novoId() {
  return `p${Math.random().toString(36).slice(2, 9)}`
}

const ESTADO_VAZIO = { participantes: [], seeds: [], resultados: {}, timesDoUsuario: [] }

/** Estados salvos antes da existência de times personalizados não têm o campo. */
function comCamposNovos(estado) {
  return { timesDoUsuario: [], ...estado }
}

/**
 * Fonte única de verdade da aplicação: cadastro, sorteio, resultados,
 * chaveamento derivado, estatísticas e persistência.
 */
export function useTorneio() {
  // Um link compartilhado abre em modo somente leitura, sem tocar nos dados locais.
  const [snapshot] = useState(() => estadoDaURL())

  const [estado, setEstado] = useState(() => {
    if (snapshot) return comCamposNovos(snapshot)
    const salvo = lerEstadoSalvo()
    return comCamposNovos(salvo ? salvo.estado : clonarExemplo())
  })

  const [salvamento, setSalvamento] = useState(() => {
    const salvo = lerEstadoSalvo()
    return { em: salvo?.atualizadoEm ?? null, falhou: false }
  })

  useEffect(() => {
    if (snapshot) return // modo visualização não sobrescreve o campeonato do aparelho
    const atualizadoEm = salvarEstado(estado)
    setSalvamento({ em: atualizadoEm, falhou: atualizadoEm === null })
  }, [estado, snapshot])

  const torneio = useMemo(() => montarTorneio(estado), [estado])
  const estatisticas = useMemo(
    () => calcularEstatisticas(estado.participantes, torneio.todasPartidas),
    [estado.participantes, torneio.todasPartidas],
  )
  const resumo = useMemo(
    () => calcularResumo(estatisticas, torneio.todasPartidas),
    [estatisticas, torneio.todasPartidas],
  )

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

  const zerarResultados = useCallback(() => setEstado((anterior) => ({ ...anterior, resultados: {} })), [])

  const desfazerChaveamento = useCallback(
    () => setEstado((anterior) => ({ ...anterior, seeds: [], resultados: {} })),
    [],
  )

  const restaurarExemplo = useCallback(() => setEstado(clonarExemplo()), [])

  const limparTudo = useCallback(() => {
    apagarEstadoSalvo()
    setEstado(ESTADO_VAZIO)
  }, [])

  /* --------------------------------- times --------------------------------- */

  /** Cria ou atualiza um ajuste de time (serve para embutidos e personalizados). */
  const salvarTime = useCallback((ajuste) => {
    if (!ajuste?.id) return
    setEstado((anterior) => {
      const lista = anterior.timesDoUsuario ?? []
      const existente = lista.find((time) => time.id === ajuste.id)
      const atualizado = existente ? { ...existente, ...ajuste } : ajuste
      return {
        ...anterior,
        timesDoUsuario: existente
          ? lista.map((time) => (time.id === ajuste.id ? atualizado : time))
          : [...lista, atualizado],
      }
    })
  }, [])

  const removerEscudo = useCallback((timeId) => {
    setEstado((anterior) => ({
      ...anterior,
      timesDoUsuario: (anterior.timesDoUsuario ?? [])
        .map((time) => {
          if (time.id !== timeId) return time
          const { escudo, ...semEscudo } = time
          return semEscudo
        })
        // Ajuste que ficou só com o id não guarda mais nada — pode sair da lista.
        .filter((time) => Object.keys(time).length > 1),
    }))
  }, [])

  /** Descarta o ajuste: o time embutido volta ao original, o criado desaparece. */
  const removerTime = useCallback((timeId) => {
    const embutido = TIMES.some((time) => time.id === timeId)
    setEstado((anterior) => ({
      ...anterior,
      timesDoUsuario: (anterior.timesDoUsuario ?? []).filter((time) => time.id !== timeId),
      // Só quando o time deixa de existir é que quem o usava fica sem time.
      participantes: embutido
        ? anterior.participantes
        : anterior.participantes.map((participante) =>
            participante.timeId === timeId ? { ...participante, timeId: 'sem-time' } : participante,
          ),
    }))
  }, [])

  /* ------------------------------ backup / link ---------------------------- */

  const exportarBackup = useCallback(() => baixarBackup(estado), [estado])

  const importarBackup = useCallback(async (arquivo) => {
    const importado = await lerArquivoDeBackup(arquivo)
    setEstado(comCamposNovos(importado))
    return importado.participantes.length
  }, [])

  const copiarLink = useCallback(async () => {
    const link = gerarLinkCompartilhavel(estado)
    try {
      await navigator.clipboard.writeText(link)
      return true
    } catch {
      return false
    }
  }, [estado])

  /** Sai do modo visualização adotando (ou não) o placar recebido. */
  const adotarSnapshot = useCallback(() => {
    const atual = estado
    limparLinkDaURL()
    salvarEstado(atual)
    window.location.reload()
  }, [estado])

  const sairDoSnapshot = useCallback(() => {
    limparLinkDaURL()
    window.location.reload()
  }, [])

  return {
    participantes: estado.participantes,
    timesDoUsuario: estado.timesDoUsuario ?? [],
    estado,
    torneio,
    estatisticas,
    resumo,
    salvamento,
    somenteLeitura: Boolean(snapshot),
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
      salvarTime,
      removerTime,
      removerEscudo,
      exportarBackup,
      importarBackup,
      copiarLink,
      adotarSnapshot,
      sairDoSnapshot,
    },
  }
}
