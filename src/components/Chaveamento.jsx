import { useEffect } from 'react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { tocar } from '../lib/som.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { Botao, Cartao, Confete, EscudoTime, EstadoVazio, NumeroAnimado, TituloSecao } from './ui.jsx'

const MEDALHAS = [
  { numero: '1', rotulo: 'Campeão', cor: 'bg-lima text-carvao' },
  { numero: '2', rotulo: 'Vice', cor: 'bg-papel-escuro' },
  { numero: '3', rotulo: 'Terceiro', cor: 'bg-laranja text-white' },
]

function Posicao({ indice, participante }) {
  const { buscarTime } = useTimes()
  const medalha = MEDALHAS[indice]
  const definido = Boolean(participante)

  return (
    <div
      className="animar-degrau flex items-center gap-3 px-4 py-3"
      // Cascata do primeiro ao terceiro degrau.
      style={{ animationDelay: `${indice * 120}ms` }}
    >
      <span
        className={`contorno grid size-9 shrink-0 place-items-center rounded-lg font-display text-lg ${medalha.cor} ${
          indice === 0 && definido ? 'animar-medalha' : ''
        }`}
      >
        {medalha.numero}
      </span>
      {participante ? <EscudoTime timeId={participante.timeId} tamanho="sm" /> : null}

      {/* Rótulo em cima do nome, e não na ponta da linha: lado a lado, os três
          degraus são estreitos demais para uma coluna só de texto. */}
      <div className="min-w-0 flex-1">
        <p className="rotulo text-[9px] text-tinta-media">{medalha.rotulo}</p>
        {participante ? (
          <>
            <p className="truncate text-[14px] leading-tight font-bold">{participante.nome}</p>
            <p className="truncate text-[11px] text-tinta-fraca">{buscarTime(participante.timeId).nome}</p>
          </>
        ) : (
          <p className="text-[13px] text-tinta-fraca">ainda em disputa</p>
        )}
      </div>
    </div>
  )
}

function Campeao({ campeao }) {
  const { buscarTime } = useTimes()

  // A taça saiu: toca a fanfarra na primeira vez que este campeão aparece.
  useEffect(() => {
    tocar('fanfarra')
  }, [campeao.id])

  return (
    <div className="animar-carimbo contorno sombra-g relative overflow-hidden rounded-xl bg-cobalto px-5 py-7 text-white sm:px-10 sm:py-8">
      <div className="listrado absolute inset-0" aria-hidden="true" />
      <div className="varredura absolute inset-0" aria-hidden="true" />
      <Confete pecas={22} />
      <span className="brilho-passando" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <span className="animar-tremer">
          <EscudoTime timeId={campeao.timeId} tamanho="lg" />
        </span>
        {/* max-w-full: em coluna o item é medido pelo conteúdo, e sem esse
            limite o `truncate` do nome nunca entra em ação. */}
        <div className="min-w-0 max-w-full">
          <span className="contorno rotulo inline-block rounded-md bg-lima px-2 py-1 text-[10px] text-carvao">
            Campeão <span className="animar-flutuar">🏆</span>
          </span>
          <h2 className="mt-3 truncate text-2xl text-white min-[380px]:text-3xl sm:text-5xl">{campeao.nome}</h2>
          <p className="mt-2 truncate text-[14px] font-medium text-white/80">
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

      {/* O pódio é uma faixa no topo, e não uma coluna ao lado: a chave precisa
          da largura inteira para caber sem rolagem. */}
      <Cartao className="overflow-hidden">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-tinta bg-papel-escuro px-4 py-3">
          <h3 className="text-xl">Pódio</h3>
          <p className="text-[12px] text-tinta-media">O terceiro sai da repescagem.</p>
        </div>
        <div className="grid divide-y-2 divide-papel-escuro sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
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
                <NumeroAnimado valor={torneio.partidasFinalizadas} />
                <span className="opacity-45">/{torneio.totalPartidas}</span>
              </p>
              <p className="rotulo mt-1 text-[9px] opacity-70">Jogos</p>
            </div>
          }
        />
        <ChaveVisual rodadas={torneio.principal} aoEditar={aoEditarPartida} />
      </Cartao>
    </div>
  )
}
