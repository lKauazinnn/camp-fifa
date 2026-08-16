import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Download, Link2, Printer } from 'lucide-react'
import { Botao, Cartao, TituloSecao } from './ui.jsx'

/** Endereço que o QR abre: a mesma página, na tela de inscrição. */
export function enderecoDeInscricao() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#inscricao`
}

export function QrInscricao({ torneio }) {
  const tela = useRef(null)
  const [aviso, setAviso] = useState(null)
  const [endereco] = useState(() => enderecoDeInscricao())
  const encerrada = torneio.ativo

  const mostrar = (texto) => {
    setAviso(texto)
    window.setTimeout(() => setAviso(null), 3500)
  }

  useEffect(() => {
    if (!tela.current) return
    QRCode.toCanvas(tela.current, endereco, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#14131a', light: '#fbf9f3' },
    }).catch(() => {})
  }, [endereco])

  const baixar = () => {
    const canvas = tela.current
    if (!canvas) return
    // Cartaz pronto para imprimir: QR grande com a chamada em cima.
    const cartaz = document.createElement('canvas')
    const largura = 800
    const altura = 1000
    cartaz.width = largura
    cartaz.height = altura
    const ctx = cartaz.getContext('2d')

    ctx.fillStyle = '#f0ece1'
    ctx.fillRect(0, 0, largura, altura)
    ctx.fillStyle = '#14131a'
    ctx.fillRect(0, 0, largura, 150)

    ctx.fillStyle = '#ccff00'
    ctx.font = 'bold 58px "Archivo Black", Arial Black, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('CAMPEONATO FIFA', largura / 2, 95)

    ctx.fillStyle = '#14131a'
    ctx.font = 'bold 40px "Archivo Black", Arial Black, sans-serif'
    ctx.fillText('UNIDOS ACAMP', largura / 2, 215)

    ctx.font = '26px Inter, Arial, sans-serif'
    ctx.fillText('Aponte a câmera para se inscrever', largura / 2, 262)

    const lado = 440
    const x = (largura - lado) / 2
    ctx.fillStyle = '#14131a'
    ctx.fillRect(x - 10, 300 - 10, lado + 20, lado + 20)
    ctx.drawImage(canvas, x, 300, lado, lado)

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
  }

  return (
    <Cartao className="p-4 sm:p-6">
      <TituloSecao
        className="mb-4"
        titulo="QR de inscrição"
        descricao="A galera aponta a câmera, escreve o nome, escolhe o time e entra sozinha na lista."
      />

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="contorno sombra shrink-0 rounded-xl bg-papel-claro p-3">
          <canvas ref={tela} className="block size-40 sm:size-48" />
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
            <Botao icone={Printer} onClick={baixar}>
              Baixar cartaz
            </Botao>
            <Botao
              variante="papel"
              icone={Link2}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(endereco)
                  mostrar('Link copiado.')
                } catch {
                  mostrar('Não consegui copiar. Anota: ' + endereco)
                }
              }}
            >
              Copiar link
            </Botao>
            <Botao
              variante="papel"
              icone={Download}
              onClick={() => {
                const link = document.createElement('a')
                link.download = 'qr-inscricao.png'
                link.href = tela.current.toDataURL('image/png')
                document.body.appendChild(link)
                link.click()
                link.remove()
                mostrar('QR salvo.')
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
