import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { tocar, vibrar } from '../lib/som.js'
import { Botao, Confete, EscudoTime } from './ui.jsx'

/* Ritmo da cerimônia: um tempo de rolagem para todo mundo e, depois, uma peça
   travando a cada intervalo — é a espera entre um nome e outro que dá graça. */
const ESPERA_INICIAL = 800
const INTERVALO_TRAVA = 260
const QUADRO_ROLAGEM = 70

/**
 * O sorteio dos times em tela cheia, para a galera assistir junto.
 *
 * O resultado já está decidido antes de a cortina subir: o palco só revela,
 * um por um, o que o sorteio devolveu. Fechar no meio não muda nada — os times
 * continuam os mesmos.
 */
export function PalcoSorteio({ participantes, elenco, aoFechar }) {
  const { buscarTime } = useTimes()
  // A lista é congelada na abertura: se alguém se inscrever pelo QR no meio da
  // cerimônia, o palco não recomeça do zero.
  const [lista] = useState(participantes)
  const [travados, setTravados] = useState(0)
  const [quadro, setQuadro] = useState(0)
  const fechado = useRef(false)

  const bolo = useMemo(() => (elenco?.length ? elenco : lista.map((pessoa) => pessoa.timeId)), [elenco, lista])
  const acabou = travados >= lista.length

  // Uma peça trava por vez, cada uma com seu estalo.
  useEffect(() => {
    const relogios = lista.map((_, indice) =>
      window.setTimeout(
        () => {
          setTravados(indice + 1)
          tocar('travar')
          vibrar(14)
        },
        ESPERA_INICIAL + indice * INTERVALO_TRAVA,
      ),
    )
    const fim = window.setTimeout(
      () => {
        tocar('fanfarra')
        vibrar([30, 60, 30])
      },
      ESPERA_INICIAL + lista.length * INTERVALO_TRAVA + 120,
    )
    return () => {
      relogios.forEach(window.clearTimeout)
      window.clearTimeout(fim)
    }
  }, [lista])

  // Escudos girando enquanto ainda há peça para travar.
  useEffect(() => {
    if (acabou) return undefined
    const giro = window.setInterval(() => {
      setQuadro((atual) => {
        // O tique sai a cada três quadros: um por quadro viraria chiado.
        if (atual % 3 === 0) tocar('rolar')
        return atual + 1
      })
    }, QUADRO_ROLAGEM)
    return () => window.clearInterval(giro)
  }, [acabou])

  // Esc fecha, como qualquer tela que cobre o site.
  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') aoFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  const timeDaVez = (indice) => bolo[(quadro * 5 + indice * 3) % bolo.length] ?? 'sem-time'

  const fechar = () => {
    if (fechado.current) return
    fechado.current = true
    aoFechar()
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-carvao/95 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Sorteio dos times"
    >
      <div className="varredura pointer-events-none fixed inset-0" aria-hidden="true" />
      {acabou ? <Confete pecas={26} /> : null}

      <div className="relative mx-auto max-w-5xl">
        <div className="animar-letreiro mb-6 text-center">
          <p className="rotulo text-[11px] text-lima">Unidos Acamp · FIFA</p>
          <h2 className="mt-2 text-4xl text-creme sm:text-6xl">
            {acabou ? 'Times sorteados' : <span className="piscar-duro">Sorteando…</span>}
          </h2>
          <p className="mt-3 text-[13px] font-medium text-creme/70">
            {acabou
              ? 'É isso aí: cada um com o seu. Quem não gostou, joga melhor.'
              : `${travados} de ${lista.length} definidos`}
          </p>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((participante, indice) => {
            const travado = indice < travados
            const timeId = travado ? participante.timeId : timeDaVez(indice)
            const time = buscarTime(timeId)
            return (
              <li
                key={participante.id}
                className={`contorno flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                  travado ? 'bg-papel-claro' : 'bg-papel-claro/25'
                }`}
              >
                <span key={travado ? 'travado' : 'girando'} className={travado ? 'animar-travar' : ''}>
                  <EscudoTime timeId={timeId} tamanho="md" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[14px] font-bold ${travado ? 'text-tinta' : 'text-tinta/50'}`}>
                    {participante.nome}
                  </p>
                  <p className="truncate text-[12px] text-tinta-media">
                    {travado ? time.nome : <span className="piscar-duro">sorteando…</span>}
                  </p>
                </div>
                {travado && time.forca ? (
                  <span className="num contorno shrink-0 rounded-md bg-lima px-1.5 font-display text-[13px] text-carvao">
                    {time.forca}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>

        <div className="mt-6 flex justify-center">
          <Botao icone={X} onClick={fechar} variante={acabou ? 'primario' : 'papel'}>
            {acabou ? 'Fechar' : 'Pular'}
          </Botao>
        </div>
      </div>
    </div>
  )
}
