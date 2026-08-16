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
/* Desktop — colunas ligadas por traços grossos                               */
/* -------------------------------------------------------------------------- */

function ChaveDesktop({ rodadas, aoEditar }) {
  return (
    <div className="scrollbar-fina hidden overflow-x-auto pb-3 md:block">
      <div className="flex min-w-max items-stretch gap-10 px-1 pt-1">
        {rodadas.map((rodada, indiceRodada) => {
          const ultima = indiceRodada === rodadas.length - 1
          const terminada = concluidas(rodada) === rodada.partidas.length
          return (
            <div key={rodada.rodada} className="flex w-[256px] flex-col">
              <div
                className={`contorno sombra-p mb-5 rounded-lg px-3 py-2 text-center ${
                  ultima ? 'bg-cobalto text-white' : terminada ? 'bg-lima' : 'bg-papel-claro'
                }`}
              >
                <p className="font-display text-[13px] uppercase">{rodada.nome}</p>
                <p className={`rotulo num mt-1 text-[9px] ${ultima ? 'text-white/70' : 'text-tinta-media'}`}>
                  {concluidas(rodada)} de {rodada.partidas.length} jogos
                </p>
              </div>

              <div className="flex flex-1 flex-col justify-around">
                {agruparEmPares(rodada.partidas).map((par, indicePar) => (
                  <div key={indicePar} className="relative flex flex-1 flex-col justify-around">
                    {par.length === 2 && !ultima ? (
                      <span
                        className="absolute top-1/4 bottom-1/4 -right-5 w-[2px] bg-tinta"
                        aria-hidden="true"
                      />
                    ) : null}

                    {par.map((partida) => (
                      <div key={partida.id} className="relative py-2">
                        {indiceRodada > 0 ? (
                          <span className="absolute top-1/2 -left-5 h-[2px] w-5 bg-tinta" aria-hidden="true" />
                        ) : null}
                        {!ultima ? (
                          <span className="absolute top-1/2 -right-5 h-[2px] w-5 bg-tinta" aria-hidden="true" />
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
      <div className="sem-barra -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1">
        {rodadas.map((item, indice) => {
          const selecionada = indice === ativa
          return (
            <button
              key={item.rodada}
              type="button"
              onClick={() => setAtiva(indice)}
              className={`contorno rotulo shrink-0 rounded-lg px-3 py-2 text-[10px] ${
                selecionada ? 'sombra-p bg-lima text-tinta' : 'bg-papel-claro text-tinta-media'
              }`}
            >
              {item.nomeCurto}
              <span className="num ml-1.5 opacity-60">
                {concluidas(item)}/{item.partidas.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="animar-entrar space-y-3">
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
