export function Navegacao({ abas, abaAtiva, aoTrocar }) {
  return (
    <nav className="sticky top-0 z-30 border-y-2 border-tinta bg-papel/95 backdrop-blur">
      <div className="sem-barra mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
        {abas.map((aba) => {
          const ativa = aba.id === abaAtiva
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => aoTrocar(aba.id)}
              aria-current={ativa ? 'page' : undefined}
              className={`rotulo shrink-0 rounded-lg px-3.5 py-2 text-[11px] whitespace-nowrap transition-all duration-150 ${
                ativa
                  ? 'contorno sombra-p bg-tinta text-papel-claro'
                  : 'border-2 border-transparent text-tinta-media hover:border-tinta hover:bg-lima hover:text-tinta'
              }`}
            >
              <span className="hidden sm:inline">{aba.rotulo}</span>
              <span className="sm:hidden">{aba.rotuloCurto}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
