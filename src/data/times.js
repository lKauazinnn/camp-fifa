/**
 * Catálogo de times disponíveis no FIFA para os participantes escolherem.
 *
 * Os escudos são carregados pelo navegador de servidores públicos — nenhum logo
 * é redistribuído neste projeto. São três níveis, do melhor para o pior caso:
 *
 *   1. `escudo`         wsrv.nl redimensionando para 96px em webp (~5 KB)
 *   2. `escudoReserva`  o PNG original do api-sports (~20 a 90 KB)
 *   3. o quadrado com iniciais e as cores do clube, se nada carregar
 *
 * Cada id foi conferido visualmente antes de entrar aqui, para não acontecer de
 * um time aparecer com o escudo de outro.
 */

const ORIGEM = 'media.api-sports.io/football/teams'

const escudo = (id) => ({
  escudo: `https://wsrv.nl/?url=${ORIGEM}/${id}.png&w=96&h=96&fit=contain&output=webp`,
  escudoReserva: `https://${ORIGEM}/${id}.png`,
})

export const TIMES = [
  // Brasileirão
  { id: 'flamengo', nome: 'Flamengo', liga: 'Brasileirão', cores: ['#e11d48', '#111827'], ...escudo(127) },
  { id: 'palmeiras', nome: 'Palmeiras', liga: 'Brasileirão', cores: ['#16a34a', '#052e16'], ...escudo(121) },
  { id: 'corinthians', nome: 'Corinthians', liga: 'Brasileirão', cores: ['#111827', '#e5e7eb'], ...escudo(131) },
  { id: 'sao-paulo', nome: 'São Paulo', liga: 'Brasileirão', cores: ['#dc2626', '#f8fafc'], ...escudo(126) },
  { id: 'santos', nome: 'Santos', liga: 'Brasileirão', cores: ['#f8fafc', '#0f172a'], ...escudo(128) },
  { id: 'gremio', nome: 'Grêmio', liga: 'Brasileirão', cores: ['#0ea5e9', '#0f172a'], ...escudo(130) },
  { id: 'internacional', nome: 'Internacional', liga: 'Brasileirão', cores: ['#b91c1c', '#f8fafc'], ...escudo(119) },
  { id: 'cruzeiro', nome: 'Cruzeiro', liga: 'Brasileirão', cores: ['#1d4ed8', '#f8fafc'], ...escudo(135) },
  { id: 'atletico-mg', nome: 'Atlético Mineiro', liga: 'Brasileirão', cores: ['#111827', '#f8fafc'], ...escudo(1062) },
  { id: 'fluminense', nome: 'Fluminense', liga: 'Brasileirão', cores: ['#7f1d1d', '#065f46'], ...escudo(124) },
  { id: 'vasco', nome: 'Vasco da Gama', liga: 'Brasileirão', cores: ['#0f172a', '#f8fafc'], ...escudo(133) },
  { id: 'botafogo', nome: 'Botafogo', liga: 'Brasileirão', cores: ['#111827', '#e5e7eb'], ...escudo(120) },

  // Europa
  { id: 'real-madrid', nome: 'Real Madrid', liga: 'LaLiga', cores: ['#f8fafc', '#facc15'], ...escudo(541) },
  { id: 'barcelona', nome: 'Barcelona', liga: 'LaLiga', cores: ['#7f1d1d', '#1e3a8a'], ...escudo(529) },
  { id: 'atletico-madrid', nome: 'Atlético de Madrid', liga: 'LaLiga', cores: ['#dc2626', '#f8fafc'], ...escudo(530) },
  { id: 'man-city', nome: 'Manchester City', liga: 'Premier League', cores: ['#38bdf8', '#0c4a6e'], ...escudo(50) },
  { id: 'man-united', nome: 'Manchester United', liga: 'Premier League', cores: ['#dc2626', '#111827'], ...escudo(33) },
  { id: 'liverpool', nome: 'Liverpool', liga: 'Premier League', cores: ['#b91c1c', '#14532d'], ...escudo(40) },
  { id: 'arsenal', nome: 'Arsenal', liga: 'Premier League', cores: ['#ef4444', '#f8fafc'], ...escudo(42) },
  { id: 'chelsea', nome: 'Chelsea', liga: 'Premier League', cores: ['#1d4ed8', '#0f172a'], ...escudo(49) },
  { id: 'tottenham', nome: 'Tottenham', liga: 'Premier League', cores: ['#f1f5f9', '#1e293b'], ...escudo(47) },
  { id: 'psg', nome: 'Paris Saint-Germain', liga: 'Ligue 1', cores: ['#1e3a8a', '#dc2626'], ...escudo(85) },
  { id: 'bayern', nome: 'Bayern de Munique', liga: 'Bundesliga', cores: ['#dc2626', '#1e3a8a'], ...escudo(157) },
  { id: 'dortmund', nome: 'Borussia Dortmund', liga: 'Bundesliga', cores: ['#facc15', '#111827'], ...escudo(165) },
  { id: 'juventus', nome: 'Juventus', liga: 'Serie A', cores: ['#f8fafc', '#111827'], ...escudo(496) },
  { id: 'inter', nome: 'Inter de Milão', liga: 'Serie A', cores: ['#1d4ed8', '#111827'], ...escudo(505) },
  { id: 'milan', nome: 'Milan', liga: 'Serie A', cores: ['#dc2626', '#111827'], ...escudo(489) },
  { id: 'napoli', nome: 'Napoli', liga: 'Serie A', cores: ['#0ea5e9', '#0f172a'], ...escudo(492) },
  { id: 'roma', nome: 'Roma', liga: 'Serie A', cores: ['#991b1b', '#f59e0b'], ...escudo(497) },
  { id: 'benfica', nome: 'Benfica', liga: 'Liga Portugal', cores: ['#dc2626', '#f8fafc'], ...escudo(211) },
  { id: 'porto', nome: 'Porto', liga: 'Liga Portugal', cores: ['#1d4ed8', '#f8fafc'], ...escudo(212) },
  { id: 'ajax', nome: 'Ajax', liga: 'Eredivisie', cores: ['#dc2626', '#f8fafc'], ...escudo(194) },

  // Seleções
  { id: 'brasil', nome: 'Brasil', liga: 'Seleções', cores: ['#facc15', '#16a34a'], ...escudo(6) },
  { id: 'argentina', nome: 'Argentina', liga: 'Seleções', cores: ['#38bdf8', '#f8fafc'], ...escudo(26) },
  { id: 'franca', nome: 'França', liga: 'Seleções', cores: ['#1e3a8a', '#dc2626'], ...escudo(2) },
  { id: 'portugal', nome: 'Portugal', liga: 'Seleções', cores: ['#166534', '#dc2626'], ...escudo(27) },
  { id: 'inglaterra', nome: 'Inglaterra', liga: 'Seleções', cores: ['#f8fafc', '#dc2626'], ...escudo(10) },
  { id: 'espanha', nome: 'Espanha', liga: 'Seleções', cores: ['#dc2626', '#facc15'], ...escudo(9) },
  { id: 'alemanha', nome: 'Alemanha', liga: 'Seleções', cores: ['#111827', '#facc15'], ...escudo(25) },
  { id: 'holanda', nome: 'Holanda', liga: 'Seleções', cores: ['#f97316', '#0f172a'], ...escudo(1118) },
]

export const TIME_PADRAO = { id: 'sem-time', nome: 'Time livre', liga: '—', cores: ['#475569', '#1e293b'] }

const MAPA_TIMES = new Map(TIMES.map((time) => [time.id, time]))

export function buscarTime(timeId) {
  return MAPA_TIMES.get(timeId) ?? TIME_PADRAO
}

export const LIGAS = [...new Set(TIMES.map((time) => time.liga))]
