import { Swords } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { Botao, Cartao, EscudoTime, EstadoVazio, TituloSecao } from './ui.jsx'

function Posicao({ rotulo, participante, primeiro = false }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className={`num w-4 shrink-0 text-[13px] ${primeiro ? 'text-realce' : 'text-zinc-600'}`}>{rotulo}</span>
      {participante ? (
        <>
          <EscudoTime timeId={participante.timeId} tamanho="sm" />
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[13px] ${primeiro ? 'font-medium text-zinc-100' : 'text-zinc-300'}`}>
              {participante.nome}
            </p>
            <p className="truncate text-[11px] text-zinc-600">{buscarTime(participante.timeId).nome}</p>
          </div>
        </>
      ) : (
        <p className="text-[13px] text-zinc-600">A definir</p>
      )}
    </div>
  )
}

export function Chaveamento({ torneio, aoEditarPartida, aoIrParaAdmin, somenteLeitura }) {
  if (!torneio.ativo) {
    return (
      <EstadoVazio
        icone={Swords}
        titulo="Chaveamento ainda não sorteado"
        descricao="Cadastre os participantes no Painel Admin e faça o sorteio para gerar as chaves."
        acao={
          somenteLeitura ? null : (
            <Botao variante="contorno" onClick={aoIrParaAdmin}>
              Abrir Painel Admin
            </Botao>
          )
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {torneio.campeao ? (
        <Cartao className="flex items-center gap-4 border-realce/25 p-5">
          <EscudoTime timeId={torneio.campeao.timeId} tamanho="lg" />
          <div className="min-w-0">
            <p className="rotulo text-realce">Campeão</p>
            <h2 className="mt-1 truncate text-xl font-semibold text-zinc-50">{torneio.campeao.nome}</h2>
            <p className="truncate text-[13px] text-zinc-500">
              {buscarTime(torneio.campeao.timeId).nome} · prêmio de R$ 100,00
            </p>
          </div>
        </Cartao>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
        <Cartao className="divide-y divide-borda overflow-hidden">
          <div className="px-4 py-3">
            <h3 className="text-[13px] font-medium text-zinc-300">Classificação final</h3>
          </div>
          <Posicao rotulo="1" participante={torneio.campeao} primeiro />
          <Posicao rotulo="2" participante={torneio.vice} />
          <Posicao rotulo="3" participante={torneio.terceiro} />
        </Cartao>

        <Cartao className="p-4 sm:p-5">
          <TituloSecao
            className="mb-5"
            titulo="Chave principal"
            descricao={
              somenteLeitura
                ? 'Quem perde na primeira fase cai para a repescagem.'
                : 'Quem perde na primeira fase cai para a repescagem. Toque em um jogo para lançar o resultado.'
            }
            acao={
              <span className="num shrink-0 text-[13px] text-zinc-500">
                {torneio.partidasFinalizadas} de {torneio.totalPartidas} jogos
              </span>
            }
          />
          <ChaveVisual rodadas={torneio.principal} aoEditar={aoEditarPartida} />
        </Cartao>
      </div>
    </div>
  )
}
