import { createContext, useContext, useMemo } from 'react'
import { TIMES, TIME_PADRAO } from '../data/times.js'

/**
 * Catálogo de times = lista embutida + ajustes do usuário.
 *
 * Um ajuste pode tanto sobrescrever um time embutido (trocar o escudo do Real
 * Madrid, por exemplo) quanto criar um time novo — os dois casos usam a mesma
 * estrutura: um objeto com `id` e só os campos que mudam.
 */

const Contexto = createContext(null)

const LIGA_DO_USUARIO = 'Meus times'

function semVazios(objeto) {
  return Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== undefined && valor !== null))
}

export function criarCatalogo(timesDoUsuario = []) {
  const porId = new Map(TIMES.map((time) => [time.id, time]))

  for (const ajuste of timesDoUsuario) {
    if (!ajuste?.id) continue
    const base = porId.get(ajuste.id) ?? {
      id: ajuste.id,
      nome: 'Sem nome',
      liga: LIGA_DO_USUARIO,
      cores: ['#4b5563', '#1f2937'],
    }
    porId.set(ajuste.id, { ...base, ...semVazios(ajuste) })
  }

  const times = [...porId.values()]
  const embutidos = new Set(TIMES.map((time) => time.id))
  const ajustados = new Set(timesDoUsuario.map((time) => time?.id))

  // "Meus times" primeiro, para o usuário achar o que criou.
  const ligas = [...new Set(times.map((time) => time.liga))].sort((a, b) => {
    if (a === LIGA_DO_USUARIO) return -1
    if (b === LIGA_DO_USUARIO) return 1
    return 0
  })

  return {
    times,
    ligas,
    ligaDoUsuario: LIGA_DO_USUARIO,
    buscarTime: (id) => porId.get(id) ?? TIME_PADRAO,
    ehEmbutido: (id) => embutidos.has(id),
    temAjuste: (id) => ajustados.has(id),
  }
}

const CATALOGO_PADRAO = criarCatalogo([])

export function ProvedorDeTimes({ timesDoUsuario, children }) {
  const catalogo = useMemo(() => criarCatalogo(timesDoUsuario), [timesDoUsuario])
  return <Contexto.Provider value={catalogo}>{children}</Contexto.Provider>
}

/** Fora de um provedor, devolve o catálogo embutido — útil em testes. */
export function useTimes() {
  return useContext(Contexto) ?? CATALOGO_PADRAO
}
