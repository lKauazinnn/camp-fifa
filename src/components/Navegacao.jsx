export function Navegacao({ abas, abaAtiva, aoTrocar }) {
  return (
    <nav className="sticky top-0 z-30 border-y border-borda bg-fundo/80 backdrop-blur-xl">
      <div className="sem-barra mx-auto flex max-w-6xl gap-7 overflow-x-auto px-5 sm:gap-9 sm:px-8">
        {abas.map((aba) => {
          const ativa = aba.id === abaAtiva
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => aoTrocar(aba.id)}
              aria-current={ativa ? 'page' : undefined}
              className={`relative shrink-0 py-4 text-[13px] whitespace-nowrap transition-colors duration-200 ${
                ativa ? 'text-realce' : 'text-perola-500 hover:text-perola-200'
              }`}
            >
              <span className="hidden sm:inline">{aba.rotulo}</span>
              <span className="sm:hidden">{aba.rotuloCurto}</span>
              <span
                className={`absolute inset-x-0 -bottom-px h-px transition-opacity duration-200 ${
                  ativa ? 'bg-[linear-gradient(90deg,transparent,#e3c88c,transparent)] opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
