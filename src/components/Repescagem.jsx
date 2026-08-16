import { RotateCcw } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { Cartao, EscudoTime, EstadoVazio, TituloSecao } from './ui.jsx'

export function Repescagem({ torneio, aoEditarPartida, somenteLeitura }) {
  if (!torneio.ativo || !torneio.repescagem.length) {
    return (
      <EstadoVazio
        icone={RotateCcw}
        titulo="Repescagem indisponível"
        descricao="A chave dos eliminados é criada junto com o sorteio da primeira fase."
      />
    )
  }

  const decisao = torneio.repescagem.at(-1)?.partidas[0] ?? null
  const disputados = torneio.repescagem.reduce(
    (total, rodada) => total + rodada.partidas.filter((partida) => partida.status === 'finalizada').length,
    0,
  )
  const totais = torneio.repescagem.reduce(
    (total, rodada) =>
      total + rodada.partidas.filter((partida) => partida.status !== 'vazia' && partida.status !== 'bye').length,
    0,
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <Cartao className="p-5 sm:p-7">
          <h2 className="font-serif text-2xl leading-none text-perola-100">Segunda chance</h2>
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-perola-400">
            Ninguém viaja para o acampamento para jogar uma partida só. Todos os eliminados da primeira fase caem
            automaticamente nesta chave e seguem se enfrentando — quem vencer tudo aqui termina o campeonato em{' '}
            <span className="text-realce">terceiro lugar</span>.
          </p>
        </Cartao>

        <Cartao realce={Boolean(torneio.terceiro)} className="p-5">
          <p className="rotulo">Terceiro lugar</p>
          {torneio.terceiro ? (
            <div className="mt-4 flex items-center gap-3">
              <EscudoTime timeId={torneio.terceiro.timeId} tamanho="md" vencedor />
              <div className="min-w-0">
                <p className="truncate font-serif text-xl leading-none text-perola-100">{torneio.terceiro.nome}</p>
                <p className="mt-1.5 truncate text-[11px] text-perola-500">
                  {buscarTime(torneio.terceiro.timeId).nome}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[13px] leading-relaxed text-perola-500 italic">
              {decisao ? 'Decidido na última rodada da repescagem.' : 'A definir.'}
            </p>
          )}
        </Cartao>
      </div>

      <Cartao className="p-5 sm:p-7">
        <TituloSecao
          className="mb-8"
          titulo="Chave da repescagem"
          descricao={somenteLeitura ? null : 'Toque em um jogo para lançar o resultado.'}
          acao={
            <div className="shrink-0 text-right">
              <p className="num font-serif text-2xl leading-none text-perola-100">
                {disputados}
                <span className="text-perola-600">/{totais}</span>
              </p>
              <p className="rotulo mt-1.5">Jogos</p>
            </div>
          }
        />
        <ChaveVisual rodadas={torneio.repescagem} aoEditar={aoEditarPartida} />
      </Cartao>
    </div>
  )
}
