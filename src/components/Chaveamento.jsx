import { Swords } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { Botao, Cartao, EscudoTime, EstadoVazio, TituloSecao } from './ui.jsx'

function Posicao({ numero, rotulo, participante, primeiro = false }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className={`num font-serif text-2xl leading-none ${primeiro ? 'dourado' : 'text-perola-600'}`}>
        {numero}
      </span>
      {participante ? (
        <>
          <EscudoTime timeId={participante.timeId} tamanho="sm" vencedor={primeiro} />
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[13px] ${primeiro ? 'text-perola-100' : 'text-perola-300'}`}>
              {participante.nome}
            </p>
            <p className="truncate text-[11px] text-perola-600">{buscarTime(participante.timeId).nome}</p>
          </div>
          <span className="rotulo shrink-0">{rotulo}</span>
        </>
      ) : (
        <>
          <p className="flex-1 text-[13px] text-perola-600 italic">A definir</p>
          <span className="rotulo shrink-0">{rotulo}</span>
        </>
      )}
    </div>
  )
}

function Consagracao({ campeao }) {
  return (
    <Cartao realce className="relative overflow-hidden px-6 py-8 text-center sm:px-10 sm:py-10">
      <span
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(227,200,140,0.22),transparent)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-4">
        <EscudoTime timeId={campeao.timeId} tamanho="lg" vencedor />
        <div>
          <p className="rotulo text-realce/80">Campeão do Unidos Acamp</p>
          <h2 className="dourado mt-3 font-serif text-4xl leading-none sm:text-5xl">{campeao.nome}</h2>
          <p className="mt-3 text-[13px] text-perola-400">
            {buscarTime(campeao.timeId).nome} · leva os R$ 100,00
          </p>
        </div>
      </div>
    </Cartao>
  )
}

export function Chaveamento({ torneio, aoEditarPartida, aoIrParaAdmin, somenteLeitura }) {
  if (!torneio.ativo) {
    return (
      <EstadoVazio
        icone={Swords}
        titulo="O chaveamento ainda não foi sorteado"
        descricao="Cadastre os participantes no Painel Admin e faça o sorteio para gerar as chaves do mata-mata."
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
      {torneio.campeao ? <Consagracao campeao={torneio.campeao} /> : null}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <Cartao className="overflow-hidden">
          <div className="border-b border-borda px-5 py-4">
            <h3 className="font-serif text-lg leading-none text-perola-100">Pódio</h3>
            <p className="mt-2 text-[12px] text-perola-500">O terceiro lugar sai da repescagem.</p>
          </div>
          <div className="divide-y divide-borda/70">
            <Posicao numero="1" rotulo="Campeão" participante={torneio.campeao} primeiro />
            <Posicao numero="2" rotulo="Vice" participante={torneio.vice} />
            <Posicao numero="3" rotulo="Terceiro" participante={torneio.terceiro} />
          </div>
        </Cartao>

        <Cartao className="p-5 sm:p-7">
          <TituloSecao
            className="mb-8"
            titulo="Chave principal"
            descricao={
              somenteLeitura
                ? 'Quem perde na primeira fase cai para a repescagem.'
                : 'Quem perde na primeira fase cai para a repescagem. Toque em um jogo para lançar o resultado.'
            }
            acao={
              <div className="shrink-0 text-right">
                <p className="num font-serif text-2xl leading-none text-perola-100">
                  {torneio.partidasFinalizadas}
                  <span className="text-perola-600">/{torneio.totalPartidas}</span>
                </p>
                <p className="rotulo mt-1.5">Jogos</p>
              </div>
            }
          />
          <ChaveVisual rodadas={torneio.principal} aoEditar={aoEditarPartida} />
        </Cartao>
      </div>
    </div>
  )
}
