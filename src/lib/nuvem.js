import { createClient } from '@supabase/supabase-js'

/**
 * Placar ao vivo via Supabase.
 *
 * O site é estático, então a chave anônima fica visível para qualquer visitante.
 * O banco parte desse princípio: a chave só lê. Toda gravação passa pela função
 * `salvar_campeonato`, que exige o PIN do organizador e roda dentro do Postgres
 * (ver supabase/schema.sql).
 *
 * Sem as variáveis de ambiente configuradas, tudo aqui vira no-op e o app
 * continua funcionando só com o localStorage.
 */

/**
 * Limpa o que costuma vir junto de variável de ambiente colada à mão: espaços,
 * aspas, quebras de linha e o BOM (U+FEFF) que alguns terminais inserem.
 *
 * O BOM é traiçoeiro: a chave vai no cabeçalho `apikey`, e o navegador recusa
 * cabeçalho com caractere fora do Latin-1 com um "TypeError: Failed to execute
 * 'set' on 'Headers'" que não diz nada sobre a causa.
 */
function limparVariavel(valor) {
  if (typeof valor !== 'string') return undefined
  const limpo = valor
    .replace(/^﻿/, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    // eslint-disable-next-line no-control-regex -- qualquer coisa fora do Latin-1 quebra o header
    .replace(/[^\x20-\xFF]/g, '')
  return limpo || undefined
}

const ENDERECO = limparVariavel(import.meta.env.VITE_SUPABASE_URL)
// Aceita a chave publishable (sb_publishable_…, atual) ou a anônima legada.
const CHAVE_PUBLICA =
  limparVariavel(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  limparVariavel(import.meta.env.VITE_SUPABASE_ANON_KEY)
export const ID_CAMPEONATO = limparVariavel(import.meta.env.VITE_CAMPEONATO_ID) ?? 'unidos-acamp'

export const nuvemConfigurada = Boolean(ENDERECO && CHAVE_PUBLICA)

const cliente = nuvemConfigurada
  ? createClient(ENDERECO, CHAVE_PUBLICA, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 4 } },
    })
  : null

/** @returns {Promise<{estado: object, versao: number, atualizadoEm: string}|null>} */
export async function lerDaNuvem() {
  if (!cliente) return null
  const { data, error } = await cliente
    .from('campeonatos')
    .select('estado, versao, atualizado_em')
    .eq('id', ID_CAMPEONATO)
    .maybeSingle()

  if (error) throw new Error(traduzir(error))
  if (!data) return null
  return { estado: data.estado ?? {}, versao: Number(data.versao), atualizadoEm: data.atualizado_em }
}

export async function conferirPin(pin) {
  if (!cliente) return false
  const { data, error } = await cliente.rpc('conferir_pin', { p_id: ID_CAMPEONATO, p_pin: pin })
  if (error) throw new Error(traduzir(error))
  return data === true
}

/** @returns {Promise<{versao: number, atualizadoEm: string}>} */
export async function gravarNaNuvem(estado, pin) {
  if (!cliente) throw new Error('Nuvem não configurada.')
  const { data, error } = await cliente.rpc('salvar_campeonato', {
    p_id: ID_CAMPEONATO,
    p_estado: estado,
    p_pin: pin,
  })
  if (error) throw new Error(traduzir(error))
  const linha = Array.isArray(data) ? data[0] : data
  return { versao: Number(linha.versao), atualizadoEm: linha.atualizado_em }
}

export async function trocarPin(pinAtual, pinNovo) {
  if (!cliente) throw new Error('Nuvem não configurada.')
  const { data, error } = await cliente.rpc('trocar_pin', {
    p_id: ID_CAMPEONATO,
    p_pin_atual: pinAtual,
    p_pin_novo: pinNovo,
  })
  if (error) throw new Error(traduzir(error))
  return data === true
}

/**
 * Avisa quando alguém alterou o campeonato.
 *
 * O payload do evento é ignorado de propósito: o estado pode passar de 1 MB
 * quando há escudos enviados, e aí o Realtime corta a mensagem. O evento serve
 * só de gatilho para reler a linha pelo REST.
 *
 * @returns {() => void} função para cancelar a assinatura
 */
export function assinarMudancas({ aoMudar, aoMudarConexao }) {
  if (!cliente) return () => {}

  const canal = cliente
    .channel(`campeonato:${ID_CAMPEONATO}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'campeonatos', filter: `id=eq.${ID_CAMPEONATO}` },
      () => aoMudar?.(),
    )
    .subscribe((status) => {
      aoMudarConexao?.(status === 'SUBSCRIBED')
    })

  return () => {
    cliente.removeChannel(canal)
  }
}

function traduzir(erro) {
  const mensagem = erro?.message ?? 'Falha ao falar com a nuvem.'
  if (/PIN incorreto/i.test(mensagem)) return 'PIN incorreto.'
  if (/nao existe|não existe/i.test(mensagem)) return 'Campeonato não encontrado no servidor.'
  if (/Failed to fetch|NetworkError/i.test(mensagem)) return 'Sem conexão com o servidor.'
  return mensagem
}
