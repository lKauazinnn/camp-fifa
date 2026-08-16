import { buscarTime } from '../data/times.js'
import { Cartoes, EscudoTime } from './ui.jsx'

function Lado({ participante, gols, penaltis, mostrarPenaltis, vencedor, perdedor, amarelos, vermelhos }) {
  if (!participante) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <span className="size-7 shrink-0 rounded-full border border-dashed border-borda-forte/60" />
        <span className="text-[13px] text-perola-600 italic">A definir</span>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center gap-3 px-3.5 py-2.5 ${perdedor ? 'opacity-40' : ''}`}>
      {vencedor ? (
        <span className="fio-ouro absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full" aria-hidden="true" />
      ) : null}

      <EscudoTime timeId={participante.timeId} tamanho="sm" vencedor={vencedor} />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] leading-tight ${vencedor ? 'text-perola-100' : 'text-perola-300'}`}>
          {participante.nome}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="truncate text-[11px] text-perola-600">{buscarTime(participante.timeId).nome}</p>
          <Cartoes amarelos={amarelos} vermelhos={vermelhos} />
        </div>
      </div>

      {mostrarPenaltis ? <span className="num shrink-0 text-[11px] text-perola-500">({penaltis})</span> : null}

      <span
        className={`num w-5 shrink-0 text-right text-[17px] ${
          gols === null ? 'text-perola-600' : vencedor ? 'text-realce' : 'text-perola-400'
        }`}
      >
        {gols === null ? '–' : gols}
      </span>
    </div>
  )
}

function Situacao({ partida }) {
  const { status } = partida

  if (status === 'finalizada' && partida.penaltis) {
    return <span className="text-[10px] tracking-[0.08em] text-perola-500 uppercase">Pênaltis</span>
  }
  if (status === 'finalizada') {
    return <span className="text-[10px] tracking-[0.08em] text-realce/70 uppercase">Encerrado</span>
  }
  if (status === 'pronta') {
    return (
      <span className="flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-amber-300/80 uppercase">
        <span className="animar-respirar size-[3px] rounded-full bg-amber-300" />A jogar
      </span>
    )
  }
  if (status === 'bye') {
    return <span className="text-[10px] tracking-[0.08em] text-perola-500 uppercase">Classificado</span>
  }
  if (status === 'vazia') {
    return <span className="text-[10px] tracking-[0.08em] text-perola-600 uppercase">Sem jogo</span>
  }
  return <span className="text-[10px] tracking-[0.08em] text-perola-600 uppercase">Aguardando</span>
}

export function CartaoPartida({ partida, aoEditar, destaque = false }) {
  const { resultado } = partida
  const clicavel = Boolean(aoEditar) && partida.editavel

  const conteudo = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-borda/70 px-3.5 py-2">
        <span className="num text-[10px] tracking-[0.08em] text-perola-600 uppercase">Jogo {partida.numero}</span>
        <Situacao partida={partida} />
      </div>

      <div className="divide-y divide-borda/60">
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

  const base = `w-full overflow-hidden rounded-xl border text-left transition-all duration-200 ${
    destaque ? 'painel-realce border-realce/25' : 'painel border-borda'
  }`

  if (!clicavel) return <div className={base}>{conteudo}</div>

  return (
    <button
      type="button"
      onClick={() => aoEditar(partida)}
      className={`${base} hover:-translate-y-px hover:border-realce/35`}
    >
      {conteudo}
    </button>
  )
}
