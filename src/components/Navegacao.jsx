export function Navegacao({ abas, abaAtiva, aoTrocar }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/85 backdrop-blur-md">
      <div className="scrollbar-fina mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 sm:px-6">
        {abas.map((aba) => {
          const ativa = aba.id === abaAtiva
          const Icone = aba.icone
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => aoTrocar(aba.id)}
              aria-current={ativa ? 'page' : undefined}
              className={`group relative flex shrink-0 items-center gap-2 px-3 py-3 font-display text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition sm:px-4 sm:text-xs ${
                ativa ? 'text-neon-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icone className={`size-4 shrink-0 ${ativa ? 'text-neon-400' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="hidden sm:inline">{aba.rotulo}</span>
              <span className="sm:hidden">{aba.rotuloCurto}</span>
              <span
                className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition ${
                  ativa ? 'bg-neon-400 shadow-[0_0_12px_rgba(34,245,160,0.8)]' : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
