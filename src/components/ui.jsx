import { buscarTime } from '../data/times.js'

/* -------------------------------------------------------------------------- */
/* Primitivos — vidro fosco, hairlines e o dourado como acento de prestígio    */
/* -------------------------------------------------------------------------- */

export function Cartao({ children, realce = false, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border ${realce ? 'painel-realce border-realce/25' : 'painel border-borda'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function TituloSecao({ titulo, descricao, acao, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="font-serif text-xl leading-none text-perola-100">{titulo}</h2>
        {descricao ? <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-perola-400">{descricao}</p> : null}
      </div>
      {acao}
    </div>
  )
}

const TONS_ETIQUETA = {
  neutro: 'border-borda-forte/70 text-perola-400',
  realce: 'border-realce/35 bg-realce/10 text-realce',
  ativo: 'border-amber-400/25 bg-amber-400/10 text-amber-300/90',
  alerta: 'border-rose-500/25 bg-rose-500/10 text-rose-300/90',
  discreto: 'border-transparent bg-white/[0.06] text-perola-500',
}

export function Etiqueta({ tom = 'neutro', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${TONS_ETIQUETA[tom] ?? TONS_ETIQUETA.neutro} ${className}`}
    >
      {children}
    </span>
  )
}

const VARIANTES_BOTAO = {
  primario:
    'bg-[linear-gradient(180deg,#f7e9cb,#dcbd83)] text-[#1b1408] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] hover:brightness-[1.06] disabled:bg-none disabled:bg-white/8 disabled:text-perola-600 disabled:shadow-none',
  contorno:
    'border border-borda-forte/80 bg-white/[0.03] text-perola-200 hover:border-realce/40 hover:bg-white/[0.06] hover:text-perola-100 disabled:opacity-40',
  perigo: 'border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 disabled:opacity-40',
  fantasma: 'text-perola-400 hover:bg-white/[0.06] hover:text-perola-100 disabled:opacity-40',
}

export function Botao({ variante = 'primario', icone: Icone, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-200 disabled:cursor-not-allowed ${VARIANTES_BOTAO[variante]} ${className}`}
      {...props}
    >
      {Icone ? <Icone className="size-4 shrink-0" strokeWidth={1.75} /> : null}
      {children}
    </button>
  )
}

/**
 * Escudo circular: anel escuro, iniciais em pérola e um arco na cor do clube.
 */
export function EscudoTime({ timeId, tamanho = 'md', vencedor = false }) {
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
    sm: 'size-7 text-[9px]',
    md: 'size-9 text-[10px]',
    lg: 'size-14 text-sm',
  }

  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full font-medium ${
        vencedor ? 'text-perola-100' : 'text-perola-400'
      } ${tamanhos[tamanho]}`}
      title={time.nome}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 140deg, ${time.cores[0]}, ${time.cores[1]}, ${time.cores[0]})`,
          opacity: 0.55,
        }}
      />
      <span className="absolute inset-[1.5px] rounded-full bg-superficie" />
      <span className="relative">{iniciais}</span>
    </span>
  )
}

export function EstadoVazio({ icone: Icone, titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borda px-6 py-20 text-center">
      {Icone ? <Icone className="size-6 text-perola-600" strokeWidth={1.25} /> : null}
      <h3 className="font-serif text-xl text-perola-100">{titulo}</h3>
      {descricao ? <p className="max-w-sm text-[13px] leading-relaxed text-perola-400">{descricao}</p> : null}
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  )
}

export function BarraProgresso({ valor, className = '' }) {
  return (
    <div className={`h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`}>
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#a8854a,#f6e7c2)] transition-[width] duration-700"
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
        <span key={`a${indice}`} className="h-2.5 w-[3px] rounded-full bg-amber-400/85" />
      ))}
      {Array.from({ length: vermelhos }).map((_, indice) => (
        <span key={`v${indice}`} className="h-2.5 w-[3px] rounded-full bg-rose-500/85" />
      ))}
    </span>
  )
}

/** Valor em serifa com rótulo pequeno — cabeçalho e resumos. */
export function Metrica({ valor, rotulo, dourado = false, className = '' }) {
  return (
    <div className={className}>
      <p className={`num font-serif text-2xl leading-none ${dourado ? 'dourado' : 'text-perola-100'}`}>{valor}</p>
      <p className="rotulo mt-2">{rotulo}</p>
    </div>
  )
}
