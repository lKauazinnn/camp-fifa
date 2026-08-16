/**
 * Persistência do campeonato.
 *
 * Camadas, da mais automática para a mais manual:
 *  1. localStorage  — salvo a cada alteração; sobrevive a refresh, a fechar o
 *     navegador e a reiniciar o computador (mesmo aparelho, mesmo navegador).
 *  2. Arquivo .json — backup manual, para não depender do cache do navegador.
 *  3. Link com o placar embutido — para mandar o resultado no grupo sem backend.
 */

export const CHAVE_STORAGE = 'unidos-acamp-fifa@1'
const PREFIXO_LINK = '#placar='

/* ------------------------------------------------------------------ */
/* Validação                                                           */
/* ------------------------------------------------------------------ */

/** Garante que o objeto lido de fora tem o formato esperado. */
export function validarEstado(bruto) {
  if (!bruto || typeof bruto !== 'object') return null

  const participantes = Array.isArray(bruto.participantes)
    ? bruto.participantes
        .filter((item) => item && typeof item.id === 'string' && typeof item.nome === 'string')
        .map((item) => ({ id: item.id, nome: item.nome, timeId: String(item.timeId ?? 'sem-time') }))
    : []

  const idsValidos = new Set(participantes.map((participante) => participante.id))
  const seeds = Array.isArray(bruto.seeds)
    ? bruto.seeds.map((id) => (typeof id === 'string' && idsValidos.has(id) ? id : null))
    : []

  const resultados = {}
  if (bruto.resultados && typeof bruto.resultados === 'object') {
    for (const [id, valor] of Object.entries(bruto.resultados)) {
      if (!valor || typeof valor !== 'object') continue
      const numero = (campo) => {
        const convertido = Number.parseInt(valor[campo], 10)
        return Number.isFinite(convertido) && convertido > 0 ? convertido : 0
      }
      resultados[id] = {
        golsA: numero('golsA'),
        golsB: numero('golsB'),
        penaltisA: numero('penaltisA'),
        penaltisB: numero('penaltisB'),
        amarelosA: numero('amarelosA'),
        vermelhosA: numero('vermelhosA'),
        amarelosB: numero('amarelosB'),
        vermelhosB: numero('vermelhosB'),
      }
    }
  }

  return { participantes, seeds, resultados }
}

/* ------------------------------------------------------------------ */
/* localStorage                                                        */
/* ------------------------------------------------------------------ */

export function lerEstadoSalvo() {
  if (typeof window === 'undefined') return null
  try {
    const bruto = window.localStorage.getItem(CHAVE_STORAGE)
    if (!bruto) return null
    const salvo = JSON.parse(bruto)
    const estado = validarEstado(salvo.estado ?? salvo)
    if (!estado) return null
    return { estado, atualizadoEm: salvo.atualizadoEm ?? null }
  } catch {
    return null
  }
}

/** @returns {string|null} data/hora do salvamento, ou null se o navegador bloqueou. */
export function salvarEstado(estado) {
  if (typeof window === 'undefined') return null
  try {
    const atualizadoEm = new Date().toISOString()
    window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify({ versao: 1, atualizadoEm, estado }))
    return atualizadoEm
  } catch {
    // Modo anônimo, armazenamento cheio ou cookies bloqueados.
    return null
  }
}

export function apagarEstadoSalvo() {
  try {
    window.localStorage.removeItem(CHAVE_STORAGE)
  } catch {
    /* nada a fazer */
  }
}

/* ------------------------------------------------------------------ */
/* Backup em arquivo                                                   */
/* ------------------------------------------------------------------ */

function carimboDeData() {
  const agora = new Date()
  const doisDigitos = (valor) => String(valor).padStart(2, '0')
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}-${doisDigitos(agora.getHours())}${doisDigitos(agora.getMinutes())}`
}

export function baixarBackup(estado) {
  const conteudo = JSON.stringify({ versao: 1, atualizadoEm: new Date().toISOString(), estado }, null, 2)
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `campeonato-fifa-unidos-acamp-${carimboDeData()}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function lerArquivoDeBackup(arquivo) {
  const texto = await arquivo.text()
  const estado = validarEstado(JSON.parse(texto).estado ?? JSON.parse(texto))
  if (!estado || !estado.participantes.length) {
    throw new Error('Arquivo inválido ou sem participantes.')
  }
  return estado
}

/* ------------------------------------------------------------------ */
/* Link compartilhável (estado embutido na própria URL)                */
/* ------------------------------------------------------------------ */

function paraBase64Url(texto) {
  const bytes = new TextEncoder().encode(texto)
  let binario = ''
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte)
  })
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function deBase64Url(codificado) {
  const base64 = codificado.replace(/-/g, '+').replace(/_/g, '/')
  const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  const bytes = Uint8Array.from(binario, (caractere) => caractere.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Compacta o estado para caber confortavelmente numa URL de WhatsApp. */
function compactar({ participantes, seeds, resultados }) {
  const indicePorId = new Map(participantes.map((participante, indice) => [participante.id, indice]))
  return {
    p: participantes.map((participante) => [participante.nome, participante.timeId]),
    s: seeds.map((id) => (id ? indicePorId.get(id) ?? -1 : -1)),
    r: Object.fromEntries(
      Object.entries(resultados).map(([id, r]) => [
        id,
        [r.golsA, r.golsB, r.penaltisA, r.penaltisB, r.amarelosA, r.vermelhosA, r.amarelosB, r.vermelhosB],
      ]),
    ),
  }
}

function expandir(compacto) {
  const participantes = (compacto.p ?? []).map(([nome, timeId], indice) => ({
    id: `c${indice}`,
    nome,
    timeId,
  }))
  return {
    participantes,
    seeds: (compacto.s ?? []).map((indice) => participantes[indice]?.id ?? null),
    resultados: Object.fromEntries(
      Object.entries(compacto.r ?? {}).map(([id, valores]) => [
        id,
        {
          golsA: valores[0] ?? 0,
          golsB: valores[1] ?? 0,
          penaltisA: valores[2] ?? 0,
          penaltisB: valores[3] ?? 0,
          amarelosA: valores[4] ?? 0,
          vermelhosA: valores[5] ?? 0,
          amarelosB: valores[6] ?? 0,
          vermelhosB: valores[7] ?? 0,
        },
      ]),
    ),
  }
}

export function gerarLinkCompartilhavel(estado) {
  const { origin, pathname } = window.location
  return `${origin}${pathname}${PREFIXO_LINK}${paraBase64Url(JSON.stringify(compactar(estado)))}`
}

/** Lê o placar embutido na URL, se houver. */
export function estadoDaURL() {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash.startsWith(PREFIXO_LINK)) return null
  try {
    return validarEstado(expandir(JSON.parse(deBase64Url(hash.slice(PREFIXO_LINK.length)))))
  } catch {
    return null
  }
}

export function limparLinkDaURL() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

/* ------------------------------------------------------------------ */

export function formatarHorario(iso) {
  if (!iso) return null
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return null
  return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
