import { Check, Crown, Pencil, Timer } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { Cartoes, EscudoTime, Etiqueta } from './ui.jsx'

function LinhaParticipante({ participante, gols, penaltis, mostrarPenaltis, vencedor, perdedor, amarelos, vermelhos, decisiva }) {
  if (!participante) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-2 py-1.5">
        <span className="size-7 shrink-0 rounded-lg border border-dashed border-white/15" />
        <span className="text-xs font-medium text-slate-500 italic">A definir</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
        vencedor
          ? 'border-neon-400/40 bg-neon-400/10'
          : perdedor
            ? 'border-transparent bg-white/[0.02] opacity-55'
            : 'border-transparent bg-white/[0.03]'
      }`}
    >
      <EscudoTime timeId={participante.timeId} tamanho="sm" />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-bold ${vencedor ? 'text-neon-300' : 'text-slate-200'}`}>{participante.nome}</p>
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[10px] text-slate-500">{buscarTime(participante.timeId).nome}</p>
          <Cartoes amarelos={amarelos} vermelhos={vermelhos} />
        </div>
      </div>

      {vencedor && decisiva ? <Crown className="size-3.5 shrink-0 text-gold-400" /> : null}
      {vencedor && !decisiva ? <Check className="size-3.5 shrink-0 text-neon-400" /> : null}

      <div className="flex shrink-0 items-baseline gap-1">
        {mostrarPenaltis ? <span className="text-[10px] font-bold text-royal-300">({penaltis})</span> : null}
        <span
          className={`min-w-6 text-right font-display text-base font-bold ${
            gols === null ? 'text-slate-600' : vencedor ? 'text-neon-300' : 'text-slate-300'
          }`}
        >
          {gols === null ? '–' : gols}
        </span>
      </div>
    </div>
  )
}

const ETIQUETA_POR_STATUS = {
  finalizada: { tom: 'neon', texto: 'Encerrado' },
  pronta: { tom: 'ouro', texto: 'A jogar' },
  aguardando: { tom: 'neutro', texto: 'Aguardando' },
  bye: { tom: 'roxo', texto: 'Bye' },
  vazia: { tom: 'neutro', texto: 'Sem jogo' },
}

export function CartaoPartida({ partida, aoEditar, destaque = false }) {
  const { resultado, status } = partida
  const etiqueta = ETIQUETA_POR_STATUS[status] ?? ETIQUETA_POR_STATUS.aguardando
  const clicavel = Boolean(aoEditar) && partida.editavel
  const decisiva = destaque

  const conteudo = (
    <>
      <header className="mb-2 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 font-display text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          {clicavel ? <Pencil className="size-3 shrink-0 text-neon-400/70 transition group-hover:text-neon-400" /> : null}
          <span className="truncate">Jogo {partida.numero}</span>
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {status === 'pronta' ? <Timer className="size-3 text-gold-400 animar-pulso" /> : null}
          <Etiqueta tom={etiqueta.tom}>{etiqueta.texto}</Etiqueta>
        </div>
      </header>

      <div className="space-y-1">
        <LinhaParticipante
          participante={partida.a}
          gols={resultado ? resultado.golsA : null}
          penaltis={resultado?.penaltisA}
          mostrarPenaltis={partida.penaltis}
          vencedor={Boolean(partida.vencedorId) && partida.vencedorId === partida.a?.id}
          perdedor={Boolean(partida.perdedorId) && partida.perdedorId === partida.a?.id}
          amarelos={resultado?.amarelosA ?? 0}
          vermelhos={resultado?.vermelhosA ?? 0}
          decisiva={decisiva}
        />
        <LinhaParticipante
          participante={partida.b}
          gols={resultado ? resultado.golsB : null}
          penaltis={resultado?.penaltisB}
          mostrarPenaltis={partida.penaltis}
          vencedor={Boolean(partida.vencedorId) && partida.vencedorId === partida.b?.id}
          perdedor={Boolean(partida.perdedorId) && partida.perdedorId === partida.b?.id}
          amarelos={resultado?.amarelosB ?? 0}
          vermelhos={resultado?.vermelhosB ?? 0}
          decisiva={decisiva}
        />
      </div>

      {partida.penaltis ? (
        <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-royal-300 uppercase">
          Decidido nos pênaltis
        </p>
      ) : null}

      {status === 'bye' ? (
        <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-royal-300 uppercase">
          Classificado direto
        </p>
      ) : null}

      {status === 'vazia' ? (
        <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          Chave sem confronto
        </p>
      ) : null}
    </>
  )

  const classesBase = `w-full rounded-xl border p-2.5 text-left transition ${
    destaque
      ? 'border-gold-400/40 bg-gradient-to-b from-gold-400/10 to-navy-900/80 brilho-ouro'
      : 'border-white/10 bg-navy-900/80'
  }`

  if (!clicavel) {
    return <div className={classesBase}>{conteudo}</div>
  }

  return (
    <button
      type="button"
      onClick={() => aoEditar(partida)}
      className={`${classesBase} group cursor-pointer hover:border-neon-400/50 hover:bg-navy-800/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-400`}
      aria-label={`Lançar resultado do jogo ${partida.numero} da fase ${partida.fase}`}
    >
      {conteudo}
    </button>
  )
}
