import { buscarTime } from '../data/times.js'
import { Cartoes, EscudoTime } from './ui.jsx'

function Lado({ participante, gols, penaltis, mostrarPenaltis, vencedor, perdedor, amarelos, vermelhos }) {
  if (!participante) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="size-7 shrink-0 rounded-md border-2 border-dashed border-tinta-fraca" />
        <span className="text-[13px] text-tinta-fraca">esperando…</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 ${perdedor ? 'opacity-45' : ''}`}>
      <EscudoTime timeId={participante.timeId} tamanho="sm" />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] leading-tight ${vencedor ? 'font-bold text-tinta' : 'text-tinta'}`}>
          {participante.nome}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <p className="truncate text-[11px] text-tinta-fraca">{buscarTime(participante.timeId).nome}</p>
          <Cartoes amarelos={amarelos} vermelhos={vermelhos} />
        </div>
      </div>

      {mostrarPenaltis ? (
        <span className="num shrink-0 rounded border border-tinta bg-papel-escuro px-1 text-[10px] font-bold">
          {penaltis}
        </span>
      ) : null}

      <span
        className={`num grid size-8 shrink-0 place-items-center rounded-md font-display text-[15px] ${
          gols === null
            ? 'text-tinta-fraca'
            : vencedor
              ? 'border-2 border-tinta bg-lima text-tinta'
              : 'border-2 border-transparent text-tinta-media'
        }`}
      >
        {gols === null ? '–' : gols}
      </span>
    </div>
  )
}

function Faixa({ partida }) {
  const { status } = partida

  if (status === 'finalizada') {
    return (
      <span className="rotulo rounded bg-lima px-1.5 py-0.5 text-[9px] text-tinta">
        {partida.penaltis ? 'Nos pênaltis' : 'Fim de jogo'}
      </span>
    )
  }
  if (status === 'pronta') {
    return (
      <span className="rotulo flex items-center gap-1 rounded bg-laranja px-1.5 py-0.5 text-[9px] text-white">
        <span className="animar-piscar size-1 rounded-full bg-white" />
        Bora jogar
      </span>
    )
  }
  if (status === 'bye') {
    return <span className="rotulo rounded bg-cobalto px-1.5 py-0.5 text-[9px] text-white">Passou direto</span>
  }
  if (status === 'vazia') {
    return <span className="rotulo text-[9px] text-tinta-fraca">Sem jogo</span>
  }
  return <span className="rotulo text-[9px] text-tinta-fraca">Aguardando</span>
}

export function CartaoPartida({ partida, aoEditar, destaque = false }) {
  const { resultado } = partida
  const clicavel = Boolean(aoEditar) && partida.editavel

  const conteudo = (
    <>
      <div
        className={`flex items-center justify-between gap-2 border-b-2 border-tinta px-3 py-1.5 ${
          destaque ? 'bg-cobalto' : 'bg-papel-escuro'
        }`}
      >
        <span className={`rotulo num text-[9px] ${destaque ? 'text-white' : 'text-tinta-media'}`}>
          {destaque ? 'Decisão' : `Jogo ${partida.numero}`}
        </span>
        <Faixa partida={partida} />
      </div>

      <div className="divide-y-2 divide-papel-escuro bg-papel-claro">
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

  const base = 'contorno sombra-p w-full overflow-hidden rounded-lg text-left'

  if (!clicavel) return <div className={base}>{conteudo}</div>

  return (
    <button type="button" onClick={() => aoEditar(partida)} className={`${base} apertar`}>
      {conteudo}
    </button>
  )
}
