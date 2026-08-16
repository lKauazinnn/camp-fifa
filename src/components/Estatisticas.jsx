import { BarChart3 } from 'lucide-react'
import { LIMITE_AMARELOS, situacaoDisciplinar } from '../lib/estatisticas.js'
import { buscarTime } from '../data/times.js'
import { Cartao, EscudoTime, EstadoVazio, Etiqueta, Metrica, TituloSecao } from './ui.jsx'

const TOM_SITUACAO = { vermelho: 'alerta', amarelo: 'alerta', atencao: 'ativo', ok: 'discreto' }

function LinhaArtilharia({ linha, posicao }) {
  const lider = posicao === 0 && linha.gols > 0
  return (
    <tr className="border-t border-borda/70 transition-colors hover:bg-white/[0.02]">
      <td className="py-3 pr-4">
        <span className={`num font-serif text-lg leading-none ${lider ? 'dourado' : 'text-perola-600'}`}>
          {posicao + 1}
        </span>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <EscudoTime timeId={linha.participante.timeId} tamanho="sm" vencedor={lider} />
          <div className="min-w-0">
            <p className={`truncate text-[13px] ${lider ? 'text-perola-100' : 'text-perola-200'}`}>
              {linha.participante.nome}
            </p>
            <p className="truncate text-[11px] text-perola-600">{buscarTime(linha.participante.timeId).nome}</p>
          </div>
        </div>
      </td>
      <td className="num hidden py-3 text-center text-[13px] text-perola-500 sm:table-cell">{linha.jogos}</td>
      <td className="num hidden py-3 text-center text-[13px] text-perola-500 sm:table-cell">{linha.vitorias}</td>
      <td className="num hidden py-3 text-center text-[13px] text-perola-500 md:table-cell">
        {linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}
      </td>
      <td className={`num py-3 pl-4 text-right font-serif text-xl ${lider ? 'text-realce' : 'text-perola-100'}`}>
        {linha.gols}
      </td>
    </tr>
  )
}

function LinhaDisciplina({ linha }) {
  const situacao = situacaoDisciplinar(linha)
  return (
    <tr className="border-t border-borda/70">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <EscudoTime timeId={linha.participante.timeId} tamanho="sm" />
          <p className="truncate text-[13px] text-perola-200">{linha.participante.nome}</p>
        </div>
      </td>
      <td className="num py-3 text-center text-[13px] text-perola-500">{linha.jogos}</td>
      <td className="py-3 text-center">
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-[3px] rounded-full bg-amber-400/85" />
          <span className="num text-[13px] text-perola-300">{linha.amarelos}</span>
        </span>
      </td>
      <td className="py-3 text-center">
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-[3px] rounded-full bg-rose-500/85" />
          <span className="num text-[13px] text-perola-300">{linha.vermelhos}</span>
        </span>
      </td>
      <td className="py-3 pl-4 text-right">
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Cartao className="p-5">
          <Metrica dourado valor={resumo.totalGols} rotulo="Gols no campeonato" />
        </Cartao>
        <Cartao className="p-5">
          <Metrica valor={resumo.mediaGols} rotulo="Média por jogo" />
        </Cartao>
        <Cartao className="p-5">
          <Metrica valor={resumo.totalAmarelos} rotulo="Cartões amarelos" />
        </Cartao>
        <Cartao className="p-5">
          <Metrica valor={resumo.totalVermelhos} rotulo="Cartões vermelhos" />
        </Cartao>
      </div>

      {resumo.artilheiro ? (
        <Cartao realce className="flex items-center gap-5 p-5 sm:p-6">
          <EscudoTime timeId={resumo.artilheiro.participante.timeId} tamanho="lg" vencedor />
          <div className="min-w-0 flex-1">
            <p className="rotulo text-realce/80">Artilheiro</p>
            <p className="mt-2 truncate font-serif text-2xl leading-none text-perola-100">
              {resumo.artilheiro.participante.nome}
            </p>
            <p className="mt-2 truncate text-[12px] text-perola-500">
              {buscarTime(resumo.artilheiro.participante.timeId).nome} · {resumo.artilheiro.jogos} jogo(s)
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="num dourado font-serif text-5xl leading-none">{resumo.artilheiro.gols}</p>
            <p className="rotulo mt-2">Gols</p>
          </div>
        </Cartao>
      ) : null}

      <Cartao className="p-5 sm:p-7">
        <TituloSecao className="mb-5" titulo="Artilharia" descricao="Gols somando chave principal e repescagem." />
        <div className="scrollbar-fina -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[380px] border-collapse text-left">
            <thead>
              <tr className="rotulo">
                <th className="pb-3 pr-4 font-medium">#</th>
                <th className="pb-3 pr-4 font-medium">Participante</th>
                <th className="hidden pb-3 text-center font-medium sm:table-cell">Jogos</th>
                <th className="hidden pb-3 text-center font-medium sm:table-cell">Vit.</th>
                <th className="hidden pb-3 text-center font-medium md:table-cell">Saldo</th>
                <th className="pb-3 pl-4 text-right font-medium">Gols</th>
              </tr>
            </thead>
            <tbody>
              {comJogos.map((linha, posicao) => (
                <LinhaArtilharia key={linha.participante.id} linha={linha} posicao={posicao} />
              ))}
            </tbody>
          </table>
        </div>
      </Cartao>

      <Cartao className="p-5 sm:p-7">
        <TituloSecao
          className="mb-5"
          titulo="Disciplina"
          descricao={`${LIMITE_AMARELOS} amarelos acumulados ou 1 vermelho geram suspensão no jogo seguinte.`}
        />
        <div className="scrollbar-fina -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[440px] border-collapse text-left">
            <thead>
              <tr className="rotulo">
                <th className="pb-3 pr-4 font-medium">Participante</th>
                <th className="pb-3 text-center font-medium">Jogos</th>
                <th className="pb-3 text-center font-medium">Amarelos</th>
                <th className="pb-3 text-center font-medium">Vermelhos</th>
                <th className="pb-3 pl-4 text-right font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {disciplina.map((linha) => (
                <LinhaDisciplina key={linha.participante.id} linha={linha} />
              ))}
            </tbody>
          </table>
        </div>
      </Cartao>

      <p className="px-1 text-[12px] text-perola-600">
        {resumo.totalPartidas} jogo(s) finalizado(s) · {resumo.decisoesNosPenaltis} decidido(s) nos pênaltis ·{' '}
        {estatisticas.length} inscritos
      </p>
    </div>
  )
}
