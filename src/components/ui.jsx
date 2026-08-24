import { useEffect, useRef, useState } from 'react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { tocar } from '../lib/som.js'

/* -------------------------------------------------------------------------- */
/* Peças do sistema: contorno preto, sombra sólida, cor com função             */
/* -------------------------------------------------------------------------- */

/** Respeita quem pediu menos movimento no sistema. */
function prefereParado() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Número que sobe girando até o valor novo e dá um salto ao chegar — o placar
 * da máquina registrando o ponto.
 *
 * Por padrão só a mudança é animada: a primeira renderização já mostra o valor
 * final, senão todo retorno à tela viraria uma contagem do zero. Com `deZero`,
 * a contagem também toca na entrada — para os números que são a atração da
 * tela, como o do inscrito recém-chegado.
 */
export function NumeroAnimado({ valor, duracao = 550, deZero = false }) {
  const inicial = deZero && Number.isFinite(valor) ? 0 : valor
  const [mostrado, setMostrado] = useState(inicial)
  const anterior = useRef(inicial)

  useEffect(() => {
    const de = anterior.current
    anterior.current = valor
    if (de === valor) return undefined
    if (!Number.isFinite(de) || !Number.isFinite(valor) || prefereParado()) {
      setMostrado(valor)
      return undefined
    }

    let quadro = 0
    const inicio = performance.now()
    const passo = (agora) => {
      // Desacelera no fim (ease-out): o número chega e assenta.
      const parte = Math.min(1, (agora - inicio) / duracao)
      const suave = 1 - (1 - parte) ** 3
      setMostrado(Math.round(de + (valor - de) * suave))
      if (parte < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [valor, duracao])

  // A chave é o valor de destino, e não o mostrado: o salto toca uma vez por
  // mudança, enquanto os dígitos correm dentro do mesmo span.
  return (
    <span key={valor} className="animar-placar">
      {mostrado}
    </span>
  )
}

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

export function Botao({ variante = 'primario', icone: Icone, children, className = '', disabled, onClick, som = 'clique', ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(evento) => {
        tocar(som)
        onClick?.(evento)
      }}
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
export function BotaoTexto({ icone: Icone, children, className = '', disabled, onClick, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(evento) => {
        tocar('clique')
        onClick?.(evento)
      }}
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

const TAMANHOS_ESCUDO = {
  sm: 'size-7 text-[9px] rounded-md',
  md: 'size-10 text-[11px] rounded-lg',
  lg: 'size-16 text-base rounded-xl',
}

/**
 * Escudo do time: a imagem enviada pelo usuário, quando existe; senão o
 * quadrado com as iniciais e as cores do clube na diagonal.
 */
export function EscudoTime({ timeId, tamanho = 'md', time: timeDireto }) {
  const { buscarTime } = useTimes()
  const time = timeDireto ?? buscarTime(timeId)

  // Guarda os endereços que falharam (e não apenas "falhou"): assim a queda é
  // escalonada — miniatura, imagem original e, por fim, as iniciais — e trocar
  // o escudo faz a nova imagem ser tentada sem precisar de efeito.
  const [enderecosRuins, setEnderecosRuins] = useState([])
  const endereco =
    [time.escudo, time.escudoReserva].find((item) => item && !enderecosRuins.includes(item)) ?? null

  const iniciais =
    time.nome
      .split(' ')
      .filter((palavra) => palavra.length > 2)
      .slice(0, 2)
      .map((palavra) => palavra[0])
      .join('')
      .toUpperCase() ||
    time.nome.slice(0, 2).toUpperCase() ||
    '?'

  return (
    <span
      className={`contorno relative grid shrink-0 place-items-center overflow-hidden bg-papel-claro font-display text-tinta ${TAMANHOS_ESCUDO[tamanho]}`}
      title={time.nome}
      aria-hidden="true"
    >
      {endereco ? (
        <img
          src={endereco}
          alt=""
          loading="lazy"
          onError={() => setEnderecosRuins((atual) => [...atual, endereco])}
          className="absolute inset-0 size-full object-contain p-[3px]"
        />
      ) : (
        <>
          <span
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${time.cores[0]} 0 50%, ${time.cores[1]} 50% 100%)`,
              opacity: 'var(--escudo-opacidade)',
            }}
          />
          <span className="relative">{iniciais}</span>
        </>
      )}
    </span>
  )
}

const CORES_CONFETE = ['bg-lima', 'bg-cobalto', 'bg-laranja', 'bg-rosa', 'bg-papel-claro']

/**
 * Chuva de quadradinhos de papel picado.
 *
 * Fica sempre dentro de um bloco com `relative overflow-hidden` — é enfeite de
 * cartão de vitória, não de tela inteira. As posições vêm do índice, e não de
 * sorteio: assim a chuva é sempre a mesma e não pisca a cada renderização.
 */
export function Confete({ pecas = 18 }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: pecas }).map((_, indice) => (
        <span
          key={indice}
          className={`animar-confete absolute top-0 size-2 ${CORES_CONFETE[indice % CORES_CONFETE.length]}`}
          style={{
            left: `${(indice * 100) / pecas + (indice % 3) * 2}%`,
            '--atraso': `${(indice % 6) * 220 + (indice % 4) * 90}ms`,
            '--giro': `${(indice % 2 ? 1 : -1) * (360 + indice * 40)}deg`,
            '--tempo': `${2.2 + (indice % 5) * 0.35}s`,
          }}
        />
      ))}
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
