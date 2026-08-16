import { useEffect, useState } from 'react'
import { Minus, Plus, Save, Trash2, TriangleAlert, X } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { RESULTADO_VAZIO, normalizarResultado, resultadoEhValido } from '../lib/torneio.js'
import { Botao, EscudoTime, Etiqueta } from './ui.jsx'

function CampoNumero({ rotulo, valor, aoMudar, cor = 'text-white', maximo = 99 }) {
  const ajustar = (delta) => aoMudar(Math.min(maximo, Math.max(0, valor + delta)))

  return (
    <div>
      <p className="mb-1 text-center text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{rotulo}</p>
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-navy-950/60 p-1">
        <button
          type="button"
          onClick={() => ajustar(-1)}
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
          aria-label={`Diminuir ${rotulo}`}
        >
          <Minus className="size-3.5" />
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
          className={`w-full min-w-0 bg-transparent text-center font-display text-lg font-black outline-none ${cor}`}
        />
        <button
          type="button"
          onClick={() => ajustar(1)}
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
          aria-label={`Aumentar ${rotulo}`}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function BlocoParticipante({ participante, prefixo, formulario, atualizar, vencedor }) {
  return (
    <div
      className={`rounded-2xl border p-3 transition ${
        vencedor ? 'border-neon-400/40 bg-neon-400/[0.07]' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <EscudoTime timeId={participante.timeId} tamanho="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{participante.nome}</p>
          <p className="truncate text-[11px] text-slate-400">{buscarTime(participante.timeId).nome}</p>
        </div>
        {vencedor ? <Etiqueta tom="neon">Vence</Etiqueta> : null}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <CampoNumero
          rotulo="Gols"
          valor={formulario[`gols${prefixo}`]}
          aoMudar={(valor) => atualizar(`gols${prefixo}`, valor)}
          cor="text-neon-300"
        />
        <CampoNumero
          rotulo="Amarelos"
          valor={formulario[`amarelos${prefixo}`]}
          aoMudar={(valor) => atualizar(`amarelos${prefixo}`, valor)}
          cor="text-amber-300"
          maximo={9}
        />
        <CampoNumero
          rotulo="Vermelhos"
          valor={formulario[`vermelhos${prefixo}`]}
          aoMudar={(valor) => atualizar(`vermelhos${prefixo}`, valor)}
          cor="text-rose-300"
          maximo={9}
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-void/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Resultado do jogo ${partida.numero}`}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div className="animar-surgir max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-navy-900 shadow-2xl sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <p className="font-display text-[10px] font-bold tracking-widest text-royal-300 uppercase">{partida.fase}</p>
            <h2 className="truncate text-base font-bold text-white">Jogo {partida.numero} · lançar resultado</h2>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="space-y-3 p-4">
          <BlocoParticipante
            participante={partida.a}
            prefixo="A"
            formulario={formulario}
            atualizar={atualizar}
            vencedor={vencedorA}
          />

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="font-display text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">Versus</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <BlocoParticipante
            participante={partida.b}
            prefixo="B"
            formulario={formulario}
            atualizar={atualizar}
            vencedor={vencedorB}
          />

          {empate ? (
            <div className="rounded-2xl border border-royal-500/40 bg-royal-600/15 p-3">
              <p className="mb-2 text-center text-[11px] font-bold tracking-wider text-royal-200 uppercase">
                Empate no tempo normal · decisão por pênaltis
              </p>
              <div className="grid grid-cols-2 gap-2">
                <CampoNumero
                  rotulo={`Pênaltis · ${partida.a?.nome.split(' ')[0] ?? 'A'}`}
                  valor={formulario.penaltisA}
                  aoMudar={(valor) => atualizar('penaltisA', valor)}
                  cor="text-royal-200"
                  maximo={20}
                />
                <CampoNumero
                  rotulo={`Pênaltis · ${partida.b?.nome.split(' ')[0] ?? 'B'}`}
                  valor={formulario.penaltisB}
                  aoMudar={(valor) => atualizar('penaltisB', valor)}
                  cor="text-royal-200"
                  maximo={20}
                />
              </div>
            </div>
          ) : null}

          {!valido ? (
            <p className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
              <TriangleAlert className="size-4 shrink-0" />
              Placar empatado: informe a decisão nos pênaltis para definir quem avança.
            </p>
          ) : null}

          <p className="text-center text-[11px] text-slate-500">
            Ao salvar, o vencedor avança automaticamente e o perdedor da 1ª fase cai na repescagem.
          </p>
        </div>

        <footer className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur">
          {partida.resultado ? (
            <Botao
              variante="perigo"
              icone={Trash2}
              onClick={() => {
                aoLimpar(partida.id)
                aoFechar()
              }}
            >
              Apagar
            </Botao>
          ) : null}
          <div className="flex flex-1 justify-end gap-2">
            <Botao variante="contorno" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao variante="primario" icone={Save} onClick={salvar} disabled={!valido}>
              Salvar resultado
            </Botao>
          </div>
        </footer>
      </div>
    </div>
  )
}
