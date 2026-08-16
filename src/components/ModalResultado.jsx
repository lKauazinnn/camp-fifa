import { useEffect, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { RESULTADO_VAZIO, normalizarResultado, resultadoEhValido } from '../lib/torneio.js'
import { Botao, EscudoTime } from './ui.jsx'

function CampoNumero({ rotulo, valor, aoMudar, maximo = 99, destaque = false }) {
  const ajustar = (delta) => aoMudar(Math.min(maximo, Math.max(0, valor + delta)))

  return (
    <div>
      <p className="rotulo mb-2 text-center">{rotulo}</p>
      <div className="flex items-center rounded-xl border border-borda bg-fundo/60">
        <button
          type="button"
          onClick={() => ajustar(-1)}
          className="grid size-9 shrink-0 place-items-center rounded-l-xl text-perola-500 transition-colors hover:bg-white/[0.06] hover:text-perola-100"
          aria-label={`Diminuir ${rotulo}`}
        >
          <Minus className="size-3.5" strokeWidth={2} />
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
          className={`num w-full min-w-0 bg-transparent py-2 text-center font-serif text-xl outline-none ${
            destaque ? 'text-realce' : 'text-perola-200'
          }`}
        />
        <button
          type="button"
          onClick={() => ajustar(1)}
          className="grid size-9 shrink-0 place-items-center rounded-r-xl text-perola-500 transition-colors hover:bg-white/[0.06] hover:text-perola-100"
          aria-label={`Aumentar ${rotulo}`}
        >
          <Plus className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

function Lado({ participante, prefixo, formulario, atualizar, vencedor }) {
  return (
    <div className={`rounded-2xl border p-4 transition-colors ${vencedor ? 'border-realce/30 bg-realce/[0.04]' : 'border-borda'}`}>
      <div className="mb-4 flex items-center gap-3">
        <EscudoTime timeId={participante.timeId} tamanho="md" vencedor={vencedor} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] text-perola-100">{participante.nome}</p>
          <p className="truncate text-[11px] text-perola-500">{buscarTime(participante.timeId).nome}</p>
        </div>
        {vencedor ? <span className="rotulo shrink-0 text-realce">Vence</span> : null}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <CampoNumero
          rotulo="Gols"
          destaque
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
    aoFechar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Resultado do jogo ${partida.numero}`}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div className="painel animar-surgir max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-borda-forte/60 bg-superficie sm:rounded-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-borda bg-superficie/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="rotulo text-realce/70">{partida.fase}</p>
            <h2 className="mt-1.5 truncate font-serif text-xl leading-none text-perola-100">Jogo {partida.numero}</h2>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="grid size-9 shrink-0 place-items-center rounded-xl text-perola-500 transition-colors hover:bg-white/[0.06] hover:text-perola-100"
            aria-label="Fechar"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </header>

        <div className="space-y-3 p-5">
          <Lado participante={partida.a} prefixo="A" formulario={formulario} atualizar={atualizar} vencedor={vencedorA} />

          <div className="flex items-center gap-3 py-0.5">
            <span className="h-px flex-1 bg-borda" />
            <span className="rotulo">contra</span>
            <span className="h-px flex-1 bg-borda" />
          </div>

          <Lado participante={partida.b} prefixo="B" formulario={formulario} atualizar={atualizar} vencedor={vencedorB} />

          {empate ? (
            <div className="rounded-2xl border border-borda p-4">
              <p className="rotulo mb-3 text-center">Empate · decisão por pênaltis</p>
              <div className="grid grid-cols-2 gap-2.5">
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
                <p className="mt-3 text-center text-[12px] text-amber-300">
                  Informe placares diferentes nos pênaltis para definir quem avança.
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="pt-1 text-center text-[12px] leading-relaxed text-perola-600">
            Ao salvar, o vencedor avança e o perdedor da primeira fase cai na repescagem.
          </p>
        </div>

        <footer className="sticky bottom-0 flex items-center gap-2 border-t border-borda bg-superficie/95 px-5 py-4 backdrop-blur">
          {partida.resultado ? (
            <Botao
              variante="fantasma"
              onClick={() => {
                aoLimpar(partida.id)
                aoFechar()
              }}
            >
              Apagar
            </Botao>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Botao variante="contorno" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao variante="primario" onClick={salvar} disabled={!valido}>
              Salvar resultado
            </Botao>
          </div>
        </footer>
      </div>
    </div>
  )
}
