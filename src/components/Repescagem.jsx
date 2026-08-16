import { Award, Info, RotateCcw } from 'lucide-react'
import { buscarTime } from '../data/times.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { Cartao, EscudoTime, EstadoVazio, Etiqueta, TituloSecao } from './ui.jsx'

export function Repescagem({ torneio, aoEditarPartida }) {
  if (!torneio.ativo || !torneio.repescagem.length) {
    return (
      <EstadoVazio
        icone={RotateCcw}
        titulo="Repescagem indisponível"
        descricao="A chave de repescagem é criada junto com o sorteio da primeira fase — ela recebe automaticamente todos os eliminados das oitavas."
      />
    )
  }

  const decisao = torneio.repescagem.at(-1)?.partidas[0] ?? null

  return (
    <div className="space-y-5">
      <Cartao className="border-royal-500/30 bg-gradient-to-r from-royal-600/20 to-transparent p-4 sm:p-5">
        <div className="flex gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-royal-300" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase">Como funciona a repescagem</h3>
            <p className="text-sm text-slate-300">
              Ninguém sai do acampamento depois de um jogo só. Todos os eliminados da <strong>primeira fase</strong> caem
              automaticamente nesta chave e seguem jogando entre si. Quem vencer todos os confrontos aqui fica com o{' '}
              <strong className="text-gold-300">3º lugar</strong> do campeonato.
            </p>
          </div>
        </div>
      </Cartao>

      {torneio.terceiro ? (
        <Cartao className="border-amber-600/40 bg-amber-700/10 p-4">
          <div className="flex items-center gap-3">
            <Award className="size-6 shrink-0 text-amber-500" />
            <EscudoTime timeId={torneio.terceiro.timeId} tamanho="md" />
            <div className="min-w-0">
              <Etiqueta tom="amarelo">3º lugar garantido</Etiqueta>
              <p className="mt-1 truncate text-base font-bold text-white">{torneio.terceiro.nome}</p>
              <p className="truncate text-xs text-slate-400">{buscarTime(torneio.terceiro.timeId).nome}</p>
            </div>
          </div>
        </Cartao>
      ) : decisao ? (
        <Cartao className="p-4">
          <p className="text-sm text-slate-400">
            A <strong className="text-white">{decisao.fase}</strong> ainda não foi disputada — o 3º lugar segue em aberto.
          </p>
        </Cartao>
      ) : null}

      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          icone={RotateCcw}
          titulo="Chave da repescagem"
          descricao="Eliminados da primeira fase disputando o pódio."
        />
        <ChaveVisual rodadas={torneio.repescagem} aoEditar={aoEditarPartida} />
      </Cartao>
    </div>
  )
}
