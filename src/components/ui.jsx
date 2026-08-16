import { buscarTime } from '../data/times.js'

/* -------------------------------------------------------------------------- */
/* Peças do sistema: contorno preto, sombra sólida, cor com função             */
/* -------------------------------------------------------------------------- */

export function Cartao({ children, cor = 'papel', className = '', ...props }) {
  // Fundos de cor viva fixam o texto em carvão/branco: eles não mudam com o tema.
  const fundos = {
    papel: 'bg-papel-claro',
    lima: 'bg-lima text-carvao',
    cobalto: 'bg-cobalto text-white',
    laranja: 'bg-laranja text-white',
    tinta: 'bg-tinta text-papel-claro',
  }
  return (
    <div className={`contorno sombra rounded-xl ${fundos[cor]} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function TituloSecao({ titulo, descricao, acao, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-2xl sm:text-[28px]">{titulo}</h2>
        {descricao ? <p className="mt-2 max-w-lg text-[14px] leading-snug text-tinta-media">{descricao}</p> : null}
      </div>
      {acao}
    </div>
  )
}

const CORES_ETIQUETA = {
  lima: 'bg-lima text-carvao',
  cobalto: 'bg-cobalto text-white',
  laranja: 'bg-laranja text-white',
  rosa: 'bg-rosa text-white',
  papel: 'bg-papel-escuro text-tinta',
  tinta: 'bg-tinta text-papel-claro',
}

export function Etiqueta({ cor = 'papel', children, className = '' }) {
  return (
    <span
      className={`contorno rotulo inline-flex items-center gap-1.5 rounded-md px-2 py-1 whitespace-nowrap ${CORES_ETIQUETA[cor]} ${className}`}
    >
      {children}
    </span>
  )
}

const CORES_BOTAO = {
  primario: 'bg-lima text-carvao',
  cobalto: 'bg-cobalto text-white',
  laranja: 'bg-laranja text-white',
  papel: 'bg-papel-claro text-tinta',
  perigo: 'bg-rosa text-white',
}

export function Botao({ variante = 'primario', icone: Icone, children, className = '', disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`contorno rotulo apertar inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] ${
        disabled
          ? 'pointer-events-none border-tinta-fraca bg-papel-escuro text-tinta-fraca shadow-none'
          : `sombra-p ${CORES_BOTAO[variante]}`
      } ${className}`}
      {...props}
    >
      {Icone ? <Icone className="size-4 shrink-0" strokeWidth={2.5} /> : null}
      {children}
    </button>
  )
}

/** Botão sem contorno, para ações secundárias dentro de cards. */
export function BotaoTexto({ icone: Icone, children, className = '', disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`rotulo inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
        disabled
          ? 'cursor-not-allowed text-tinta-fraca/60'
          : 'text-tinta-media hover:bg-papel-escuro hover:text-tinta'
      } ${className}`}
      {...props}
    >
      {Icone ? <Icone className="size-3.5 shrink-0" strokeWidth={2.5} /> : null}
      {children}
    </button>
  )
}

/** Escudo: quadrado com contorno, iniciais e a cor do clube na diagonal. */
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
    sm: 'size-7 text-[9px] rounded-md',
    md: 'size-10 text-[11px] rounded-lg',
    lg: 'size-16 text-base rounded-xl',
  }

  return (
    <span
      className={`contorno relative grid shrink-0 place-items-center overflow-hidden bg-papel-claro font-display text-tinta ${tamanhos[tamanho]}`}
      title={time.nome}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${time.cores[0]} 0 50%, ${time.cores[1]} 50% 100%)`,
          opacity: 'var(--escudo-opacidade)',
        }}
      />
      <span className="relative">{iniciais}</span>
    </span>
  )
}

export function EstadoVazio({ titulo, descricao, acao }) {
  return (
    <div className="contorno flex flex-col items-center gap-3 rounded-xl border-dashed bg-papel-claro/60 px-6 py-16 text-center">
      <h3 className="max-w-md text-2xl">{titulo}</h3>
      {descricao ? <p className="max-w-md text-[14px] leading-snug text-tinta-media">{descricao}</p> : null}
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  )
}

export function BarraProgresso({ valor, className = '' }) {
  return (
    <div className={`contorno h-4 w-full overflow-hidden rounded-full bg-papel-claro ${className}`}>
      <div
        className="h-full border-r-2 border-tinta bg-lima transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, valor))}%` }}
      />
    </div>
  )
}

/** Cartões amarelos/vermelhos como retângulos com contorno. */
export function Cartoes({ amarelos = 0, vermelhos = 0, className = '' }) {
  if (!amarelos && !vermelhos) return null
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title={`${amarelos} amarelo(s), ${vermelhos} vermelho(s)`}
    >
      {Array.from({ length: amarelos }).map((_, indice) => (
        <span key={`a${indice}`} className="h-3 w-2 rounded-[2px] border border-tinta bg-[#ffd400]" />
      ))}
      {Array.from({ length: vermelhos }).map((_, indice) => (
        <span key={`v${indice}`} className="h-3 w-2 rounded-[2px] border border-tinta bg-rosa" />
      ))}
    </span>
  )
}

/** Número grande com rótulo — usado no cabeçalho e nos resumos. */
export function Metrica({ valor, rotulo, className = '' }) {
  return (
    <div className={className}>
      <p className="num font-display text-3xl leading-none">{valor}</p>
      {/* opacidade em vez de cor fixa: funciona sobre papel e sobre cor viva */}
      <p className="rotulo mt-2 opacity-60">{rotulo}</p>
    </div>
  )
}
