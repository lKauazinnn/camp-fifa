import { TriangleAlert } from 'lucide-react'
import { Botao } from './ui.jsx'

export function ModalConfirmacao({ aberto, titulo, descricao, textoConfirmar = 'Confirmar', variante = 'perigo', aoConfirmar, aoFechar }) {
  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-void/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div className="animar-surgir w-full max-w-sm rounded-2xl border border-white/10 bg-navy-900 p-5 shadow-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-400/30 bg-amber-400/10">
            <TriangleAlert className="size-5 text-amber-300" />
          </span>
          <h2 className="text-base font-bold text-white">{titulo}</h2>
        </div>
        <p className="mb-5 text-sm text-slate-400">{descricao}</p>
        <div className="flex justify-end gap-2">
          <Botao variante="contorno" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao
            variante={variante}
            onClick={() => {
              aoConfirmar()
              aoFechar()
            }}
          >
            {textoConfirmar}
          </Botao>
        </div>
      </div>
    </div>
  )
}
