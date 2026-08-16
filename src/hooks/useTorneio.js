import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  validarEstado,
} from '../lib/persistencia.js'
import {
  assinarMudancas,
  conferirPin,
  gravarNaNuvem,
  lerDaNuvem,
  nuvemConfigurada,
  trocarPin,
} from '../lib/nuvem.js'

const CHAVE_PIN = 'unidos-acamp-pin'
const ATRASO_ENVIO = 700

const ESTADO_VAZIO = { participantes: [], seeds: [], resultados: {}, timesDoUsuario: [] }

function clonarExemplo() {
  return JSON.parse(JSON.stringify(ESTADO_EXEMPLO))
}

function novoId() {
  return `p${Math.random().toString(36).slice(2, 9)}`
}

/** Estados salvos antes da existência de times personalizados não têm o campo. */
function comCamposNovos(estado) {
  return { timesDoUsuario: [], ...estado }
}

function temConteudo(estado) {
  return Boolean(estado?.participantes?.length)
}

function lerPinGuardado() {
  try {
    return window.sessionStorage.getItem(CHAVE_PIN) || null
  } catch {
    return null
  }
}

/**
 * Fonte única de verdade: cadastro, sorteio, resultados, chaveamento derivado,
 * estatísticas, persistência local e sincronização com a nuvem.
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

  // Só conta alteração feita pelo usuário: o que chega da nuvem não é reenviado.
  const [revisaoLocal, setRevisaoLocal] = useState(0)
  const [pin, setPin] = useState(() => (nuvemConfigurada && !snapshot ? lerPinGuardado() : null))
  const [nuvem, setNuvem] = useState({
    configurada: nuvemConfigurada,
    conectado: false,
    sincronizando: false,
    versao: null,
    atualizadoEm: null,
    erro: null,
  })

  const estadoRef = useRef(estado)
  const versaoRef = useRef(null)
  estadoRef.current = estado

  /** Toda ação do usuário passa por aqui, para marcar que há o que enviar. */
  const alterar = useCallback((transformacao) => {
    setEstado(transformacao)
    setRevisaoLocal((atual) => atual + 1)
  }, [])

  /* ------------------------------ persistência ----------------------------- */

  useEffect(() => {
    if (snapshot) return // modo visualização não sobrescreve o campeonato do aparelho
    const atualizadoEm = salvarEstado(estado)
    setSalvamento({ em: atualizadoEm, falhou: atualizadoEm === null })
  }, [estado, snapshot])

  /* --------------------------- leitura da nuvem ---------------------------- */

  useEffect(() => {
    if (!nuvemConfigurada || snapshot) return undefined
    let ativo = true

    const puxar = async () => {
      try {
        const remoto = await lerDaNuvem()
        if (!ativo || !remoto) return
        setNuvem((atual) => ({ ...atual, versao: remoto.versao, atualizadoEm: remoto.atualizadoEm, erro: null }))
        // Ignora o eco da própria gravação.
        if (remoto.versao === versaoRef.current) return
        versaoRef.current = remoto.versao
        if (temConteudo(remoto.estado)) {
          setEstado(comCamposNovos(validarEstado(remoto.estado) ?? ESTADO_VAZIO))
        }
      } catch (erro) {
        if (ativo) setNuvem((atual) => ({ ...atual, erro: erro.message }))
      }
    }

    puxar()
    const cancelar = assinarMudancas({
      aoMudar: puxar,
      aoMudarConexao: (conectado) => ativo && setNuvem((atual) => ({ ...atual, conectado })),
    })

    return () => {
      ativo = false
      cancelar()
    }
  }, [snapshot])

  /* --------------------------- envio para a nuvem -------------------------- */

  useEffect(() => {
    if (!nuvemConfigurada || snapshot || !pin || revisaoLocal === 0) return undefined

    const agendado = window.setTimeout(async () => {
      setNuvem((atual) => ({ ...atual, sincronizando: true }))
      try {
        const resultado = await gravarNaNuvem(estadoRef.current, pin)
        versaoRef.current = resultado.versao
        setNuvem((atual) => ({
          ...atual,
          versao: resultado.versao,
          atualizadoEm: resultado.atualizadoEm,
          sincronizando: false,
          erro: null,
        }))
      } catch (erro) {
        setNuvem((atual) => ({ ...atual, sincronizando: false, erro: erro.message }))
      }
    }, ATRASO_ENVIO)

    return () => window.clearTimeout(agendado)
  }, [revisaoLocal, pin, snapshot])

  /* ------------------------------- destravar ------------------------------- */

  const destravar = useCallback(async (tentativa) => {
    const correto = await conferirPin(tentativa)
    if (!correto) return false

    try {
      window.sessionStorage.setItem(CHAVE_PIN, tentativa)
    } catch {
      /* sem sessionStorage o PIN vale só enquanto a aba estiver aberta */
    }
    setPin(tentativa)

    // Primeira vez: se a nuvem está vazia e há campeonato aqui, publica.
    try {
      const remoto = await lerDaNuvem()
      if (remoto && !temConteudo(remoto.estado) && temConteudo(estadoRef.current)) {
        const resultado = await gravarNaNuvem(estadoRef.current, tentativa)
        versaoRef.current = resultado.versao
        setNuvem((atual) => ({ ...atual, versao: resultado.versao, atualizadoEm: resultado.atualizadoEm }))
      }
    } catch {
      /* falha aqui não impede o destravamento */
    }
    return true
  }, [])

  const travar = useCallback(() => {
    try {
      window.sessionStorage.removeItem(CHAVE_PIN)
    } catch {
      /* nada a fazer */
    }
    setPin(null)
  }, [])

  const alterarPin = useCallback(
    async (novo) => {
      if (!pin) return false
      const trocou = await trocarPin(pin, novo)
      if (trocou) {
        try {
          window.sessionStorage.setItem(CHAVE_PIN, novo)
        } catch {
          /* nada a fazer */
        }
        setPin(novo)
      }
      return trocou
    },
    [pin],
  )

  /* ------------------------------ dados derivados -------------------------- */

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

  const adicionarParticipante = useCallback(
    ({ nome, timeId }) => {
      const nomeLimpo = nome.trim()
      if (!nomeLimpo) return
      alterar((anterior) => ({
        ...anterior,
        participantes: [...anterior.participantes, { id: novoId(), nome: nomeLimpo, timeId }],
      }))
    },
    [alterar],
  )

  const atualizarParticipante = useCallback(
    (id, dados) => {
      alterar((anterior) => ({
        ...anterior,
        participantes: anterior.participantes.map((participante) =>
          participante.id === id ? { ...participante, ...dados } : participante,
        ),
      }))
    },
    [alterar],
  )

  /** Remover alguém invalida o chaveamento em andamento — ele é zerado junto. */
  const removerParticipante = useCallback(
    (id) => {
      alterar((anterior) => {
        const estavaNoChaveamento = anterior.seeds.includes(id)
        return {
          ...anterior,
          participantes: anterior.participantes.filter((participante) => participante.id !== id),
          seeds: estavaNoChaveamento ? [] : anterior.seeds,
          resultados: estavaNoChaveamento ? {} : anterior.resultados,
        }
      })
    },
    [alterar],
  )

  /* -------------------------------- sorteio -------------------------------- */

  const sortear = useCallback(() => {
    alterar((anterior) => ({ ...anterior, seeds: sortearSeeds(anterior.participantes), resultados: {} }))
  }, [alterar])

  /* ------------------------------- resultados ------------------------------ */

  const salvarResultado = useCallback(
    (idDaPartida, dados) => {
      alterar((anterior) => ({
        ...anterior,
        resultados: { ...anterior.resultados, [idDaPartida]: normalizarResultado(dados) },
      }))
    },
    [alterar],
  )

  const limparResultado = useCallback(
    (idDaPartida) => {
      alterar((anterior) => {
        const resultados = { ...anterior.resultados }
        delete resultados[idDaPartida]
        return { ...anterior, resultados }
      })
    },
    [alterar],
  )

  /* --------------------------------- reset --------------------------------- */

  const zerarResultados = useCallback(() => alterar((anterior) => ({ ...anterior, resultados: {} })), [alterar])

  const desfazerChaveamento = useCallback(
    () => alterar((anterior) => ({ ...anterior, seeds: [], resultados: {} })),
    [alterar],
  )

  const restaurarExemplo = useCallback(() => alterar(() => clonarExemplo()), [alterar])

  const limparTudo = useCallback(() => {
    apagarEstadoSalvo()
    alterar(() => ESTADO_VAZIO)
  }, [alterar])

  /* --------------------------------- times --------------------------------- */

  /** Cria ou atualiza um ajuste de time (serve para embutidos e personalizados). */
  const salvarTime = useCallback(
    (ajuste) => {
      if (!ajuste?.id) return
      alterar((anterior) => {
        const lista = anterior.timesDoUsuario ?? []
        const existente = lista.find((time) => time.id === ajuste.id)
        return {
          ...anterior,
          timesDoUsuario: existente
            ? lista.map((time) => (time.id === ajuste.id ? { ...time, ...ajuste } : time))
            : [...lista, ajuste],
        }
      })
    },
    [alterar],
  )

  const removerEscudo = useCallback(
    (timeId) => {
      alterar((anterior) => ({
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
    },
    [alterar],
  )

  /** Descarta o ajuste: o time embutido volta ao original, o criado desaparece. */
  const removerTime = useCallback(
    (timeId) => {
      const embutido = TIMES.some((time) => time.id === timeId)
      alterar((anterior) => ({
        ...anterior,
        timesDoUsuario: (anterior.timesDoUsuario ?? []).filter((time) => time.id !== timeId),
        // Só quando o time deixa de existir é que quem o usava fica sem time.
        participantes: embutido
          ? anterior.participantes
          : anterior.participantes.map((participante) =>
              participante.timeId === timeId ? { ...participante, timeId: 'sem-time' } : participante,
            ),
      }))
    },
    [alterar],
  )

  /* ------------------------------ backup / link ---------------------------- */

  const exportarBackup = useCallback(() => baixarBackup(estado), [estado])

  const importarBackup = useCallback(
    async (arquivo) => {
      const importado = await lerArquivoDeBackup(arquivo)
      alterar(() => comCamposNovos(importado))
      return importado.participantes.length
    },
    [alterar],
  )

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
    const atual = estadoRef.current
    limparLinkDaURL()
    salvarEstado(atual)
    window.location.reload()
  }, [])

  const sairDoSnapshot = useCallback(() => {
    limparLinkDaURL()
    window.location.reload()
  }, [])

  // Com a nuvem ligada, quem não tem o PIN apenas acompanha.
  const somenteLeitura = Boolean(snapshot) || (nuvemConfigurada && !pin)

  return {
    participantes: estado.participantes,
    timesDoUsuario: estado.timesDoUsuario ?? [],
    estado,
    torneio,
    estatisticas,
    resumo,
    salvamento,
    nuvem,
    destravado: Boolean(pin),
    somenteLeitura,
    modoVisualizacao: Boolean(snapshot),
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
      destravar,
      travar,
      alterarPin,
    },
  }
}
