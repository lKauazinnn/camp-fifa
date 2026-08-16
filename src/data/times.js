/**
 * Catálogo de times disponíveis no FIFA para os participantes escolherem.
 * `cores` alimenta o escudinho em degradê exibido na interface.
 */
export const TIMES = [
  // Brasileirão
  { id: 'flamengo', nome: 'Flamengo', liga: 'Brasileirão', cores: ['#e11d48', '#111827'] },
  { id: 'palmeiras', nome: 'Palmeiras', liga: 'Brasileirão', cores: ['#16a34a', '#052e16'] },
  { id: 'corinthians', nome: 'Corinthians', liga: 'Brasileirão', cores: ['#111827', '#e5e7eb'] },
  { id: 'sao-paulo', nome: 'São Paulo', liga: 'Brasileirão', cores: ['#dc2626', '#f8fafc'] },
  { id: 'santos', nome: 'Santos', liga: 'Brasileirão', cores: ['#f8fafc', '#0f172a'] },
  { id: 'gremio', nome: 'Grêmio', liga: 'Brasileirão', cores: ['#0ea5e9', '#0f172a'] },
  { id: 'internacional', nome: 'Internacional', liga: 'Brasileirão', cores: ['#b91c1c', '#f8fafc'] },
  { id: 'cruzeiro', nome: 'Cruzeiro', liga: 'Brasileirão', cores: ['#1d4ed8', '#f8fafc'] },
  { id: 'atletico-mg', nome: 'Atlético Mineiro', liga: 'Brasileirão', cores: ['#111827', '#f8fafc'] },
  { id: 'fluminense', nome: 'Fluminense', liga: 'Brasileirão', cores: ['#7f1d1d', '#065f46'] },
  { id: 'vasco', nome: 'Vasco da Gama', liga: 'Brasileirão', cores: ['#0f172a', '#f8fafc'] },
  { id: 'botafogo', nome: 'Botafogo', liga: 'Brasileirão', cores: ['#111827', '#e5e7eb'] },

  // Europa
  { id: 'real-madrid', nome: 'Real Madrid', liga: 'LaLiga', cores: ['#f8fafc', '#facc15'] },
  { id: 'barcelona', nome: 'Barcelona', liga: 'LaLiga', cores: ['#7f1d1d', '#1e3a8a'] },
  { id: 'atletico-madrid', nome: 'Atlético de Madrid', liga: 'LaLiga', cores: ['#dc2626', '#f8fafc'] },
  { id: 'man-city', nome: 'Manchester City', liga: 'Premier League', cores: ['#38bdf8', '#0c4a6e'] },
  { id: 'man-united', nome: 'Manchester United', liga: 'Premier League', cores: ['#dc2626', '#111827'] },
  { id: 'liverpool', nome: 'Liverpool', liga: 'Premier League', cores: ['#b91c1c', '#14532d'] },
  { id: 'arsenal', nome: 'Arsenal', liga: 'Premier League', cores: ['#ef4444', '#f8fafc'] },
  { id: 'chelsea', nome: 'Chelsea', liga: 'Premier League', cores: ['#1d4ed8', '#0f172a'] },
  { id: 'tottenham', nome: 'Tottenham', liga: 'Premier League', cores: ['#f1f5f9', '#1e293b'] },
  { id: 'psg', nome: 'Paris Saint-Germain', liga: 'Ligue 1', cores: ['#1e3a8a', '#dc2626'] },
  { id: 'bayern', nome: 'Bayern de Munique', liga: 'Bundesliga', cores: ['#dc2626', '#1e3a8a'] },
  { id: 'dortmund', nome: 'Borussia Dortmund', liga: 'Bundesliga', cores: ['#facc15', '#111827'] },
  { id: 'juventus', nome: 'Juventus', liga: 'Serie A', cores: ['#f8fafc', '#111827'] },
  { id: 'inter', nome: 'Inter de Milão', liga: 'Serie A', cores: ['#1d4ed8', '#111827'] },
  { id: 'milan', nome: 'Milan', liga: 'Serie A', cores: ['#dc2626', '#111827'] },
  { id: 'napoli', nome: 'Napoli', liga: 'Serie A', cores: ['#0ea5e9', '#0f172a'] },
  { id: 'roma', nome: 'Roma', liga: 'Serie A', cores: ['#991b1b', '#f59e0b'] },
  { id: 'benfica', nome: 'Benfica', liga: 'Liga Portugal', cores: ['#dc2626', '#f8fafc'] },
  { id: 'porto', nome: 'Porto', liga: 'Liga Portugal', cores: ['#1d4ed8', '#f8fafc'] },
  { id: 'ajax', nome: 'Ajax', liga: 'Eredivisie', cores: ['#dc2626', '#f8fafc'] },

  // Seleções
  { id: 'brasil', nome: 'Brasil', liga: 'Seleções', cores: ['#facc15', '#16a34a'] },
  { id: 'argentina', nome: 'Argentina', liga: 'Seleções', cores: ['#38bdf8', '#f8fafc'] },
  { id: 'franca', nome: 'França', liga: 'Seleções', cores: ['#1e3a8a', '#dc2626'] },
  { id: 'portugal', nome: 'Portugal', liga: 'Seleções', cores: ['#166534', '#dc2626'] },
  { id: 'inglaterra', nome: 'Inglaterra', liga: 'Seleções', cores: ['#f8fafc', '#dc2626'] },
  { id: 'espanha', nome: 'Espanha', liga: 'Seleções', cores: ['#dc2626', '#facc15'] },
  { id: 'alemanha', nome: 'Alemanha', liga: 'Seleções', cores: ['#111827', '#facc15'] },
  { id: 'holanda', nome: 'Holanda', liga: 'Seleções', cores: ['#f97316', '#0f172a'] },
]

export const TIME_PADRAO = { id: 'sem-time', nome: 'Time livre', liga: '—', cores: ['#475569', '#1e293b'] }

const MAPA_TIMES = new Map(TIMES.map((time) => [time.id, time]))

export function buscarTime(timeId) {
  return MAPA_TIMES.get(timeId) ?? TIME_PADRAO
}

export const LIGAS = [...new Set(TIMES.map((time) => time.liga))]
