import { BarChart3 } from 'lucide-react'
import { LIMITE_AMARELOS, situacaoDisciplinar } from '../lib/estatisticas.js'
import { buscarTime } from '../data/times.js'
import { Cartao, EscudoTime, EstadoVazio, Etiqueta, Metrica, TituloSecao } from './ui.jsx'

const TOM_SITUACAO = { vermelho: 'alerta', amarelo: 'alerta', atencao: 'ativo', ok: 'discreto' }

function Artilheiro({ linha, posicao }) {
  return (
    <tr className="border-t border-borda transition-colors hover:bg-white/[0.02]">
      <td className="py-2.5 pr-3">
        <span className={`num text-[12px] ${posicao === 0 ? 'text-realce' : 'text-zinc-600'}`}>{posicao + 1}</span>
      </td>
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2.5">
          <EscudoTime timeId={linha.participante.timeId} tamanho="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] text-zinc-200">{linha.participante.nome}</p>
            <p className="truncate text-[11px] text-zinc-600">{buscarTime(linha.participante.timeId).nome}</p>
          </div>
        </div>
      </td>
      <td className="num hidden py-2.5 text-center text-[13px] text-zinc-500 sm:table-cell">{linha.jogos}</td>
      <td className="num hidden py-2.5 text-center text-[13px] text-zinc-500 sm:table-cell">{linha.vitorias}</td>
      <td className="num hidden py-2.5 text-center text-[13px] text-zinc-500 md:table-cell">
        {linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}
      </td>
      <td className="num py-2.5 pl-3 text-right text-[15px] font-medium text-zinc-100">{linha.gols}</td>
    </tr>
  )
}

function Disciplina({ linha }) {
  const situacao = situacaoDisciplinar(linha)
  return (
    <tr className="border-t border-borda">
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2.5">
          <EscudoTime timeId={linha.participante.timeId} tamanho="sm" />
          <p className="truncate text-[13px] text-zinc-200">{linha.participante.nome}</p>
        </div>
      </td>
      <td className="num py-2.5 text-center text-[13px] text-zinc-500">{linha.jogos}</td>
      <td className="py-2.5 text-center">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-[3px] rounded-full bg-amber-400/80" />
          <span className="num text-[13px] text-zinc-300">{linha.amarelos}</span>
        </span>
      </td>
      <td className="py-2.5 text-center">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-[3px] rounded-full bg-rose-500/80" />
          <span className="num text-[13px] text-zinc-300">{linha.vermelhos}</span>
        </span>
      </td>
      <td className="py-2.5 pl-3 text-right">
        <Etiqueta tom={TOM_SITUACAO[situacao.tom]}>{situacao.rotulo}</Etiqueta>
      </td>
    </tr>
  )
}

export function Estatisticas({ estatisticas, resumo }) {
  const comJogos = estatisticas.filter((linha) => linha.jogos > 0)

  if (!comJogos.length) {
    return (
      <EstadoVazio
        icone={BarChart3}
        titulo="Sem estatísticas ainda"
        descricao="Assim que o primeiro resultado for lançado, artilharia e cartões aparecem aqui."
      />
    )
  }

  const disciplina = [...comJogos].sort(
    (a, b) =>
      b.vermelhos - a.vermelhos || b.amarelos - a.amarelos || a.participante.nome.localeCompare(b.participante.nome),
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { valor: resumo.totalGols, rotulo: 'Gols no campeonato' },
          { valor: resumo.mediaGols, rotulo: 'Média por jogo' },
          { valor: resumo.totalAmarelos, rotulo: 'Cartões amarelos' },
          { valor: resumo.totalVermelhos, rotulo: 'Cartões vermelhos' },
        ].map((item) => (
          <Cartao key={item.rotulo} className="p-4">
            <Metrica valor={item.valor} rotulo={item.rotulo} />
          </Cartao>
        ))}
      </div>

      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          className="mb-2"
          titulo="Artilharia"
          descricao="Gols somando chave principal e repescagem."
          acao={
            resumo.artilheiro ? (
              <span className="text-[13px] text-zinc-500">
                Líder: <span className="text-zinc-200">{resumo.artilheiro.participante.nome}</span>
              </span>
            ) : null
          }
        />
        <div className="scrollbar-fina -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[380px] border-collapse text-left">
            <thead>
              <tr className="rotulo">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-3 font-medium">Participante</th>
                <th className="hidden pb-2 text-center font-medium sm:table-cell">J</th>
                <th className="hidden pb-2 text-center font-medium sm:table-cell">V</th>
                <th className="hidden pb-2 text-center font-medium md:table-cell">SG</th>
                <th className="pb-2 pl-3 text-right font-medium">Gols</th>
              </tr>
            </thead>
            <tbody>
              {comJogos.map((linha, posicao) => (
                <Artilheiro key={linha.participante.id} linha={linha} posicao={posicao} />
              ))}
            </tbody>
          </table>
        </div>
      </Cartao>

      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          className="mb-2"
          titulo="Disciplina"
          descricao={`${LIMITE_AMARELOS} amarelos acumulados ou 1 vermelho geram suspensão no jogo seguinte.`}
        />
        <div className="scrollbar-fina -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="rotulo">
                <th className="pb-2 pr-3 font-medium">Participante</th>
                <th className="pb-2 text-center font-medium">Jogos</th>
                <th className="pb-2 text-center font-medium">Amarelos</th>
                <th className="pb-2 text-center font-medium">Vermelhos</th>
                <th className="pb-2 pl-3 text-right font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {disciplina.map((linha) => (
                <Disciplina key={linha.participante.id} linha={linha} />
              ))}
            </tbody>
          </table>
        </div>
      </Cartao>

      <p className="px-1 text-[12px] text-zinc-600">
        {resumo.totalPartidas} jogo(s) finalizado(s) · {resumo.decisoesNosPenaltis} decidido(s) nos pênaltis ·{' '}
        {estatisticas.length} inscritos
      </p>
    </div>
  )
}
