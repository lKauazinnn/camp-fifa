import { useEffect, useState } from 'react'
import { tocar } from '../lib/som.js'
import { Confete } from './ui.jsx'

const CHAVE_SESSAO = 'unidos-acamp-abriu'
const TEMPO_MAXIMO = 4200

/** Já passou pela abertura nesta aba? Então vai direto para o campeonato. */
export function jaAbriu() {
  if (typeof window === 'undefined') return true
  try {
    if (window.sessionStorage.getItem(CHAVE_SESSAO) === 'sim') return true
  } catch {
    return true
  }
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * A telinha de abertura da máquina: nome do campeonato, prêmio e o "aperte
 * start" piscando. Sai com qualquer toque, tecla ou clique — e some sozinha
 * depois de alguns segundos, para nunca virar obstáculo.
 *
 * Aparece uma vez por aba: quem recarrega a página no meio do campeonato não
 * assiste de novo.
 */
export function Abertura({ aoComecar }) {
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    const comecar = () => {
      setSaindo(true)
      tocar('moeda')
      try {
        window.sessionStorage.setItem(CHAVE_SESSAO, 'sim')
      } catch {
        /* sem sessionStorage a abertura volta na próxima carga — sem problema */
      }
      window.setTimeout(aoComecar, 260)
    }

    const sozinha = window.setTimeout(comecar, TEMPO_MAXIMO)
    window.addEventListener('keydown', comecar, { once: true })
    window.addEventListener('pointerdown', comecar, { once: true })
    return () => {
      window.clearTimeout(sozinha)
      window.removeEventListener('keydown', comecar)
      window.removeEventListener('pointerdown', comecar)
    }
  }, [aoComecar])

  return (
    <div
      // No tema preto a cortina usa o preto do próprio tema, e não o carvão fixo.
      className={`fixed inset-0 z-[60] grid place-items-center bg-carvao px-6 text-center transition-opacity duration-200 escuro:bg-papel ${
        saindo ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="varredura pointer-events-none absolute inset-0" aria-hidden="true" />
      <Confete pecas={14} />

      <div className="animar-letreiro relative">
        <p className="rotulo text-[11px] text-lima">Unidos Acamp apresenta</p>
        <h1 className="mt-3 text-[3rem] leading-[0.85] text-creme min-[380px]:text-[4rem] sm:text-[6.5rem]">
          Campeonato
          <br />
          <span className="text-lima">FIFA</span>
        </h1>
        <p className="mt-5 text-[14px] font-medium text-creme/70">
          Mata-mata, repescagem e <strong className="text-lima">R$ 100</strong> pro campeão
        </p>
        <p className="rotulo piscar-duro mt-8 text-[13px] text-creme">▶ Aperte start</p>
      </div>
    </div>
  )
}
