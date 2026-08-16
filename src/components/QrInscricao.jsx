import { useMemo, useRef, useState } from 'react'
import { Check, Download, Link2, MessageCircle, Printer } from 'lucide-react'
import { Botao, Cartao, TituloSecao } from './ui.jsx'

/** Convite pronto para colar no grupo do acampamento. */
export function textoDoConvite(endereco) {
  return `⚽ *CAMPEONATO DE FIFA — UNIDOS ACAMP* ⚽

Vai rolar campeonato de FIFA no acamp, e o campeão leva *R$ 100,00* na mão. 💸

Como funciona:
• Mata-mata, jogos de 6 minutos por tempo
• Perdeu na primeira fase? Calma, tem repescagem valendo o 3º lugar
• Os times são *sorteados* — ninguém escolhe, e ninguém repete
• Só os melhores times do FC 26, sem time de lenda

Pra entrar é só clicar, escrever seu nome e pronto:
${endereco}

Dá pra acompanhar o chaveamento e os resultados ao vivo por aí mesmo. 📱

Chama a galera e bora! 🏆`
}

/** Endereço que o QR abre: a mesma página, na tela de inscrição. */
export function enderecoDeInscricao() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#inscricao`
}

/**
 * O código é gerado por serviço online, então nada disso pesa no bundle.
 * São dois endereços: se o primeiro falhar, o segundo assume — e os dois
 * liberam CORS, o que permite desenhar o QR dentro do cartaz e exportá-lo.
 */
function enderecosDoQr(alvo, tamanho = 320) {
  const dados = encodeURIComponent(alvo)
  return [
    `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&margin=8&data=${dados}`,
    `https://quickchart.io/qr?size=${tamanho}&margin=2&text=${dados}`,
  ]
}

function carregarImagem(endereco) {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image()
    imagem.crossOrigin = 'anonymous'
    imagem.onload = () => resolver(imagem)
    imagem.onerror = () => rejeitar(new Error('não consegui gerar o QR'))
    imagem.src = endereco
  })
}

export function QrInscricao({ torneio }) {
  const endereco = useMemo(() => enderecoDeInscricao(), [])
  const opcoes = useMemo(() => enderecosDoQr(endereco), [endereco])
  const [tentativa, setTentativa] = useState(0)
  const [aviso, setAviso] = useState(null)
  const imagemRef = useRef(null)

  const encerrada = torneio.ativo
  const enderecoDoQr = opcoes[tentativa] ?? null

  const mostrar = (texto) => {
    setAviso(texto)
    window.setTimeout(() => setAviso(null), 3500)
  }

  /** Monta o cartaz de impressão em volta do QR. */
  const baixarCartaz = async () => {
    try {
      const qr = await carregarImagem(enderecosDoQr(endereco, 600)[tentativa] ?? opcoes[0])
      const largura = 800
      const altura = 1000
      const cartaz = document.createElement('canvas')
      cartaz.width = largura
      cartaz.height = altura
      const ctx = cartaz.getContext('2d')

      ctx.fillStyle = '#f0ece1'
      ctx.fillRect(0, 0, largura, altura)
      ctx.fillStyle = '#14131a'
      ctx.fillRect(0, 0, largura, 150)

      ctx.textAlign = 'center'
      ctx.fillStyle = '#ccff00'
      ctx.font = 'bold 58px "Archivo Black", Arial Black, sans-serif'
      ctx.fillText('CAMPEONATO FIFA', largura / 2, 95)

      ctx.fillStyle = '#14131a'
      ctx.font = 'bold 40px "Archivo Black", Arial Black, sans-serif'
      ctx.fillText('UNIDOS ACAMP', largura / 2, 215)
      ctx.font = '26px Inter, Arial, sans-serif'
      ctx.fillText('Aponte a câmera para se inscrever', largura / 2, 262)

      const lado = 440
      const x = (largura - lado) / 2
      ctx.fillStyle = '#14131a'
      ctx.fillRect(x - 10, 290, lado + 20, lado + 20)
      ctx.fillStyle = '#fbf9f3'
      ctx.fillRect(x - 2, 298, lado + 4, lado + 4)
      ctx.drawImage(qr, x, 300, lado, lado)

      ctx.fillStyle = '#ff5a1f'
      ctx.fillRect(0, 800, largura, 110)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 54px "Archivo Black", Arial Black, sans-serif'
      ctx.fillText('R$ 100 PRO CAMPEÃO', largura / 2, 872)

      ctx.fillStyle = '#14131a'
      ctx.font = '22px Inter, Arial, sans-serif'
      ctx.fillText(endereco.replace(/^https?:\/\//, ''), largura / 2, 955)

      const link = document.createElement('a')
      link.download = 'inscricao-campeonato-fifa.png'
      link.href = cartaz.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      link.remove()
      mostrar('Cartaz baixado. É só imprimir e colar.')
    } catch {
      mostrar('Não consegui montar o cartaz agora. Tente de novo com internet.')
    }
  }

  return (
    <Cartao className="p-4 sm:p-6">
      <TituloSecao
        className="mb-4"
        titulo="QR de inscrição"
        descricao="A galera aponta a câmera, escreve o nome, escolhe o time e entra sozinha na lista."
      />

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="contorno sombra grid size-44 shrink-0 place-items-center rounded-xl bg-papel-claro p-2 sm:size-52">
          {enderecoDoQr ? (
            <img
              ref={imagemRef}
              src={enderecoDoQr}
              alt="QR code de inscrição"
              className="size-full object-contain"
              onError={() => setTentativa((atual) => atual + 1)}
            />
          ) : (
            <p className="px-3 text-center text-[12px] text-tinta-media">
              Sem internet para gerar o QR. O link abaixo continua valendo.
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {encerrada ? (
            <p className="contorno mb-3 rounded-lg bg-laranja px-3 py-2 text-[12px] font-bold text-white">
              As chaves já foram sorteadas, então o QR agora só mostra “inscrições encerradas”. Desfaça o
              chaveamento se quiser reabrir.
            </p>
          ) : (
            <p className="contorno mb-3 rounded-lg bg-lima px-3 py-2 text-[12px] font-bold text-carvao">
              Inscrições abertas · quem entrar aparece na sua lista na hora
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Botao icone={Printer} onClick={baixarCartaz} disabled={!enderecoDoQr}>
              Baixar cartaz
            </Botao>
            <Botao
              variante="cobalto"
              icone={MessageCircle}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(textoDoConvite(endereco))
                  mostrar('Convite copiado. Cola no grupo do acampamento.')
                } catch {
                  mostrar('Não consegui copiar o convite.')
                }
              }}
            >
              Copiar convite
            </Botao>
            <Botao
              variante="papel"
              icone={Link2}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(endereco)
                  mostrar('Link copiado.')
                } catch {
                  mostrar(`Não consegui copiar. Anota: ${endereco}`)
                }
              }}
            >
              Só o link
            </Botao>
            <Botao
              variante="papel"
              icone={Download}
              disabled={!enderecoDoQr}
              onClick={async () => {
                try {
                  const qr = await carregarImagem(enderecosDoQr(endereco, 600)[tentativa] ?? opcoes[0])
                  const tela = document.createElement('canvas')
                  tela.width = 600
                  tela.height = 600
                  const ctx = tela.getContext('2d')
                  ctx.fillStyle = '#ffffff'
                  ctx.fillRect(0, 0, 600, 600)
                  ctx.drawImage(qr, 0, 0, 600, 600)
                  const link = document.createElement('a')
                  link.download = 'qr-inscricao.png'
                  link.href = tela.toDataURL('image/png')
                  document.body.appendChild(link)
                  link.click()
                  link.remove()
                  mostrar('QR salvo.')
                } catch {
                  mostrar('Não consegui baixar o QR agora.')
                }
              }}
            >
              Só o QR
            </Botao>
          </div>

          {aviso ? (
            <p className="contorno mt-3 inline-flex items-center gap-2 rounded-md bg-lima px-2.5 py-1.5 text-[12px] font-bold text-carvao">
              <Check className="size-3.5" strokeWidth={3} />
              {aviso}
            </p>
          ) : null}

          <p className="mt-3 text-[12px] leading-snug break-all text-tinta-media">{endereco}</p>
        </div>
      </div>
    </Cartao>
  )
}
