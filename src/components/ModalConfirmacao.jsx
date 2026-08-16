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
      className="fixed inset-0 z-50 grid place-items-center bg-carvao/70 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div className="contorno sombra-g animar-entrar w-full max-w-sm rounded-xl bg-papel-claro p-5">
        <h2 className="text-2xl">{titulo}</h2>
        <p className="mt-3 text-[14px] leading-snug text-tinta-media">{descricao}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Botao variante="papel" onClick={aoFechar}>
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
