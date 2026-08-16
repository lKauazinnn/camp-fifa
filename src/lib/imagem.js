/**
 * Preparo dos escudos enviados pelo usuário.
 *
 * A imagem é reduzida para um quadrado pequeno antes de virar data URL: sem
 * isso, um PNG de 1 MB inteiro iria parar no localStorage e estouraria a cota
 * depois de meia dúzia de times.
 */

const LADO_PADRAO = 96
const TAMANHO_MAXIMO = 6 * 1024 * 1024

function carregarImagem(url) {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image()
    imagem.onload = () => resolver(imagem)
    imagem.onerror = () => rejeitar(new Error('Não consegui abrir essa imagem.'))
    imagem.src = url
  })
}

/**
 * @param {File} arquivo imagem escolhida pelo usuário
 * @returns {Promise<string>} data URL quadrada, tipicamente de 3 a 6 KB
 */
export async function prepararEscudo(arquivo, lado = LADO_PADRAO) {
  if (!arquivo.type.startsWith('image/')) {
    throw new Error('Escolha um arquivo de imagem (PNG, JPG, SVG ou WEBP).')
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new Error('Imagem muito grande. Use uma de até 6 MB.')
  }

  const endereco = URL.createObjectURL(arquivo)
  try {
    const imagem = await carregarImagem(endereco)

    // SVG sem dimensão declarada chega com naturalWidth zerado.
    const larguraOriginal = imagem.naturalWidth || 300
    const alturaOriginal = imagem.naturalHeight || 300

    const escala = Math.min(lado / larguraOriginal, lado / alturaOriginal)
    const largura = Math.max(1, Math.round(larguraOriginal * escala))
    const altura = Math.max(1, Math.round(alturaOriginal * escala))

    const tela = document.createElement('canvas')
    tela.width = lado
    tela.height = lado
    const contexto = tela.getContext('2d')
    contexto.imageSmoothingQuality = 'high'
    // Centraliza mantendo a proporção, sem cortar o escudo.
    contexto.drawImage(imagem, (lado - largura) / 2, (lado - altura) / 2, largura, altura)

    const webp = tela.toDataURL('image/webp', 0.9)
    return webp.startsWith('data:image/webp') ? webp : tela.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(endereco)
  }
}

/**
 * Baixa um escudo de endereço externo e devolve como data URL.
 *
 * Serve para "fixar" o escudo dentro do campeonato: uma vez baixado, ele passa
 * a viajar junto com os dados — funciona offline, entra no backup e aparece
 * igual para todo mundo, sem depender do servidor de imagens continuar de pé.
 *
 * Depende de CORS liberado na origem; se não estiver, devolve null em vez de
 * quebrar, e o time segue exibindo as iniciais.
 */
export async function baixarEscudo(endereco, lado = LADO_PADRAO) {
  if (!endereco || endereco.startsWith('data:')) return null

  try {
    const imagem = await new Promise((resolver, rejeitar) => {
      const elemento = new Image()
      elemento.crossOrigin = 'anonymous'
      elemento.onload = () => resolver(elemento)
      elemento.onerror = () => rejeitar(new Error('sem acesso à imagem'))
      elemento.src = endereco
    })

    const larguraOriginal = imagem.naturalWidth || lado
    const alturaOriginal = imagem.naturalHeight || lado
    const escala = Math.min(lado / larguraOriginal, lado / alturaOriginal)
    const largura = Math.max(1, Math.round(larguraOriginal * escala))
    const altura = Math.max(1, Math.round(alturaOriginal * escala))

    const tela = document.createElement('canvas')
    tela.width = lado
    tela.height = lado
    const contexto = tela.getContext('2d')
    contexto.imageSmoothingQuality = 'high'
    contexto.drawImage(imagem, (lado - largura) / 2, (lado - altura) / 2, largura, altura)

    const webp = tela.toDataURL('image/webp', 0.9)
    return webp.startsWith('data:image/webp') ? webp : tela.toDataURL('image/png')
  } catch {
    return null
  }
}

/** Aceita apenas endereços de imagem plausíveis, para não guardar lixo. */
export function validarEnderecoDeEscudo(endereco) {
  const limpo = endereco.trim()
  if (!limpo) return null
  if (!/^https:\/\//i.test(limpo)) {
    throw new Error('O endereço precisa começar com https://')
  }
  return limpo
}

export function tamanhoLegivel(dataUrl) {
  if (!dataUrl?.startsWith('data:')) return null
  const bytes = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75)
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`
}
