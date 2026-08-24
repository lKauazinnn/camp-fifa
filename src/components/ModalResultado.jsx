import { useEffect, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { RESULTADO_VAZIO, normalizarResultado, resultadoEhValido } from '../lib/torneio.js'
import { Botao, EscudoTime } from './ui.jsx'
import { tocar, vibrar } from '../lib/som.js'

function CampoNumero({ rotulo, valor, aoMudar, maximo = 99, destaque = false, className = '' }) {
  const ajustar = (delta) => aoMudar(Math.min(maximo, Math.max(0, valor + delta)))

  return (
    <div className={className}>
      {/* text-current: o rótulo acompanha a cor do bloco em volta — cinza sobre
          papel, branco quando o campo está dentro da caixa azul dos pênaltis. */}
      <p className="rotulo mb-1.5 text-center text-[9px] text-current opacity-70">{rotulo}</p>
      <div
        className={`contorno flex items-center overflow-hidden rounded-lg ${
          destaque ? 'bg-lima text-carvao' : 'bg-papel-claro'
        }`}
      >
        <button
          type="button"
          onClick={() => ajustar(-1)}
          className="grid size-9 shrink-0 place-items-center border-r-2 border-tinta transition-colors hover:bg-tinta hover:text-papel"
          aria-label={`Diminuir ${rotulo}`}
        >
          <Minus className="size-3.5" strokeWidth={3} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={maximo}
          value={valor}
          onChange={(evento) => {
            const numero = Number.parseInt(evento.target.value, 10)
            aoMudar(Number.isFinite(numero) ? Math.min(maximo, Math.max(0, numero)) : 0)
          }}
          className="num w-full min-w-0 bg-transparent py-1.5 text-center font-display text-xl outline-none"
        />
        <button
          type="button"
          onClick={() => ajustar(1)}
          className="grid size-9 shrink-0 place-items-center border-l-2 border-tinta transition-colors hover:bg-tinta hover:text-papel"
          aria-label={`Aumentar ${rotulo}`}
        >
          <Plus className="size-3.5" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

function Lado({ participante, prefixo, formulario, atualizar, vencedor }) {
  const { buscarTime } = useTimes()
  return (
    <div className={`contorno rounded-lg p-3 ${vencedor ? 'bg-lima/35' : 'bg-papel'}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <EscudoTime timeId={participante.timeId} tamanho="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold">{participante.nome}</p>
          <p className="truncate text-[11px] text-tinta-media">{buscarTime(participante.timeId).nome}</p>
        </div>
        {vencedor ? (
          <span className="contorno rotulo shrink-0 rounded-md bg-lima px-2 py-1 text-[9px] text-carvao">Vence</span>
        ) : null}
      </div>

      {/* No celular o campo de gols ocupa a linha inteira: três colunas de
          stepper em 320px deixariam o número sem espaço. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <CampoNumero
          rotulo="Gols"
          destaque
          className="col-span-2 sm:col-span-1"
          valor={formulario[`gols${prefixo}`]}
          aoMudar={(valor) => atualizar(`gols${prefixo}`, valor)}
        />
        <CampoNumero
          rotulo="Amarelo"
          maximo={9}
          valor={formulario[`amarelos${prefixo}`]}
          aoMudar={(valor) => atualizar(`amarelos${prefixo}`, valor)}
        />
        <CampoNumero
          rotulo="Vermelho"
          maximo={9}
          valor={formulario[`vermelhos${prefixo}`]}
          aoMudar={(valor) => atualizar(`vermelhos${prefixo}`, valor)}
        />
      </div>
    </div>
  )
}

export function ModalResultado({ partida, aoSalvar, aoLimpar, aoFechar }) {
  const [formulario, setFormulario] = useState(() => normalizarResultado(partida?.resultado ?? RESULTADO_VAZIO))

  useEffect(() => {
    setFormulario(normalizarResultado(partida?.resultado ?? RESULTADO_VAZIO))
  }, [partida])

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') aoFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = ''
    }
  }, [aoFechar])

  // Só é possível lançar resultado quando os dois lados já estão definidos.
  if (!partida?.a || !partida?.b) return null

  const atualizar = (campo, valor) => setFormulario((anterior) => ({ ...anterior, [campo]: valor }))

  const empate = formulario.golsA === formulario.golsB
  const valido = resultadoEhValido(formulario)
  const vencedorA = formulario.golsA > formulario.golsB || (empate && formulario.penaltisA > formulario.penaltisB)
  const vencedorB = formulario.golsB > formulario.golsA || (empate && formulario.penaltisB > formulario.penaltisA)

  const salvar = () => {
    if (!valido) return
    aoSalvar(partida.id, formulario)
    // Jogo com gol sai com grito de gol; 0 a 0 sai com o blip de sempre.
    const teveGol = formulario.golsA + formulario.golsB > 0
    tocar(teveGol ? 'gol' : 'clique')
    if (teveGol) vibrar([25, 40, 25])
    aoFechar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-carvao/70 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Resultado do jogo ${partida.numero}`}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div className="contorno sombra-g animar-entrar max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-xl bg-papel-claro sm:rounded-xl">
        {/* Bloco invertido: escuro no tema papel, cinza-chumbo no tema preto. */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-2 border-tinta bg-carvao px-4 py-3 text-creme escuro:bg-papel-escuro escuro:text-tinta">
          <div className="min-w-0">
            <p className="rotulo text-[9px] text-lima">{partida.fase}</p>
            <h2 className="mt-1 truncate text-xl text-current">Jogo {partida.numero}</h2>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="grid size-8 shrink-0 place-items-center rounded-md border-2 border-current/40 transition-colors hover:border-lima hover:text-lima"
            aria-label="Fechar"
          >
            <X className="size-4" strokeWidth={3} />
          </button>
        </header>

        <div className="space-y-3 p-4">
          <Lado participante={partida.a} prefixo="A" formulario={formulario} atualizar={atualizar} vencedor={vencedorA} />

          <div className="flex items-center gap-3">
            <span className="h-[2px] flex-1 bg-tinta" />
            <span className="rotulo text-[10px]">versus</span>
            <span className="h-[2px] flex-1 bg-tinta" />
          </div>

          <Lado participante={partida.b} prefixo="B" formulario={formulario} atualizar={atualizar} vencedor={vencedorB} />

          {empate ? (
            <div className="contorno rounded-lg bg-cobalto p-3 text-white">
              <p className="rotulo mb-2.5 text-center text-[10px]">Empatou · decide nos pênaltis</p>
              <div className="grid grid-cols-2 gap-2">
                <CampoNumero
                  rotulo={partida.a.nome.split(' ')[0]}
                  maximo={20}
                  valor={formulario.penaltisA}
                  aoMudar={(valor) => atualizar('penaltisA', valor)}
                />
                <CampoNumero
                  rotulo={partida.b.nome.split(' ')[0]}
                  maximo={20}
                  valor={formulario.penaltisB}
                  aoMudar={(valor) => atualizar('penaltisB', valor)}
                />
              </div>
              {!valido ? (
                <p className="mt-2.5 text-center text-[12px] font-bold text-lima">
                  Coloque placares diferentes nos pênaltis pra definir quem passa.
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="pt-1 text-center text-[12px] leading-snug text-tinta-media">
            Ao salvar, o vencedor avança e o perdedor da primeira fase cai na repescagem.
          </p>
        </div>

        <footer className="sticky bottom-0 flex items-center gap-2 border-t-2 border-tinta bg-papel-escuro px-4 py-3">
          {partida.resultado ? (
            <Botao variante="papel" onClick={() => { aoLimpar(partida.id); aoFechar() }}>
              Apagar
            </Botao>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Botao variante="papel" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao variante="primario" onClick={salvar} disabled={!valido}>
              Salvar placar
            </Botao>
          </div>
        </footer>
      </div>
    </div>
  )
}
