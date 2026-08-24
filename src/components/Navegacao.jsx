import { tocar } from '../lib/som.js'

export function Navegacao({ abas, abaAtiva, aoTrocar }) {
  return (
    <nav className="sticky top-0 z-30 border-y-2 border-tinta bg-papel/95 backdrop-blur">
      <div className="sem-barra mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
        {abas.map((aba) => {
          const ativa = aba.id === abaAtiva
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => {
                tocar('trocar')
                aoTrocar(aba.id)
              }}
              aria-current={ativa ? 'page' : undefined}
              className={`rotulo shrink-0 rounded-lg px-3.5 py-2 text-[11px] whitespace-nowrap transition-all duration-150 ${
                ativa
                  ? 'contorno sombra-p bg-tinta text-papel-claro'
                  : 'border-2 border-transparent text-tinta-media hover:border-tinta hover:bg-lima hover:text-carvao'
              }`}
            >
              {/* Seta piscando na aba selecionada, como cursor de menu de arcade. */}
              {ativa ? <span className="piscar-duro mr-1.5 text-lima">▶</span> : null}
              <span className="hidden sm:inline">{aba.rotulo}</span>
              <span className="sm:hidden">{aba.rotuloCurto}</span>
            </button>
          )
        })}

        {/* Dica de fliperama: dá para trocar de tela no teclado. */}
        <span className="rotulo ml-auto hidden shrink-0 items-center gap-1.5 self-center text-[9px] text-tinta-fraca lg:flex">
          <kbd className="contorno rounded bg-papel-claro px-1.5 py-0.5">◀</kbd>
          <kbd className="contorno rounded bg-papel-claro px-1.5 py-0.5">▶</kbd>
          trocam de tela
        </span>
      </div>
    </nav>
  )
}
