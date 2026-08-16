import { RESULTADO_VAZIO } from '../lib/torneio.js'

/**
 * Dados fictícios para a aplicação já abrir preenchida e testável:
 * 16 participantes, oitavas e quartas concluídas, uma semifinal decidida
 * e a repescagem em andamento.
 */

export const PARTICIPANTES_EXEMPLO = [
  { id: 'p01', nome: 'Kauã Larsson', timeId: 'real-madrid' },
  { id: 'p02', nome: 'Pedro Henrique', timeId: 'flamengo' },
  { id: 'p03', nome: 'João Victor', timeId: 'barcelona' },
  { id: 'p04', nome: 'Lucas Andrade', timeId: 'man-city' },
  { id: 'p05', nome: 'Gabriel Souza', timeId: 'psg' },
  { id: 'p06', nome: 'Matheus Lima', timeId: 'liverpool' },
  { id: 'p07', nome: 'Rafael Nogueira', timeId: 'bayern' },
  { id: 'p08', nome: 'Thiago Barbosa', timeId: 'juventus' },
  { id: 'p09', nome: 'Enzo Martins', timeId: 'palmeiras' },
  { id: 'p10', nome: 'Davi Ribeiro', timeId: 'arsenal' },
  { id: 'p11', nome: 'Samuel Costa', timeId: 'milan' },
  { id: 'p12', nome: 'Isaque Ferreira', timeId: 'dortmund' },
  { id: 'p13', nome: 'Vinícius Rocha', timeId: 'chelsea' },
  { id: 'p14', nome: 'Ana Beatriz Moura', timeId: 'brasil' },
  { id: 'p15', nome: 'Letícia Prado', timeId: 'argentina' },
  { id: 'p16', nome: 'Miguel Tavares', timeId: 'corinthians' },
]

/** Ordem fixa da 1ª fase (nos torneios reais isso vem do sorteio). */
export const SEEDS_EXEMPLO = PARTICIPANTES_EXEMPLO.map((participante) => participante.id)

const placar = (golsA, golsB, extras = {}) => ({ ...RESULTADO_VAZIO, golsA, golsB, ...extras })

export const RESULTADOS_EXEMPLO = {
  /* ---------------- Oitavas de final ---------------- */
  'main-r0-m0': placar(3, 1, { amarelosB: 1 }),
  'main-r0-m1': placar(2, 2, { penaltisA: 4, penaltisB: 3, amarelosA: 1, amarelosB: 1 }),
  'main-r0-m2': placar(0, 1),
  'main-r0-m3': placar(4, 2, { amarelosA: 1, vermelhosB: 1 }),
  'main-r0-m4': placar(1, 0, { amarelosB: 1 }),
  'main-r0-m5': placar(2, 3),
  'main-r0-m6': placar(1, 3, { amarelosA: 2 }),
  'main-r0-m7': placar(2, 0),

  /* ---------------- Quartas de final ---------------- */
  'main-r1-m0': placar(2, 1, { amarelosA: 1 }),
  'main-r1-m1': placar(1, 2, { amarelosB: 1 }),
  'main-r1-m2': placar(3, 3, { penaltisA: 5, penaltisB: 4 }),
  'main-r1-m3': placar(2, 0, { amarelosB: 1 }),

  /* ---------------- Semifinal ---------------- */
  // A outra semifinal (main-r2-m1) e a final seguem em aberto de propósito.
  'main-r2-m0': placar(3, 2, { amarelosA: 1, amarelosB: 1 }),

  /* ---------------- Repescagem ---------------- */
  'rep-r0-m0': placar(1, 2),
  'rep-r0-m1': placar(3, 1, { amarelosB: 1 }),
  'rep-r0-m2': placar(0, 0, { penaltisA: 3, penaltisB: 1 }),
  'rep-r0-m3': placar(2, 4, { amarelosA: 1 }),
  'rep-r1-m0': placar(2, 1),
}

export const ESTADO_EXEMPLO = {
  participantes: PARTICIPANTES_EXEMPLO,
  seeds: SEEDS_EXEMPLO,
  resultados: RESULTADOS_EXEMPLO,
}
