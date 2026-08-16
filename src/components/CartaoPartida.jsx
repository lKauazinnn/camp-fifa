import { buscarTime } from '../data/times.js'
import { Cartoes, EscudoTime } from './ui.jsx'

function Lado({ participante, gols, penaltis, mostrarPenaltis, vencedor, perdedor, amarelos, vermelhos }) {
  if (!participante) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2">
        <span className="size-6 shrink-0 rounded border border-dashed border-borda" />
        <span className="text-[13px] text-zinc-600">A definir</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 ${perdedor ? 'opacity-45' : ''}`}>
      <EscudoTime timeId={participante.timeId} tamanho="sm" />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] leading-tight ${vencedor ? 'font-medium text-zinc-100' : 'text-zinc-300'}`}>
          {participante.nome}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="truncate text-[11px] text-zinc-600">{buscarTime(participante.timeId).nome}</p>
          <Cartoes amarelos={amarelos} vermelhos={vermelhos} />
        </div>
      </div>

      {mostrarPenaltis ? <span className="num shrink-0 text-[11px] text-zinc-500">({penaltis})</span> : null}

      <span
        className={`num w-5 shrink-0 text-right text-[15px] ${
          gols === null ? 'text-zinc-700' : vencedor ? 'font-semibold text-realce' : 'text-zinc-400'
        }`}
      >
        {gols === null ? '–' : gols}
      </span>
    </div>
  )
}

function Rodape({ partida }) {
  const { status } = partida

  if (status === 'finalizada' && partida.penaltis) {
    return <span className="text-[11px] text-zinc-600">Decidido nos pênaltis</span>
  }
  if (status === 'pronta') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-amber-400/90">
        <span className="animar-pulsar size-1 rounded-full bg-amber-400" />
        Aguardando disputa
      </span>
    )
  }
  if (status === 'bye') {
    return <span className="text-[11px] text-zinc-600">Classificado direto</span>
  }
  if (status === 'vazia') {
    return <span className="text-[11px] text-zinc-700">Sem confronto</span>
  }
  if (status === 'aguardando') {
    return <span className="text-[11px] text-zinc-600">Depende da fase anterior</span>
  }
  return null
}

export function CartaoPartida({ partida, aoEditar, destaque = false }) {
  const { resultado } = partida
  const clicavel = Boolean(aoEditar) && partida.editavel

  const conteudo = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-borda px-3 py-1.5">
        <span className="num text-[11px] text-zinc-600">Jogo {partida.numero}</span>
        <Rodape partida={partida} />
      </div>

      <div className="divide-y divide-borda">
        <Lado
          participante={partida.a}
          gols={resultado ? resultado.golsA : null}
          penaltis={resultado?.penaltisA}
          mostrarPenaltis={partida.penaltis}
          vencedor={Boolean(partida.vencedorId) && partida.vencedorId === partida.a?.id}
          perdedor={Boolean(partida.perdedorId) && partida.perdedorId === partida.a?.id}
          amarelos={resultado?.amarelosA ?? 0}
          vermelhos={resultado?.vermelhosA ?? 0}
        />
        <Lado
          participante={partida.b}
          gols={resultado ? resultado.golsB : null}
          penaltis={resultado?.penaltisB}
          mostrarPenaltis={partida.penaltis}
          vencedor={Boolean(partida.vencedorId) && partida.vencedorId === partida.b?.id}
          perdedor={Boolean(partida.perdedorId) && partida.perdedorId === partida.b?.id}
          amarelos={resultado?.amarelosB ?? 0}
          vermelhos={resultado?.vermelhosB ?? 0}
        />
      </div>
    </>
  )

  const base = `w-full overflow-hidden rounded-lg border text-left transition-colors ${
    destaque ? 'border-realce/25 bg-realce/[0.03]' : 'border-borda bg-superficie'
  }`

  if (!clicavel) return <div className={base}>{conteudo}</div>

  return (
    <button type="button" onClick={() => aoEditar(partida)} className={`${base} hover:border-borda-forte hover:bg-elevado`}>
      {conteudo}
    </button>
  )
}
