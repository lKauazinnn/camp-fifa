/**
 * Elenco do campeonato: só clubes de elite do FC 26.
 *
 * Regras que valeram para montar a lista:
 *   - Só clube. Sem seleção, sem time de lendas, sem all-star ("World XI",
 *     "Adidas All-Star" e afins) — nada que entre quebrado no sorteio.
 *   - São 56 clubes, o suficiente para os 50 inscritos esperados com folga, e a
 *     regra de um time por pessoa exige mais times do que participantes.
 *     Passando disso, dá para cadastrar times novos no Painel Admin.
 *
 * Os escudos vêm de servidores públicos em tempo de execução; nenhum logo é
 * redistribuído aqui. Cada id foi conferido visualmente antes de entrar.
 */

const ORIGEM = 'media.api-sports.io/football/teams'

const escudo = (id) => ({
  escudo: `https://wsrv.nl/?url=${ORIGEM}/${id}.png&w=96&h=96&fit=contain&output=webp`,
  escudoReserva: `https://${ORIGEM}/${id}.png`,
})

export const TIMES = [
  // ------------------------------------------------------- Premier League ---
  { id: 'man-city', nome: 'Manchester City', liga: 'Premier League', cores: ['#6cabdd', '#1c2c5b'], ...escudo(50) },
  { id: 'arsenal', nome: 'Arsenal', liga: 'Premier League', cores: ['#ef0107', '#f8fafc'], ...escudo(42) },
  { id: 'liverpool', nome: 'Liverpool', liga: 'Premier League', cores: ['#c8102e', '#00b2a9'], ...escudo(40) },
  { id: 'chelsea', nome: 'Chelsea', liga: 'Premier League', cores: ['#034694', '#0f172a'], ...escudo(49) },
  { id: 'man-united', nome: 'Manchester United', liga: 'Premier League', cores: ['#da291c', '#111827'], ...escudo(33) },
  { id: 'tottenham', nome: 'Tottenham', liga: 'Premier League', cores: ['#f1f5f9', '#132257'], ...escudo(47) },
  { id: 'newcastle', nome: 'Newcastle', liga: 'Premier League', cores: ['#111827', '#f1f5f9'], ...escudo(34) },
  { id: 'aston-villa', nome: 'Aston Villa', liga: 'Premier League', cores: ['#95bfe5', '#670e36'], ...escudo(66) },
  { id: 'brighton', nome: 'Brighton', liga: 'Premier League', cores: ['#0057b8', '#ffcd00'], ...escudo(51) },
  { id: 'forest', nome: 'Nottingham Forest', liga: 'Premier League', cores: ['#dd0000', '#f8fafc'], ...escudo(65) },

  // --------------------------------------------------------------- LaLiga ---
  { id: 'real-madrid', nome: 'Real Madrid', liga: 'LaLiga', cores: ['#f8fafc', '#febe10'], ...escudo(541) },
  { id: 'barcelona', nome: 'Barcelona', liga: 'LaLiga', cores: ['#a50044', '#004d98'], ...escudo(529) },
  { id: 'atletico-madrid', nome: 'Atlético de Madrid', liga: 'LaLiga', cores: ['#cb3524', '#f8fafc'], ...escudo(530) },
  { id: 'athletic', nome: 'Athletic Club', liga: 'LaLiga', cores: ['#ee2523', '#f8fafc'], ...escudo(531) },
  { id: 'real-sociedad', nome: 'Real Sociedad', liga: 'LaLiga', cores: ['#0067b1', '#f8fafc'], ...escudo(548) },
  { id: 'villarreal', nome: 'Villarreal', liga: 'LaLiga', cores: ['#ffe667', '#005187'], ...escudo(533) },
  { id: 'betis', nome: 'Real Betis', liga: 'LaLiga', cores: ['#00954c', '#f8fafc'], ...escudo(543) },

  // -------------------------------------------------------------- Serie A ---
  { id: 'inter', nome: 'Inter de Milão', liga: 'Serie A', cores: ['#0068a8', '#111827'], ...escudo(505) },
  { id: 'milan', nome: 'Milan', liga: 'Serie A', cores: ['#fb090b', '#111827'], ...escudo(489) },
  { id: 'juventus', nome: 'Juventus', liga: 'Serie A', cores: ['#f8fafc', '#111827'], ...escudo(496) },
  { id: 'napoli', nome: 'Napoli', liga: 'Serie A', cores: ['#12a0d7', '#0f172a'], ...escudo(492) },
  { id: 'roma', nome: 'Roma', liga: 'Serie A', cores: ['#8e1f2f', '#f0bc42'], ...escudo(497) },
  { id: 'atalanta', nome: 'Atalanta', liga: 'Serie A', cores: ['#1d71b8', '#111827'], ...escudo(499) },
  { id: 'lazio', nome: 'Lazio', liga: 'Serie A', cores: ['#87d8f7', '#f8fafc'], ...escudo(487) },
  { id: 'fiorentina', nome: 'Fiorentina', liga: 'Serie A', cores: ['#722f8e', '#f8fafc'], ...escudo(502) },

  // ----------------------------------------------------------- Bundesliga ---
  { id: 'bayern', nome: 'Bayern de Munique', liga: 'Bundesliga', cores: ['#dc052d', '#0066b2'], ...escudo(157) },
  { id: 'leverkusen', nome: 'Bayer Leverkusen', liga: 'Bundesliga', cores: ['#e32219', '#111827'], ...escudo(168) },
  { id: 'dortmund', nome: 'Borussia Dortmund', liga: 'Bundesliga', cores: ['#fde100', '#111827'], ...escudo(165) },
  { id: 'leipzig', nome: 'RB Leipzig', liga: 'Bundesliga', cores: ['#dd0741', '#001f47'], ...escudo(173) },
  { id: 'stuttgart', nome: 'Stuttgart', liga: 'Bundesliga', cores: ['#f8fafc', '#e32219'], ...escudo(172) },
  { id: 'frankfurt', nome: 'Eintracht Frankfurt', liga: 'Bundesliga', cores: ['#111827', '#e1000f'], ...escudo(169) },

  // -------------------------------------------------------------- Ligue 1 ---
  { id: 'psg', nome: 'Paris Saint-Germain', liga: 'Ligue 1', cores: ['#004170', '#da291c'], ...escudo(85) },
  { id: 'marseille', nome: 'Olympique de Marseille', liga: 'Ligue 1', cores: ['#2faee0', '#f8fafc'], ...escudo(81) },
  { id: 'monaco', nome: 'Monaco', liga: 'Ligue 1', cores: ['#e63946', '#f8fafc'], ...escudo(91) },
  { id: 'lille', nome: 'Lille', liga: 'Ligue 1', cores: ['#e01e13', '#0c3b7c'], ...escudo(79) },
  { id: 'lyon', nome: 'Olympique Lyonnais', liga: 'Ligue 1', cores: ['#f8fafc', '#12326e'], ...escudo(80) },

  // ---------------------------------------------------- Resto da Europa ---
  { id: 'benfica', nome: 'Benfica', liga: 'Europa', cores: ['#e00000', '#f8fafc'], ...escudo(211) },
  { id: 'porto', nome: 'Porto', liga: 'Europa', cores: ['#00428c', '#f8fafc'], ...escudo(212) },
  { id: 'sporting', nome: 'Sporting', liga: 'Europa', cores: ['#008057', '#f8fafc'], ...escudo(228) },
  { id: 'ajax', nome: 'Ajax', liga: 'Europa', cores: ['#d2122e', '#f8fafc'], ...escudo(194) },
  { id: 'psv', nome: 'PSV', liga: 'Europa', cores: ['#ed1c24', '#f8fafc'], ...escudo(197) },
  { id: 'feyenoord', nome: 'Feyenoord', liga: 'Europa', cores: ['#e30613', '#111827'], ...escudo(209) },
  { id: 'galatasaray', nome: 'Galatasaray', liga: 'Europa', cores: ['#e30613', '#fdb912'], ...escudo(645) },
  { id: 'fenerbahce', nome: 'Fenerbahçe', liga: 'Europa', cores: ['#1f4e9c', '#ffed00'], ...escudo(611) },
  { id: 'celtic', nome: 'Celtic', liga: 'Europa', cores: ['#018749', '#f8fafc'], ...escudo(247) },
  { id: 'rangers', nome: 'Rangers', liga: 'Europa', cores: ['#1b458f', '#f8fafc'], ...escudo(257) },

  // ---------------------------------------------------------- Brasileirão ---
  { id: 'flamengo', nome: 'Flamengo', liga: 'Brasileirão', cores: ['#e11d48', '#111827'], ...escudo(127) },
  { id: 'palmeiras', nome: 'Palmeiras', liga: 'Brasileirão', cores: ['#16a34a', '#052e16'], ...escudo(121) },
  { id: 'botafogo', nome: 'Botafogo', liga: 'Brasileirão', cores: ['#111827', '#e5e7eb'], ...escudo(120) },
  { id: 'atletico-mg', nome: 'Atlético Mineiro', liga: 'Brasileirão', cores: ['#111827', '#f8fafc'], ...escudo(1062) },
  { id: 'internacional', nome: 'Internacional', liga: 'Brasileirão', cores: ['#b91c1c', '#f8fafc'], ...escudo(119) },
  { id: 'sao-paulo', nome: 'São Paulo', liga: 'Brasileirão', cores: ['#dc2626', '#f8fafc'], ...escudo(126) },
  { id: 'corinthians', nome: 'Corinthians', liga: 'Brasileirão', cores: ['#111827', '#e5e7eb'], ...escudo(131) },
  { id: 'cruzeiro', nome: 'Cruzeiro', liga: 'Brasileirão', cores: ['#1d4ed8', '#f8fafc'], ...escudo(135) },
  { id: 'gremio', nome: 'Grêmio', liga: 'Brasileirão', cores: ['#0ea5e9', '#0f172a'], ...escudo(130) },
  { id: 'fluminense', nome: 'Fluminense', liga: 'Brasileirão', cores: ['#7f1d1d', '#065f46'], ...escudo(124) },

]

export const TIME_PADRAO = { id: 'sem-time', nome: 'Time livre', liga: '—', cores: ['#475569', '#1e293b'] }

const MAPA_TIMES = new Map(TIMES.map((time) => [time.id, time]))

export function buscarTime(timeId) {
  return MAPA_TIMES.get(timeId) ?? TIME_PADRAO
}

export const LIGAS = [...new Set(TIMES.map((time) => time.liga))]
