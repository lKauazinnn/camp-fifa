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

  return (
    <div className="space-y-4">
      <Cartao className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-[15px] font-semibold text-zinc-100">Chave dos eliminados</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
              Ninguém joga uma partida só. Todos os eliminados da primeira fase caem automaticamente nesta chave e
              seguem se enfrentando — quem vencer tudo aqui fica com o terceiro lugar.
            </p>
          </div>

          <div className="shrink-0 rounded-lg border border-borda bg-elevado px-4 py-3">
            <p className="rotulo">Terceiro lugar</p>
            {torneio.terceiro ? (
              <div className="mt-1.5 flex items-center gap-2.5">
                <EscudoTime timeId={torneio.terceiro.timeId} tamanho="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-zinc-100">{torneio.terceiro.nome}</p>
                  <p className="truncate text-[11px] text-zinc-600">{buscarTime(torneio.terceiro.timeId).nome}</p>
                </div>
              </div>
            ) : (
              <p className="mt-1.5 text-[13px] text-zinc-600">
                {decisao ? 'Definido na última rodada da repescagem' : 'A definir'}
              </p>
            )}
          </div>
        </div>
      </Cartao>

      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          className="mb-5"
          titulo="Repescagem"
          descricao={somenteLeitura ? null : 'Toque em um jogo para lançar o resultado.'}
          acao={
            <span className="num shrink-0 text-[13px] text-zinc-500">
              {torneio.repescagem.reduce(
                (total, rodada) => total + rodada.partidas.filter((p) => p.status === 'finalizada').length,
                0,
              )}{' '}
              de{' '}
              {torneio.repescagem.reduce(
                (total, rodada) => total + rodada.partidas.filter((p) => p.status !== 'vazia' && p.status !== 'bye').length,
                0,
              )}{' '}
              jogos
            </span>
          }
        />
        <ChaveVisual rodadas={torneio.repescagem} aoEditar={aoEditarPartida} />
      </Cartao>
    </div>
  )
}
