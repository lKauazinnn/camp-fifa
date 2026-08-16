import { Award, Crown, Medal, Shuffle, Swords, Trophy } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { BarraProgresso, Cartao, EscudoTime, EstadoVazio, Etiqueta, TituloSecao } from './ui.jsx'

function Podio({ campeao, vice, terceiro }) {
  if (!campeao && !vice && !terceiro) return null

  const posicoes = [
    { rotulo: 'Campeão', participante: campeao, icone: Trophy, cor: 'text-gold-400', borda: 'border-gold-400/40 bg-gold-400/10' },
    { rotulo: 'Vice-campeão', participante: vice, icone: Medal, cor: 'text-slate-300', borda: 'border-white/15 bg-white/5' },
    { rotulo: '3º lugar', participante: terceiro, icone: Award, cor: 'text-amber-600', borda: 'border-amber-700/40 bg-amber-700/10' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {posicoes.map(({ rotulo, participante, icone: Icone, cor, borda }) => (
        <div key={rotulo} className={`flex items-center gap-3 rounded-2xl border p-3 ${borda}`}>
          <Icone className={`size-6 shrink-0 ${cor}`} />
          <div className="min-w-0">
            <p className="font-display text-[10px] font-bold tracking-widest text-slate-400 uppercase">{rotulo}</p>
            {participante ? (
              <>
                <p className="truncate text-sm font-bold text-white">{participante.nome}</p>
                <p className="truncate text-[11px] text-slate-400">{buscarTime(participante.timeId).nome}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500 italic">a definir</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function FaixaCampeao({ campeao }) {
  return (
    <Cartao className="brilho-ouro relative overflow-hidden border-gold-400/40 bg-gradient-to-r from-gold-400/15 via-royal-600/10 to-transparent p-5">
      <Crown className="absolute -top-4 -right-4 size-28 text-gold-400/10" />
      <div className="relative flex items-center gap-4">
        <EscudoTime timeId={campeao.timeId} tamanho="lg" />
        <div className="min-w-0">
          <Etiqueta tom="ouro">Campeão Unidos Acamp</Etiqueta>
          <h3 className="mt-1 truncate font-display text-xl font-black text-white sm:text-2xl">{campeao.nome}</h3>
          <p className="truncate text-sm text-gold-300">
            {buscarTime(campeao.timeId).nome} · leva os R$ 100,00
          </p>
        </div>
      </div>
    </Cartao>
  )
}

export function Chaveamento({ torneio, aoEditarPartida, aoIrParaAdmin }) {
  if (!torneio.ativo) {
    return (
      <EstadoVazio
        icone={Swords}
        titulo="Chaveamento ainda não sorteado"
        descricao="Cadastre os participantes no Painel Admin e clique em “Sortear confrontos” para gerar as chaves do mata-mata."
        acao={
          <button
            type="button"
            onClick={aoIrParaAdmin}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-neon-400 px-4 py-2.5 text-sm font-bold text-navy-950 transition hover:bg-neon-300"
          >
            <Shuffle className="size-4" />
            Ir para o Painel Admin
          </button>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      {torneio.campeao ? <FaixaCampeao campeao={torneio.campeao} /> : null}

      <Podio campeao={torneio.campeao} vice={torneio.vice} terceiro={torneio.terceiro} />

      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          icone={Swords}
          titulo="Chave principal · mata-mata"
          descricao="Quem perde cai para a repescagem. Toque em um jogo para lançar o resultado."
          acao={
            <div className="w-full sm:w-56">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Progresso do torneio</span>
                <span className="font-bold text-neon-300">
                  {torneio.partidasFinalizadas}/{torneio.totalPartidas}
                </span>
              </div>
              <BarraProgresso valor={torneio.progresso} />
            </div>
          }
        />

        <ChaveVisual rodadas={torneio.principal} aoEditar={aoEditarPartida} />
      </Cartao>
    </div>
  )
}
