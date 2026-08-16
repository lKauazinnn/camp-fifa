/**
 * Elenco do campeonato: só os clubes de nota alta do FC 26.
 *
 * `forca` é a nota geral do time no jogo, usada para ordenar a lista e para o
 * organizador enxergar o que está pondo no sorteio. Fica sem nota o time cuja
 * nota não foi informada — melhor mostrar nada do que inventar número.
 *
 * Regras da lista:
 *   - Só clube. Sem seleção, sem time de lendas, sem all-star.
 *   - Só time de nota alta: nada de meio de tabela nem de liga menor.
 *   - Sem clube brasileiro, porque não dá para afirmar quais estão licenciados
 *     no FC 26. Se estiverem, o organizador acrescenta pelo Painel Admin e o
 *     time chega para todo mundo pela nuvem.
 *
 * São 22 clubes. Com mais gente que isso o sorteio repete times, distribuindo
 * o elenco por igual — melhor dois jogadores com o Real Madrid do que alguém
 * obrigado a pegar time fraco.
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
  // 85
  { id: 'real-madrid', nome: 'Real Madrid', liga: 'LaLiga', forca: 85, cores: ['#f8fafc', '#febe10'], ...escudo(541) },
  { id: 'barcelona', nome: 'Barcelona', liga: 'LaLiga', forca: 85, cores: ['#a50044', '#004d98'], ...escudo(529) },
  { id: 'psg', nome: 'Paris Saint-Germain', liga: 'Ligue 1', forca: 85, cores: ['#004170', '#da291c'], ...escudo(85) },

  // 84
  { id: 'bayern', nome: 'Bayern de Munique', liga: 'Bundesliga', forca: 84, cores: ['#dc052d', '#0066b2'], ...escudo(157) },
  { id: 'arsenal', nome: 'Arsenal', liga: 'Premier League', forca: 84, cores: ['#ef0107', '#f8fafc'], ...escudo(42) },
  { id: 'man-city', nome: 'Manchester City', liga: 'Premier League', forca: 84, cores: ['#6cabdd', '#1c2c5b'], ...escudo(50) },
  { id: 'liverpool', nome: 'Liverpool', liga: 'Premier League', forca: 84, cores: ['#c8102e', '#00b2a9'], ...escudo(40) },

  // 83
  { id: 'inter', nome: 'Inter de Milão', liga: 'Serie A', forca: 83, cores: ['#0068a8', '#111827'], ...escudo(505) },

  // 82
  { id: 'atletico-madrid', nome: 'Atlético de Madrid', liga: 'LaLiga', forca: 82, cores: ['#cb3524', '#f8fafc'], ...escudo(530) },

  // 81
  { id: 'napoli', nome: 'Napoli', liga: 'Serie A', forca: 81, cores: ['#12a0d7', '#0f172a'], ...escudo(492) },
  { id: 'milan', nome: 'Milan', liga: 'Serie A', forca: 81, cores: ['#fb090b', '#111827'], ...escudo(489) },
  { id: 'newcastle', nome: 'Newcastle', liga: 'Premier League', forca: 81, cores: ['#111827', '#f1f5f9'], ...escudo(34) },
  { id: 'aston-villa', nome: 'Aston Villa', liga: 'Premier League', forca: 81, cores: ['#95bfe5', '#670e36'], ...escudo(66) },
  { id: 'chelsea', nome: 'Chelsea', liga: 'Premier League', forca: 81, cores: ['#034694', '#0f172a'], ...escudo(49) },
  { id: 'dortmund', nome: 'Borussia Dortmund', liga: 'Bundesliga', forca: 81, cores: ['#fde100', '#111827'], ...escudo(165) },

  // 80
  { id: 'roma', nome: 'Roma', liga: 'Serie A', forca: 80, cores: ['#8e1f2f', '#f0bc42'], ...escudo(497) },
  { id: 'athletic', nome: 'Athletic Club', liga: 'LaLiga', forca: 80, cores: ['#ee2523', '#f8fafc'], ...escudo(531) },
  { id: 'juventus', nome: 'Juventus', liga: 'Serie A', forca: 80, cores: ['#f8fafc', '#111827'], ...escudo(496) },
  { id: 'leverkusen', nome: 'Bayer Leverkusen', liga: 'Bundesliga', forca: 80, cores: ['#e32219', '#111827'], ...escudo(168) },
  { id: 'man-united', nome: 'Manchester United', liga: 'Premier League', forca: 80, cores: ['#da291c', '#111827'], ...escudo(33) },

  // Sem nota informada — seguem na lista porque não foi pedido para tirar.
  { id: 'tottenham', nome: 'Tottenham', liga: 'Premier League', cores: ['#f1f5f9', '#132257'], ...escudo(47) },
  { id: 'marseille', nome: 'Olympique de Marseille', liga: 'Ligue 1', cores: ['#2faee0', '#f8fafc'], ...escudo(81) },
]

export const TIME_PADRAO = { id: 'sem-time', nome: 'Time livre', liga: '—', cores: ['#475569', '#1e293b'] }

const MAPA_TIMES = new Map(TIMES.map((time) => [time.id, time]))

export function buscarTime(timeId) {
  return MAPA_TIMES.get(timeId) ?? TIME_PADRAO
}

export const LIGAS = [...new Set(TIMES.map((time) => time.liga))]
