/**
 * Efeitos sonoros de fliperama, sintetizados na hora.
 *
 * Nada de arquivo de áudio: cada som é uma sequência curta de ondas quadradas
 * montada no Web Audio, do mesmo jeito que um chip de videogame antigo fazia —
 * pesa zero no carregamento e nunca falha por link quebrado.
 *
 * O navegador só libera áudio depois de um gesto do usuário, o que combina com
 * o uso aqui: todo som nasce de um clique.
 */

const CHAVE_MUDO = 'unidos-acamp-mudo'
const VOLUME = 0.05

let contexto = null
let mudo = lerMudo()
const ouvintes = new Set()

function lerMudo() {
  try {
    return window.localStorage.getItem(CHAVE_MUDO) === 'sim'
  } catch {
    return false
  }
}

function garantirContexto() {
  if (typeof window === 'undefined') return null
  const Fabrica = window.AudioContext ?? window.webkitAudioContext
  if (!Fabrica) return null
  contexto ??= new Fabrica()
  // Aberto antes do primeiro gesto, o contexto nasce suspenso.
  if (contexto.state === 'suspended') contexto.resume()
  return contexto
}

/**
 * Uma nota: onda quadrada com ataque instantâneo e queda rápida — o "blip".
 * `desliza` leva a frequência a outro ponto durante a nota (efeito de subida).
 */
function nota(ctx, { hz, em, dura, desliza, tipo = 'square', volume = VOLUME }) {
  const oscilador = ctx.createOscillator()
  const ganho = ctx.createGain()
  const inicio = ctx.currentTime + em

  oscilador.type = tipo
  oscilador.frequency.setValueAtTime(hz, inicio)
  if (desliza) oscilador.frequency.exponentialRampToValueAtTime(desliza, inicio + dura)

  ganho.gain.setValueAtTime(volume, inicio)
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + dura)

  oscilador.connect(ganho).connect(ctx.destination)
  oscilador.start(inicio)
  oscilador.stop(inicio + dura + 0.02)
}

/* Cada som é a partitura de umas poucas notas. Frequências em Hz, tempos em s. */
const SONS = {
  clique: [{ hz: 620, em: 0, dura: 0.05 }],
  trocar: [
    { hz: 520, em: 0, dura: 0.04 },
    { hz: 780, em: 0.045, dura: 0.06 },
  ],
  rolar: [{ hz: 1200, em: 0, dura: 0.02, volume: 0.025 }],
  travar: [{ hz: 880, em: 0, dura: 0.05, volume: 0.045 }],
  // Escala subindo: o time saiu, a inscrição entrou, o campeonato acabou.
  fanfarra: [
    { hz: 523, em: 0, dura: 0.09 },
    { hz: 659, em: 0.09, dura: 0.09 },
    { hz: 784, em: 0.18, dura: 0.09 },
    { hz: 1046, em: 0.27, dura: 0.22 },
  ],
  gol: [
    { hz: 392, em: 0, dura: 0.14, desliza: 784 },
    { hz: 784, em: 0.14, dura: 0.16 },
  ],
  erro: [{ hz: 200, em: 0, dura: 0.16, desliza: 90, tipo: 'sawtooth', volume: 0.04 }],
  moeda: [
    { hz: 988, em: 0, dura: 0.07 },
    { hz: 1319, em: 0.07, dura: 0.24 },
  ],
}

/** Toca um dos sons do catálogo. Silencioso quando mudo, ou sem Web Audio. */
export function tocar(nome) {
  if (mudo) return
  const partitura = SONS[nome]
  if (!partitura) return
  const ctx = garantirContexto()
  if (!ctx) return
  try {
    partitura.forEach((parte) => nota(ctx, parte))
  } catch {
    /* aparelho sem áudio disponível: o site continua igual, só mudo */
  }
}

export function estaMudo() {
  return mudo
}

export function alternarMudo() {
  mudo = !mudo
  try {
    window.localStorage.setItem(CHAVE_MUDO, mudo ? 'sim' : 'nao')
  } catch {
    /* sem armazenamento a escolha vale só nesta aba */
  }
  ouvintes.forEach((ouvinte) => ouvinte(mudo))
  if (!mudo) tocar('clique')
  return mudo
}

/**
 * Tranco curto no celular, para os momentos que merecem: a peça travando no
 * sorteio e o gol entrando. Segue o mesmo botão do som — quem pediu silêncio
 * também não quer o aparelho pulando na mão.
 */
export function vibrar(padrao = 18) {
  if (mudo) return
  try {
    navigator.vibrate?.(padrao)
  } catch {
    /* aparelho sem motor de vibração */
  }
}

/** Avisa a interface quando o som liga ou desliga. */
export function ouvirMudo(ouvinte) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}
