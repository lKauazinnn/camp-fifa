export function Navegacao({ abas, abaAtiva, aoTrocar }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-borda bg-fundo/85 backdrop-blur-md">
      <div className="sem-barra mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 sm:px-6">
        {abas.map((aba) => {
          const ativa = aba.id === abaAtiva
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => aoTrocar(aba.id)}
              aria-current={ativa ? 'page' : undefined}
              className={`relative shrink-0 py-3.5 text-[13px] whitespace-nowrap transition-colors ${
                ativa ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="hidden sm:inline">{aba.rotulo}</span>
              <span className="sm:hidden">{aba.rotuloCurto}</span>
              <span
                className={`absolute inset-x-0 -bottom-px h-px ${ativa ? 'bg-zinc-100' : 'bg-transparent'}`}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
