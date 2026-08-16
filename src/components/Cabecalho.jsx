import { BarraProgresso } from './ui.jsx'

function Indicador({ valor, rotulo }) {
  return (
    <div className="min-w-0">
      <p className="num font-serif text-xl leading-none text-perola-100">{valor}</p>
      <p className="rotulo mt-1.5 truncate">{rotulo}</p>
    </div>
  )
}

export function Cabecalho({ totalParticipantes, totalGols, torneio }) {
  return (
    <header className="relative">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="h-px w-8 bg-[linear-gradient(90deg,transparent,#a8854a)]" aria-hidden="true" />
              <p className="rotulo text-realce/80">Unidos Acamp</p>
            </div>

            <h1 className="mt-4 font-serif text-[2.75rem] leading-[0.95] text-perola-100 sm:text-6xl">
              Campeonato <span className="dourado italic">FIFA</span>
            </h1>

            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-perola-400">
              Mata-mata entre os jovens do acampamento, com repescagem para quem cair na primeira fase.
            </p>
          </div>

          {/* Premiação */}
          <div className="painel-realce relative w-full max-w-64 overflow-hidden rounded-2xl border border-realce/25 px-5 py-4 sm:w-auto">
            <p className="rotulo text-realce/70">Premiação</p>
            <p className="num dourado mt-2 font-serif text-4xl leading-none">R$ 100</p>
            <p className="mt-2 text-[12px] text-perola-400">
              para o campeão <span className="text-perola-500">· pagos no encerramento</span>
            </p>
          </div>
        </div>

        {/* Indicadores */}
        <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-6 border-t border-borda pt-6">
          <Indicador valor={totalParticipantes} rotulo="Inscritos" />
          <Indicador valor={totalGols} rotulo="Gols marcados" />
          <Indicador valor={`${torneio.partidasFinalizadas}/${torneio.totalPartidas}`} rotulo="Jogos disputados" />

          {torneio.ativo ? (
            <div className="ml-auto w-full max-w-64 min-w-40">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="rotulo">Andamento</span>
                <span className="num text-[11px] text-realce">{torneio.progresso}%</span>
              </div>
              <BarraProgresso valor={torneio.progresso} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
