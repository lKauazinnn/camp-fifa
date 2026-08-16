import { buscarTime } from '../data/times.js'

/* -------------------------------------------------------------------------- */
/* Blocos visuais reutilizados por todas as abas                              */
/* -------------------------------------------------------------------------- */

export function Cartao({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-navy-900/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function TituloSecao({ icone: Icone, titulo, descricao, acao }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icone ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-royal-500/40 bg-royal-600/20 text-neon-400">
            <Icone className="size-5" />
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-bold text-white uppercase sm:text-lg">{titulo}</h2>
          {descricao ? <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{descricao}</p> : null}
        </div>
      </div>
      {acao}
    </div>
  )
}

const TONS_ETIQUETA = {
  neutro: 'border-white/10 bg-white/5 text-slate-300',
  neon: 'border-neon-400/40 bg-neon-400/10 text-neon-300',
  ouro: 'border-gold-400/40 bg-gold-400/10 text-gold-300',
  roxo: 'border-royal-400/40 bg-royal-500/15 text-royal-300',
  amarelo: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  vermelho: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  atencao: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
  ok: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
}

export function Etiqueta({ tom = 'neutro', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${TONS_ETIQUETA[tom] ?? TONS_ETIQUETA.neutro} ${className}`}
    >
      {children}
    </span>
  )
}

const VARIANTES_BOTAO = {
  primario:
    'bg-neon-400 text-navy-950 hover:bg-neon-300 focus-visible:outline-neon-400 disabled:bg-neon-400/40 disabled:text-navy-900/60',
  roxo: 'bg-royal-600 text-white hover:bg-royal-500 focus-visible:outline-royal-400 disabled:opacity-40',
  ouro: 'bg-gold-400 text-navy-950 hover:bg-gold-300 focus-visible:outline-gold-400 disabled:opacity-40',
  contorno:
    'border border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10 focus-visible:outline-white/40 disabled:opacity-40',
  perigo:
    'border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 focus-visible:outline-rose-400 disabled:opacity-40',
  fantasma: 'text-slate-400 hover:bg-white/5 hover:text-white focus-visible:outline-white/40 disabled:opacity-40',
}

export function Botao({ variante = 'primario', icone: Icone, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${VARIANTES_BOTAO[variante]} ${className}`}
      {...props}
    >
      {Icone ? <Icone className="size-4 shrink-0" /> : null}
      {children}
    </button>
  )
}

/** Escudo em degradê com as iniciais do time escolhido no FIFA. */
export function EscudoTime({ timeId, tamanho = 'md' }) {
  const time = buscarTime(timeId)
  const iniciais = time.nome
    .split(' ')
    .filter((palavra) => palavra.length > 2)
    .slice(0, 2)
    .map((palavra) => palavra[0])
    .join('')
    .toUpperCase()

  const tamanhos = {
    sm: 'size-7 text-[10px]',
    md: 'size-9 text-xs',
    lg: 'size-12 text-sm',
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg font-display font-bold text-white/90 ring-1 ring-white/20 ${tamanhos[tamanho]}`}
      style={{ background: `linear-gradient(135deg, ${time.cores[0]} 0%, ${time.cores[1]} 100%)` }}
      title={time.nome}
      aria-hidden="true"
    >
      {iniciais || '?'}
    </span>
  )
}

export function EstadoVazio({ icone: Icone, titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-navy-900/40 px-6 py-12 text-center">
      {Icone ? <Icone className="size-10 text-royal-400/70" /> : null}
      <h3 className="text-sm font-bold text-white uppercase">{titulo}</h3>
      {descricao ? <p className="max-w-sm text-sm text-slate-400">{descricao}</p> : null}
      {acao}
    </div>
  )
}

export function BarraProgresso({ valor }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-royal-500 via-neon-400 to-gold-400 transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, valor))}%` }}
      />
    </div>
  )
}

/** Indicadores de cartões (usado nos cards de partida e nas tabelas). */
export function Cartoes({ amarelos = 0, vermelhos = 0, className = '' }) {
  if (!amarelos && !vermelhos) return null
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={`${amarelos} amarelo(s), ${vermelhos} vermelho(s)`}>
      {Array.from({ length: amarelos }).map((_, indice) => (
        <span key={`a${indice}`} className="h-3 w-2 rounded-[2px] bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
      ))}
      {Array.from({ length: vermelhos }).map((_, indice) => (
        <span key={`v${indice}`} className="h-3 w-2 rounded-[2px] bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
      ))}
    </span>
  )
}
