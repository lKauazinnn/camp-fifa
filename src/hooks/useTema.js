import { useCallback, useEffect, useState } from 'react'

const CHAVE_TEMA = 'unidos-acamp-tema'
const COR_DA_BARRA = { claro: '#f0ece1', escuro: '#14131c' }

function temaInicial() {
  if (typeof window === 'undefined') return 'claro'
  try {
    const salvo = window.localStorage.getItem(CHAVE_TEMA)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    /* armazenamento bloqueado: cai na preferência do sistema */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

/**
 * Alterna entre o tema claro (papel) e o preto. Na primeira visita segue a
 * preferência do sistema; depois disso vale a escolha do usuário.
 */
export function useTema() {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_DA_BARRA[tema])
    try {
      window.localStorage.setItem(CHAVE_TEMA, tema)
    } catch {
      /* sem persistência: o tema vale só nesta sessão */
    }
  }, [tema])

  const alternarTema = useCallback(() => setTema((atual) => (atual === 'claro' ? 'escuro' : 'claro')), [])

  return { tema, alternarTema }
}
