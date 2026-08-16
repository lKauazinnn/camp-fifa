import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CartaoPartida } from './CartaoPartida.jsx'

function agruparEmPares(partidas) {
  const pares = []
  for (let indice = 0; indice < partidas.length; indice += 2) {
    pares.push(partidas.slice(indice, indice + 2))
  }
  return pares
}

function CabecalhoRodada({ rodada, total, final }) {
  return (
    <div className="mb-3 text-center">
      <p
        className={`font-display text-[11px] font-bold tracking-[0.18em] uppercase ${final ? 'text-gold-300' : 'text-royal-300'}`}
      >
        {rodada.nome}
      </p>
      <p className="text-[10px] text-slate-500">
        {total} {total === 1 ? 'jogo' : 'jogos'}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Desktop: colunas ligadas por conectores                                    */
/* -------------------------------------------------------------------------- */

function ChaveDesktop({ rodadas, aoEditar }) {
  return (
    <div className="scrollbar-fina hidden overflow-x-auto pb-4 md:block">
      <div className="flex min-w-max items-stretch gap-8 px-1">
        {rodadas.map((rodada, indiceRodada) => {
          const ultimaRodada = indiceRodada === rodadas.length - 1
          return (
            <div key={rodada.rodada} className="flex w-[236px] flex-col">
              <CabecalhoRodada rodada={rodada} total={rodada.partidas.length} final={ultimaRodada} />

              <div className="flex flex-1 flex-col justify-around">
                {agruparEmPares(rodada.partidas).map((par, indicePar) => (
                  <div key={indicePar} className="relative flex flex-1 flex-col justify-around">
                    {par.length === 2 && !ultimaRodada ? (
                      <span className="absolute top-1/4 bottom-1/4 -right-4 w-px bg-white/15" aria-hidden="true" />
                    ) : null}

                    {par.map((partida) => (
                      <div key={partida.id} className="relative py-1.5">
                        {indiceRodada > 0 ? (
                          <span className="absolute top-1/2 -left-4 h-px w-4 bg-white/15" aria-hidden="true" />
                        ) : null}
                        {!ultimaRodada ? (
                          <span className="absolute top-1/2 -right-4 h-px w-4 bg-white/15" aria-hidden="true" />
                        ) : null}
                        <CartaoPartida partida={partida} aoEditar={aoEditar} destaque={ultimaRodada} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mobile: uma fase por vez, com navegação por chips                          */
/* -------------------------------------------------------------------------- */

function ChaveMobile({ rodadas, aoEditar }) {
  const rodadaSugerida = useMemo(() => {
    const emAndamento = rodadas.findIndex((rodada) => rodada.partidas.some((partida) => partida.status !== 'finalizada'))
    return emAndamento === -1 ? rodadas.length - 1 : emAndamento
  }, [rodadas])

  const [rodadaAtiva, setRodadaAtiva] = useState(rodadaSugerida)

  useEffect(() => {
    setRodadaAtiva((atual) => Math.min(atual, rodadas.length - 1))
  }, [rodadas.length])

  const rodada = rodadas[rodadaAtiva]
  if (!rodada) return null

  const ultimaRodada = rodadaAtiva === rodadas.length - 1

  return (
    <div className="md:hidden">
      <div className="scrollbar-fina -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {rodadas.map((item, indice) => {
          const concluida = item.partidas.every((partida) => partida.status === 'finalizada' || partida.status === 'bye')
          const ativa = indice === rodadaAtiva
          return (
            <button
              key={item.rodada}
              type="button"
              onClick={() => setRodadaAtiva(indice)}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-display text-[11px] font-bold tracking-wider uppercase transition ${
                ativa
                  ? 'border-neon-400/60 bg-neon-400/15 text-neon-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {item.nomeCurto}
              {concluida ? <span className="ml-1 text-neon-400">✓</span> : null}
            </button>
          )
        })}
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setRodadaAtiva((atual) => Math.max(0, atual - 1))}
          disabled={rodadaAtiva === 0}
          className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 disabled:opacity-30"
          aria-label="Fase anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className={`font-display text-xs font-bold tracking-widest uppercase ${ultimaRodada ? 'text-gold-300' : 'text-royal-300'}`}>
            {rodada.nome}
          </p>
          <p className="text-[10px] text-slate-500">
            {rodada.partidas.filter((partida) => partida.status === 'finalizada').length} de {rodada.partidas.length} concluídos
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRodadaAtiva((atual) => Math.min(rodadas.length - 1, atual + 1))}
          disabled={ultimaRodada}
          className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 disabled:opacity-30"
          aria-label="Próxima fase"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="animar-surgir space-y-2.5">
        {rodada.partidas.map((partida) => (
          <CartaoPartida key={partida.id} partida={partida} aoEditar={aoEditar} destaque={ultimaRodada} />
        ))}
      </div>
    </div>
  )
}

export function ChaveVisual({ rodadas, aoEditar }) {
  if (!rodadas?.length) return null
  return (
    <>
      <ChaveDesktop rodadas={rodadas} aoEditar={aoEditar} />
      <ChaveMobile rodadas={rodadas} aoEditar={aoEditar} />
    </>
  )
}
