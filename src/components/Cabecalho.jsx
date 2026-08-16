import { BarraProgresso } from './ui.jsx'

function Item({ valor, rotulo }) {
  return (
    <div className="min-w-0">
      <p className="num text-[13px] text-zinc-300">{valor}</p>
      <p className="rotulo mt-0.5 truncate">{rotulo}</p>
    </div>
  )
}

export function Cabecalho({ totalParticipantes, totalGols, torneio }) {
  return (
    <header className="border-b border-borda">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6">
        <p className="rotulo">Unidos Acamp</p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Campeonato FIFA</h1>

          <div className="flex items-center gap-2 rounded-lg border border-borda px-3 py-1.5">
            <span className="rotulo">Premiação</span>
            <span className="num text-[13px] font-medium text-zinc-100">R$ 100,00</span>
            <span className="text-[12px] text-zinc-500">ao campeão</span>
          </div>
        </div>

        <div className="mt-6 flex items-end gap-6 sm:gap-10">
          <Item valor={totalParticipantes} rotulo="Inscritos" />
          <Item valor={totalGols} rotulo="Gols" />
          <Item valor={`${torneio.partidasFinalizadas}/${torneio.totalPartidas}`} rotulo="Jogos" />

          {torneio.ativo ? (
            <div className="min-w-24 max-w-56 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="rotulo">Andamento</span>
                <span className="num text-[11px] text-zinc-400">{torneio.progresso}%</span>
              </div>
              <BarraProgresso valor={torneio.progresso} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
