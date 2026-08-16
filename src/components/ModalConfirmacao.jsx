import { Botao } from './ui.jsx'

export function ModalConfirmacao({
  aberto,
  titulo,
  descricao,
  textoConfirmar = 'Confirmar',
  variante = 'perigo',
  aoConfirmar,
  aoFechar,
}) {
  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div className="animar-surgir w-full max-w-sm rounded-xl border border-borda bg-superficie p-5">
        <h2 className="text-[15px] font-medium text-zinc-100">{titulo}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{descricao}</p>
        <div className="mt-5 flex justify-end gap-2">
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
