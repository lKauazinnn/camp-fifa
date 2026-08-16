import { Banknote, Flame, Gamepad2, Trophy, Users } from 'lucide-react'
import { BarraProgresso } from './ui.jsx'

function Numero({ icone: Icone, valor, rotulo }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <Icone className="size-4 shrink-0 text-royal-300" />
      <div className="leading-tight">
        <p className="font-display text-sm font-black text-white">{valor}</p>
        <p className="text-[9px] tracking-wider text-slate-400 uppercase">{rotulo}</p>
      </div>
    </div>
  )
}

export function Cabecalho({ totalParticipantes, totalGols, torneio }) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-navy-950/60">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="brilho-neon grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-royal-600 to-navy-800 sm:size-14">
            <Gamepad2 className="size-6 text-neon-400 sm:size-7" />
          </span>

          <div className="min-w-0">
            <p className="font-display text-[10px] font-bold tracking-[0.25em] text-neon-400 uppercase sm:text-xs">
              Acampamento Unidos Acamp
            </p>
            <h1 className="font-display text-xl leading-tight font-black text-white sm:text-3xl">
              Campeonato <span className="text-neon-400 texto-neon">FIFA</span>
            </h1>
          </div>
        </div>

        {/* Faixa da premiação */}
        <div className="brilho-ouro mt-4 flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl border border-gold-400/40 bg-gradient-to-r from-gold-400/20 via-gold-400/5 to-transparent px-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-400/20">
            <Banknote className="size-5 text-gold-300" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-bold tracking-[0.2em] text-gold-300 uppercase">Premiação</p>
            <p className="font-display text-lg leading-tight font-black text-white sm:text-2xl">
              R$ 100,00 <span className="text-sm font-bold text-gold-300 sm:text-base">para o Campeão</span>
            </p>
          </div>
          <Trophy className="size-8 shrink-0 text-gold-400 sm:size-10" />
        </div>

        {/* Indicadores rápidos */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Numero icone={Users} valor={totalParticipantes} rotulo="Inscritos" />
          <Numero icone={Flame} valor={totalGols} rotulo="Gols" />
          <Numero icone={Trophy} valor={`${torneio.partidasFinalizadas}/${torneio.totalPartidas}`} rotulo="Jogos" />

          {torneio.ativo ? (
            <div className="min-w-40 flex-1">
              <div className="mb-1 flex items-center justify-between text-[10px] tracking-wider text-slate-400 uppercase">
                <span>Andamento</span>
                <span className="font-bold text-neon-300">{torneio.progresso}%</span>
              </div>
              <BarraProgresso valor={torneio.progresso} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
