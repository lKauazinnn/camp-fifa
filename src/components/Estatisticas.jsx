import { BarChart3, Flame, Goal, ShieldAlert, Target, TriangleAlert, Trophy, Users } from 'lucide-react'
import { LIMITE_AMARELOS, situacaoDisciplinar } from '../lib/estatisticas.js'
import { buscarTime } from '../data/times.js'
import { Cartao, EscudoTime, EstadoVazio, Etiqueta, TituloSecao } from './ui.jsx'

function Indicador({ icone: Icone, rotulo, valor, cor = 'text-neon-300' }) {
  return (
    <Cartao className="flex items-center gap-3 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
        <Icone className={`size-4 ${cor}`} />
      </span>
      <div className="min-w-0">
        <p className={`font-display text-lg leading-none font-black ${cor}`}>{valor}</p>
        <p className="truncate text-[10px] tracking-wider text-slate-400 uppercase">{rotulo}</p>
      </div>
    </Cartao>
  )
}

const MEDALHAS = ['text-gold-400', 'text-slate-300', 'text-amber-600']

function LinhaArtilharia({ linha, posicao }) {
  const destaque = posicao < 3 && linha.gols > 0

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border p-2.5 transition ${
        destaque ? 'border-gold-400/25 bg-gold-400/[0.06]' : 'border-white/5 bg-white/[0.02]'
      }`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-lg font-display text-xs font-black ${
          destaque ? `bg-white/10 ${MEDALHAS[posicao]}` : 'bg-white/5 text-slate-500'
        }`}
      >
        {posicao + 1}
      </span>

      <EscudoTime timeId={linha.participante.timeId} tamanho="sm" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{linha.participante.nome}</p>
        <p className="truncate text-[11px] text-slate-500">{buscarTime(linha.participante.timeId).nome}</p>
      </div>

      <div className="hidden shrink-0 items-center gap-3 text-center sm:flex">
        <div>
          <p className="font-display text-sm font-bold text-slate-300">{linha.jogos}</p>
          <p className="text-[9px] tracking-wider text-slate-500 uppercase">Jogos</p>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-slate-300">{linha.vitorias}</p>
          <p className="text-[9px] tracking-wider text-slate-500 uppercase">Vitórias</p>
        </div>
        <div>
          <p className={`font-display text-sm font-bold ${linha.saldo > 0 ? 'text-neon-300' : 'text-slate-400'}`}>
            {linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}
          </p>
          <p className="text-[9px] tracking-wider text-slate-500 uppercase">Saldo</p>
        </div>
      </div>

      <div className="w-12 shrink-0 text-right">
        <p className="font-display text-xl leading-none font-black text-neon-300">{linha.gols}</p>
        <p className="text-[9px] tracking-wider text-slate-500 uppercase">Gols</p>
      </div>
    </li>
  )
}

function LinhaDisciplina({ linha }) {
  const situacao = situacaoDisciplinar(linha)

  return (
    <tr className="border-t border-white/5">
      <td className="py-2.5 pr-2">
        <div className="flex items-center gap-2">
          <EscudoTime timeId={linha.participante.timeId} tamanho="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{linha.participante.nome}</p>
            <p className="truncate text-[10px] text-slate-500 sm:hidden">{linha.jogos} jogo(s)</p>
          </div>
        </div>
      </td>
      <td className="hidden py-2.5 text-center text-sm text-slate-400 sm:table-cell">{linha.jogos}</td>
      <td className="py-2.5 text-center">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-3 rounded-[2px] bg-amber-400" />
          <span className="font-display text-sm font-bold text-amber-300">{linha.amarelos}</span>
        </span>
      </td>
      <td className="py-2.5 text-center">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-3 rounded-[2px] bg-rose-500" />
          <span className="font-display text-sm font-bold text-rose-300">{linha.vermelhos}</span>
        </span>
      </td>
      <td className="py-2.5 pl-2 text-right">
        <Etiqueta tom={situacao.tom}>{situacao.rotulo}</Etiqueta>
      </td>
    </tr>
  )
}

export function Estatisticas({ estatisticas, resumo }) {
  if (!estatisticas.length) {
    return (
      <EstadoVazio
        icone={BarChart3}
        titulo="Sem estatísticas ainda"
        descricao="Cadastre os participantes e lance os primeiros resultados para ver artilharia e cartões aparecerem aqui."
      />
    )
  }

  const artilharia = estatisticas.filter((linha) => linha.jogos > 0)
  const disciplina = [...estatisticas]
    .filter((linha) => linha.jogos > 0)
    .sort(
      (a, b) =>
        b.vermelhos - a.vermelhos ||
        b.amarelos - a.amarelos ||
        a.participante.nome.localeCompare(b.participante.nome),
    )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador icone={Goal} rotulo="Gols no campeonato" valor={resumo.totalGols} />
        <Indicador icone={Target} rotulo="Média por jogo" valor={resumo.mediaGols} cor="text-royal-300" />
        <Indicador icone={TriangleAlert} rotulo="Cartões amarelos" valor={resumo.totalAmarelos} cor="text-amber-300" />
        <Indicador icone={ShieldAlert} rotulo="Cartões vermelhos" valor={resumo.totalVermelhos} cor="text-rose-300" />
      </div>

      {resumo.artilheiro ? (
        <Cartao className="flex items-center gap-4 border-neon-400/30 bg-gradient-to-r from-neon-400/10 to-transparent p-4">
          <Flame className="size-7 shrink-0 text-neon-400" />
          <div className="min-w-0 flex-1">
            <Etiqueta tom="neon">Artilheiro do campeonato</Etiqueta>
            <p className="mt-1 truncate text-lg font-bold text-white">{resumo.artilheiro.participante.nome}</p>
            <p className="truncate text-xs text-slate-400">
              {buscarTime(resumo.artilheiro.participante.timeId).nome} · {resumo.artilheiro.jogos} jogo(s)
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="texto-neon font-display text-3xl font-black text-neon-300">{resumo.artilheiro.gols}</p>
            <p className="text-[10px] tracking-wider text-slate-400 uppercase">gols</p>
          </div>
        </Cartao>
      ) : null}

      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          icone={Trophy}
          titulo="Artilharia"
          descricao="Gols marcados somando chave principal e repescagem."
        />
        {artilharia.length ? (
          <ol className="space-y-2">
            {artilharia.map((linha, posicao) => (
              <LinhaArtilharia key={linha.participante.id} linha={linha} posicao={posicao} />
            ))}
          </ol>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">Nenhum jogo finalizado até agora.</p>
        )}
      </Cartao>

      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          icone={ShieldAlert}
          titulo="Disciplina · cartões"
          descricao={`${LIMITE_AMARELOS} amarelos acumulados ou 1 vermelho geram suspensão para o jogo seguinte.`}
        />
        <div className="scrollbar-fina -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="text-[10px] tracking-wider text-slate-500 uppercase">
                <th className="pb-2 text-left font-semibold">Participante</th>
                <th className="hidden pb-2 text-center font-semibold sm:table-cell">Jogos</th>
                <th className="pb-2 text-center font-semibold">Amarelos</th>
                <th className="pb-2 text-center font-semibold">Vermelhos</th>
                <th className="pb-2 text-right font-semibold">Situação</th>
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

      <Cartao className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-slate-400">
        <span className="inline-flex items-center gap-2">
          <Users className="size-4 text-royal-300" />
          {estatisticas.length} participantes inscritos
        </span>
        <span>
          {resumo.totalPartidas} jogo(s) finalizado(s) · {resumo.decisoesNosPenaltis} decidido(s) nos pênaltis
        </span>
      </Cartao>
    </div>
  )
}
