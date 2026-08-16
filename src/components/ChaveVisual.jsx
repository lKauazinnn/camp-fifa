import { useEffect, useMemo, useState } from 'react'
import { CartaoPartida } from './CartaoPartida.jsx'

function agruparEmPares(partidas) {
  const pares = []
  for (let indice = 0; indice < partidas.length; indice += 2) {
    pares.push(partidas.slice(indice, indice + 2))
  }
  return pares
}

function concluidas(rodada) {
  return rodada.partidas.filter((partida) => partida.status === 'finalizada').length
}

/* -------------------------------------------------------------------------- */
/* Desktop — colunas ligadas por hairlines                                    */
/* -------------------------------------------------------------------------- */

function ChaveDesktop({ rodadas, aoEditar }) {
  return (
    <div className="scrollbar-fina hidden overflow-x-auto pb-2 md:block">
      <div className="flex min-w-max items-stretch gap-12 px-px">
        {rodadas.map((rodada, indiceRodada) => {
          const ultima = indiceRodada === rodadas.length - 1
          return (
            <div key={rodada.rodada} className="flex w-[258px] flex-col">
              <div className="mb-5 text-center">
                <p className={`font-serif text-[15px] leading-none ${ultima ? 'dourado' : 'text-perola-200'}`}>
                  {rodada.nome}
                </p>
                <p className="num mt-2 text-[10px] tracking-[0.14em] text-perola-600 uppercase">
                  {concluidas(rodada)} de {rodada.partidas.length}
                </p>
              </div>

              <div className="flex flex-1 flex-col justify-around">
                {agruparEmPares(rodada.partidas).map((par, indicePar) => (
                  <div key={indicePar} className="relative flex flex-1 flex-col justify-around">
                    {par.length === 2 && !ultima ? (
                      <span className="absolute top-1/4 bottom-1/4 -right-6 w-px bg-borda" aria-hidden="true" />
                    ) : null}

                    {par.map((partida) => (
                      <div key={partida.id} className="relative py-2.5">
                        {indiceRodada > 0 ? (
                          <span className="absolute top-1/2 -left-6 h-px w-6 bg-borda" aria-hidden="true" />
                        ) : null}
                        {!ultima ? (
                          <span className="absolute top-1/2 -right-6 h-px w-6 bg-borda" aria-hidden="true" />
                        ) : null}
                        <CartaoPartida partida={partida} aoEditar={aoEditar} destaque={ultima} />
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
/* Mobile — uma fase por vez                                                  */
/* -------------------------------------------------------------------------- */

function ChaveMobile({ rodadas, aoEditar }) {
  const sugerida = useMemo(() => {
    const indice = rodadas.findIndex((rodada) => rodada.partidas.some((partida) => partida.status !== 'finalizada'))
    return indice === -1 ? rodadas.length - 1 : indice
  }, [rodadas])

  const [ativa, setAtiva] = useState(sugerida)

  useEffect(() => {
    setAtiva((atual) => Math.min(atual, rodadas.length - 1))
  }, [rodadas.length])

  const rodada = rodadas[ativa]
  if (!rodada) return null

  return (
    <div className="md:hidden">
      <div className="sem-barra -mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {rodadas.map((item, indice) => {
          const selecionada = indice === ativa
          return (
            <button
              key={item.rodada}
              type="button"
              onClick={() => setAtiva(indice)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
                selecionada
                  ? 'border-realce/40 bg-realce/10 text-realce'
                  : 'border-borda text-perola-500 hover:text-perola-300'
              }`}
            >
              {item.nomeCurto}
              <span className="num ml-2 text-[10px] opacity-70">
                {concluidas(item)}/{item.partidas.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="animar-surgir space-y-2.5">
        {rodada.partidas.map((partida) => (
          <CartaoPartida
            key={partida.id}
            partida={partida}
            aoEditar={aoEditar}
            destaque={ativa === rodadas.length - 1}
          />
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
