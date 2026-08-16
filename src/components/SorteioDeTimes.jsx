import { useMemo, useState } from 'react'
import { Dices, Eraser, Search } from 'lucide-react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { Botao, BotaoTexto, Cartao, EscudoTime, TituloSecao } from './ui.jsx'

const CAMPO =
  'contorno w-full rounded-lg bg-papel-claro px-3.5 py-2.5 text-[14px] font-medium placeholder:text-tinta-fraca focus:bg-lima/20 focus:outline-none'

/**
 * Escolha do elenco e sorteio dos times entre os inscritos.
 *
 * A ordem do acampamento é: todo mundo se inscreve, a organização vê quantos
 * são, marca quais times entram no bolo e sorteia — um time por pessoa.
 */
export function SorteioDeTimes({ participantes, acoes, aoPedirConfirmacao }) {
  const { times, buscarTime } = useTimes()
  const [selecionados, setSelecionados] = useState(() => new Set(times.map((time) => time.id)))
  const [busca, setBusca] = useState('')
  const [ligaAberta, setLigaAberta] = useState(null)

  const jaSorteado = participantes.some((participante) => participante.timeId !== 'sem-time')
  // Mais gente que time não impede o sorteio: o elenco repete, distribuído por igual.
  const repeticoes = selecionados.size ? Math.ceil(participantes.length / selecionados.size) : 0
  const vaiRepetir = repeticoes > 1

  const porLiga = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = termo ? times.filter((time) => time.nome.toLowerCase().includes(termo)) : times
    return filtrados.reduce((mapa, time) => {
      ;(mapa[time.liga] ??= []).push(time)
      return mapa
    }, {})
  }, [times, busca])

  const alternar = (id) =>
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })

  const alternarLiga = (liga) => {
    const daLiga = porLiga[liga].map((time) => time.id)
    const todosDentro = daLiga.every((id) => selecionados.has(id))
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      daLiga.forEach((id) => (todosDentro ? proximo.delete(id) : proximo.add(id)))
      return proximo
    })
  }

  const sortear = () => {
    const acao = () => acoes.sortearTimes([...selecionados])
    if (!jaSorteado) return acao()
    aoPedirConfirmacao({
      titulo: 'Sortear os times de novo?',
      descricao: 'Todo mundo troca de time. Quem já sabia o seu vai receber outro.',
      textoConfirmar: 'Sortear de novo',
      acao,
    })
  }

  return (
    <Cartao className="p-4 sm:p-6">
      <TituloSecao
        className="mb-4"
        titulo="Sorteio dos times"
        descricao="Marque quais times entram no bolo e sorteie: cada jogador recebe um, sem repetir."
        acao={
          <div
            className={`contorno shrink-0 rounded-lg px-3 py-2 text-center ${
              selecionados.size ? 'bg-lima text-carvao' : 'bg-rosa text-white'
            }`}
          >
            <p className="num font-display text-2xl leading-none">
              {selecionados.size}
              <span className="opacity-50">/{participantes.length}</span>
            </p>
            <p className="rotulo mt-1 text-[9px] opacity-70">times · jogadores</p>
          </div>
        }
      />

      {!selecionados.size ? (
        <p className="contorno mb-4 rounded-lg bg-rosa px-3 py-2 text-[12px] font-bold text-white">
          Marque pelo menos um time para poder sortear.
        </p>
      ) : vaiRepetir ? (
        <p className="contorno mb-4 rounded-lg bg-cobalto px-3 py-2 text-[12px] font-bold text-white">
          São {participantes.length} jogadores para {selecionados.size} times, então cada time sai para até{' '}
          {repeticoes} pessoas — distribuído por igual. Marque mais times se quiser reduzir a repetição.
        </p>
      ) : (
        <p className="contorno mb-4 rounded-lg bg-lima px-3 py-2 text-[12px] font-bold text-carvao">
          Dá um time para cada jogador, sem repetir ninguém.
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-44 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-fraca"
            strokeWidth={2.5}
          />
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Procurar time"
            className={`${CAMPO} pl-9`}
          />
        </div>
        <BotaoTexto onClick={() => setSelecionados(new Set(times.map((time) => time.id)))}>Marcar todos</BotaoTexto>
        <BotaoTexto onClick={() => setSelecionados(new Set())}>Desmarcar</BotaoTexto>
      </div>

      <div className="space-y-2">
        {Object.entries(porLiga).map(([liga, daLiga]) => {
          const dentro = daLiga.filter((time) => selecionados.has(time.id)).length
          const aberta = ligaAberta === liga || Boolean(busca.trim())
          return (
            <div key={liga} className="contorno overflow-hidden rounded-lg">
              <div className="flex items-center gap-2 bg-papel-escuro px-3 py-2">
                <button
                  type="button"
                  onClick={() => setLigaAberta(aberta && !busca.trim() ? null : liga)}
                  className="rotulo flex-1 text-left text-[10px]"
                >
                  {liga} · {dentro}/{daLiga.length}
                </button>
                <button type="button" onClick={() => alternarLiga(liga)} className="rotulo text-[10px] underline">
                  {daLiga.every((time) => selecionados.has(time.id)) ? 'tirar liga' : 'pôr liga'}
                </button>
              </div>

              {aberta ? (
                <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-3">
                  {daLiga.map((time) => {
                    const marcado = selecionados.has(time.id)
                    return (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => alternar(time.id)}
                        className={`contorno flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors ${
                          marcado ? 'bg-lima text-carvao' : 'bg-papel-claro opacity-60'
                        }`}
                      >
                        <EscudoTime timeId={time.id} tamanho="sm" />
                        <span className="min-w-0 flex-1 truncate text-[11px] leading-tight font-bold">
                          {time.nome}
                        </span>
                        {time.forca ? (
                          <span className="num contorno shrink-0 rounded bg-papel-claro px-1 font-display text-[10px] text-carvao">
                            {time.forca}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <Botao icone={Dices} onClick={sortear} disabled={participantes.length < 1 || !selecionados.size}>
          {jaSorteado ? 'Sortear de novo' : 'Sortear os times'}
        </Botao>
        {jaSorteado ? (
          <BotaoTexto
            icone={Eraser}
            onClick={() =>
              aoPedirConfirmacao({
                titulo: 'Tirar os times de todo mundo?',
                descricao: 'Os jogadores voltam a ficar sem time até um novo sorteio.',
                textoConfirmar: 'Tirar',
                acao: acoes.limparTimes,
              })
            }
          >
            Zerar times
          </BotaoTexto>
        ) : null}
      </div>

      {jaSorteado ? (
        <div className="mt-4">
          <p className="rotulo mb-2 text-[10px] text-tinta-media">Resultado do sorteio</p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {participantes.map((participante) => (
              <li
                key={participante.id}
                className="contorno flex items-center gap-2.5 rounded-lg bg-papel-claro px-2.5 py-1.5"
              >
                <EscudoTime timeId={participante.timeId} tamanho="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{participante.nome}</span>
                  <span className="block truncate text-[11px] text-tinta-fraca">
                    {buscarTime(participante.timeId).nome}
                  </span>
                </span>
                {buscarTime(participante.timeId).forca ? (
                  <span className="num shrink-0 font-display text-[12px] text-tinta-media">
                    {buscarTime(participante.timeId).forca}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Cartao>
  )
}
