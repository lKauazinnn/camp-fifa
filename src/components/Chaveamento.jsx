import { buscarTime } from '../data/times.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { Botao, Cartao, EscudoTime, EstadoVazio, TituloSecao } from './ui.jsx'

const MEDALHAS = [
  { numero: '1', rotulo: 'Campeão', cor: 'bg-lima text-carvao' },
  { numero: '2', rotulo: 'Vice', cor: 'bg-papel-escuro' },
  { numero: '3', rotulo: 'Terceiro', cor: 'bg-laranja text-white' },
]

function Posicao({ indice, participante }) {
  const medalha = MEDALHAS[indice]
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={`contorno grid size-9 shrink-0 place-items-center rounded-lg font-display text-lg ${medalha.cor}`}>
        {medalha.numero}
      </span>
      {participante ? (
        <>
          <EscudoTime timeId={participante.timeId} tamanho="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold">{participante.nome}</p>
            <p className="truncate text-[11px] text-tinta-fraca">{buscarTime(participante.timeId).nome}</p>
          </div>
        </>
      ) : (
        <p className="flex-1 text-[13px] text-tinta-fraca">ainda em disputa</p>
      )}
      <span className="rotulo shrink-0 text-[9px] text-tinta-media">{medalha.rotulo}</span>
    </div>
  )
}

function Campeao({ campeao }) {
  return (
    <div className="contorno sombra-g relative overflow-hidden rounded-xl bg-cobalto px-6 py-8 text-white sm:px-10">
      <div className="listrado absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <EscudoTime timeId={campeao.timeId} tamanho="lg" />
        <div className="min-w-0">
          <span className="contorno rotulo inline-block rounded-md bg-lima px-2 py-1 text-[10px] text-carvao">
            Campeão 🏆
          </span>
          <h2 className="mt-3 truncate text-4xl text-white sm:text-5xl">{campeao.nome}</h2>
          <p className="mt-2 text-[14px] font-medium text-white/80">
            {buscarTime(campeao.timeId).nome} · levou os R$ 100
          </p>
        </div>
      </div>
    </div>
  )
}

export function Chaveamento({ torneio, aoEditarPartida, aoIrParaAdmin, somenteLeitura }) {
  if (!torneio.ativo) {
    return (
      <EstadoVazio
        titulo="Ainda não tem chaveamento"
        descricao="Cadastre a galera no Painel Admin e clique em sortear. As chaves e a repescagem saem prontas na hora."
        acao={
          somenteLeitura ? null : (
            <Botao onClick={aoIrParaAdmin}>Ir para o Painel Admin</Botao>
          )
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      {torneio.campeao ? <Campeao campeao={torneio.campeao} /> : null}

      <div className="grid gap-5 lg:grid-cols-[300px_1fr] lg:items-start">
        <Cartao className="overflow-hidden">
          <div className="border-b-2 border-tinta bg-papel-escuro px-4 py-3">
            <h3 className="text-xl">Pódio</h3>
            <p className="mt-1 text-[12px] text-tinta-media">O terceiro sai da repescagem.</p>
          </div>
          <div className="divide-y-2 divide-papel-escuro">
            <Posicao indice={0} participante={torneio.campeao} />
            <Posicao indice={1} participante={torneio.vice} />
            <Posicao indice={2} participante={torneio.terceiro} />
          </div>
        </Cartao>

        <Cartao className="p-4 sm:p-6">
          <TituloSecao
            className="mb-6"
            titulo="Chave principal"
            descricao={
              somenteLeitura
                ? 'Quem perde na primeira fase cai pra repescagem.'
                : 'Quem perde na primeira fase cai pra repescagem. Toque num jogo pra lançar o placar.'
            }
            acao={
              <div className="contorno shrink-0 rounded-lg bg-lima px-3 py-2 text-center text-carvao">
                <p className="num font-display text-2xl leading-none">
                  {torneio.partidasFinalizadas}
                  <span className="opacity-45">/{torneio.totalPartidas}</span>
                </p>
                <p className="rotulo mt-1 text-[9px] opacity-70">Jogos</p>
              </div>
            }
          />
          <ChaveVisual rodadas={torneio.principal} aoEditar={aoEditarPartida} />
        </Cartao>
      </div>
    </div>
  )
}
