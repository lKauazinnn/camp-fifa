import { buscarTime } from '../data/times.js'

/* -------------------------------------------------------------------------- */
/* Primitivos visuais — hairlines, superfícies foscas, um único acento         */
/* -------------------------------------------------------------------------- */

export function Cartao({ children, className = '', ...props }) {
  return (
    <div className={`rounded-xl border border-borda bg-superficie ${className}`} {...props}>
      {children}
    </div>
  )
}

export function TituloSecao({ titulo, descricao, acao, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-zinc-100">{titulo}</h2>
        {descricao ? <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{descricao}</p> : null}
      </div>
      {acao}
    </div>
  )
}

const TONS_ETIQUETA = {
  neutro: 'border-borda text-zinc-400',
  realce: 'border-realce/30 bg-realce/10 text-realce',
  ativo: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  alerta: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
  discreto: 'border-transparent bg-white/5 text-zinc-500',
}

export function Etiqueta({ tom = 'neutro', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${TONS_ETIQUETA[tom] ?? TONS_ETIQUETA.neutro} ${className}`}
    >
      {children}
    </span>
  )
}

const VARIANTES_BOTAO = {
  primario: 'bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-700 disabled:text-zinc-500',
  realce: 'bg-realce/15 text-realce border border-realce/30 hover:bg-realce/25 disabled:opacity-40',
  contorno: 'border border-borda text-zinc-300 hover:border-borda-forte hover:bg-white/[0.04] disabled:opacity-40',
  perigo: 'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 disabled:opacity-40',
  fantasma: 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100 disabled:opacity-40',
}

export function Botao({ variante = 'primario', icone: Icone, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed ${VARIANTES_BOTAO[variante]} ${className}`}
      {...props}
    >
      {Icone ? <Icone className="size-4 shrink-0" strokeWidth={1.75} /> : null}
      {children}
    </button>
  )
}

/**
 * Identidade do time: quadrado neutro com as iniciais e um filete na cor do
 * clube — informação suficiente, sem poluição visual.
 */
export function EscudoTime({ timeId, tamanho = 'md' }) {
  const time = buscarTime(timeId)
  const iniciais =
    time.nome
      .split(' ')
      .filter((palavra) => palavra.length > 2)
      .slice(0, 2)
      .map((palavra) => palavra[0])
      .join('')
      .toUpperCase() || '?'

  const tamanhos = {
    sm: 'size-6 text-[9px] rounded',
    md: 'size-8 text-[10px] rounded-md',
    lg: 'size-11 text-xs rounded-lg',
  }

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden border border-borda bg-elevado font-semibold text-zinc-400 ${tamanhos[tamanho]}`}
      title={time.nome}
      aria-hidden="true"
    >
      <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: time.cores[0] }} />
      {iniciais}
    </span>
  )
}

export function EstadoVazio({ icone: Icone, titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-borda px-6 py-16 text-center">
      {Icone ? <Icone className="size-5 text-zinc-600" strokeWidth={1.5} /> : null}
      <h3 className="text-[15px] font-medium text-zinc-200">{titulo}</h3>
      {descricao ? <p className="max-w-sm text-[13px] leading-relaxed text-zinc-500">{descricao}</p> : null}
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  )
}

export function BarraProgresso({ valor, className = '' }) {
  return (
    <div className={`h-[3px] w-full overflow-hidden rounded-full bg-white/8 ${className}`}>
      <div
        className="h-full rounded-full bg-realce/70 transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, valor))}%` }}
      />
    </div>
  )
}

/** Cartões amarelos/vermelhos como filetes discretos. */
export function Cartoes({ amarelos = 0, vermelhos = 0, className = '' }) {
  if (!amarelos && !vermelhos) return null
  return (
    <span
      className={`inline-flex items-center gap-[3px] ${className}`}
      title={`${amarelos} amarelo(s), ${vermelhos} vermelho(s)`}
    >
      {Array.from({ length: amarelos }).map((_, indice) => (
        <span key={`a${indice}`} className="h-2.5 w-[3px] rounded-full bg-amber-400/80" />
      ))}
      {Array.from({ length: vermelhos }).map((_, indice) => (
        <span key={`v${indice}`} className="h-2.5 w-[3px] rounded-full bg-rose-500/80" />
      ))}
    </span>
  )
}

/** Valor grande com rótulo pequeno — usado no cabeçalho e nos resumos. */
export function Metrica({ valor, rotulo, className = '' }) {
  return (
    <div className={className}>
      <p className="num text-lg font-medium text-zinc-100">{valor}</p>
      <p className="rotulo mt-0.5">{rotulo}</p>
    </div>
  )
}
