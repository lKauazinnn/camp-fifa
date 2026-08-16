import { LIMITE_AMARELOS, situacaoDisciplinar } from '../lib/estatisticas.js'
import { buscarTime } from '../data/times.js'
import { Cartao, EscudoTime, EstadoVazio, Etiqueta, Metrica, TituloSecao } from './ui.jsx'

const COR_SITUACAO = { vermelho: 'rosa', amarelo: 'rosa', atencao: 'laranja', ok: 'papel' }

function LinhaArtilharia({ linha, posicao }) {
  const lider = posicao === 0 && linha.gols > 0
  return (
    <tr className="border-t-2 border-papel-escuro">
      <td className="py-2.5 pr-3">
        <span
          className={`grid size-7 place-items-center rounded-md font-display text-[13px] ${
            lider ? 'contorno bg-lima' : 'text-tinta-fraca'
          }`}
        >
          {posicao + 1}
        </span>
      </td>
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2.5">
          <EscudoTime timeId={linha.participante.timeId} tamanho="sm" />
          <div className="min-w-0">
            <p className={`truncate text-[13px] ${lider ? 'font-bold' : ''}`}>{linha.participante.nome}</p>
            <p className="truncate text-[11px] text-tinta-fraca">{buscarTime(linha.participante.timeId).nome}</p>
          </div>
        </div>
      </td>
      <td className="num hidden py-2.5 text-center text-[13px] text-tinta-media sm:table-cell">{linha.jogos}</td>
      <td className="num hidden py-2.5 text-center text-[13px] text-tinta-media sm:table-cell">{linha.vitorias}</td>
      <td className="num hidden py-2.5 text-center text-[13px] text-tinta-media md:table-cell">
        {linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}
      </td>
      <td className="py-2.5 pl-3 text-right">
        <span
          className={`num inline-grid min-w-9 place-items-center rounded-md px-1.5 py-0.5 font-display text-[17px] ${
            lider ? 'contorno bg-lima' : ''
          }`}
        >
          {linha.gols}
        </span>
      </td>
    </tr>
  )
}

function LinhaDisciplina({ linha }) {
  const situacao = situacaoDisciplinar(linha)
  return (
    <tr className="border-t-2 border-papel-escuro">
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2.5">
          <EscudoTime timeId={linha.participante.timeId} tamanho="sm" />
          <p className="truncate text-[13px]">{linha.participante.nome}</p>
        </div>
      </td>
      <td className="num py-2.5 text-center text-[13px] text-tinta-media">{linha.jogos}</td>
      <td className="py-2.5 text-center">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-2.5 rounded-[2px] border-2 border-tinta bg-[#ffd400]" />
          <span className="num text-[13px] font-bold">{linha.amarelos}</span>
        </span>
      </td>
      <td className="py-2.5 text-center">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-2.5 rounded-[2px] border-2 border-tinta bg-rosa" />
          <span className="num text-[13px] font-bold">{linha.vermelhos}</span>
        </span>
      </td>
      <td className="py-2.5 pl-3 text-right">
        <Etiqueta cor={COR_SITUACAO[situacao.tom]}>{situacao.rotulo}</Etiqueta>
      </td>
    </tr>
  )
}

export function Estatisticas({ estatisticas, resumo }) {
  const comJogos = estatisticas.filter((linha) => linha.jogos > 0)

  if (!comJogos.length) {
    return (
      <EstadoVazio
        titulo="Nada pra mostrar ainda"
        descricao="Assim que o primeiro placar for lançado, artilharia e cartões aparecem aqui."
      />
    )
  }

  const disciplina = [...comJogos].sort(
    (a, b) =>
      b.vermelhos - a.vermelhos || b.amarelos - a.amarelos || a.participante.nome.localeCompare(b.participante.nome),
  )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cartao cor="lima" className="p-4">
          <Metrica valor={resumo.totalGols} rotulo="Gols no campeonato" />
        </Cartao>
        <Cartao className="p-4">
          <Metrica valor={resumo.mediaGols} rotulo="Média por jogo" />
        </Cartao>
        <Cartao className="p-4">
          <Metrica valor={resumo.totalAmarelos} rotulo="Cartões amarelos" />
        </Cartao>
        <Cartao className="p-4">
          <Metrica valor={resumo.totalVermelhos} rotulo="Cartões vermelhos" />
        </Cartao>
      </div>

      {resumo.artilheiro ? (
        <div className="contorno sombra-g relative overflow-hidden rounded-xl bg-lima px-5 py-5 sm:px-6">
          <div className="relative flex items-center gap-4">
            <EscudoTime timeId={resumo.artilheiro.participante.timeId} tamanho="lg" />
            <div className="min-w-0 flex-1">
              <span className="contorno rotulo inline-block rounded-md bg-tinta px-2 py-1 text-[10px] text-papel-claro">
                Artilheiro
              </span>
              <p className="mt-2.5 truncate font-display text-3xl leading-none uppercase">
                {resumo.artilheiro.participante.nome}
              </p>
              <p className="mt-2 truncate text-[12px] font-medium text-tinta-media">
                {buscarTime(resumo.artilheiro.participante.timeId).nome} · {resumo.artilheiro.jogos} jogos
              </p>
            </div>
            <div className="shrink-0 text-center">
              <p className="num font-display text-6xl leading-none">{resumo.artilheiro.gols}</p>
              <p className="rotulo mt-1 text-[9px] text-tinta-media">Gols</p>
            </div>
          </div>
        </div>
      ) : null}

      <Cartao className="p-4 sm:p-6">
        <TituloSecao className="mb-5" titulo="Artilharia" descricao="Gols na chave principal e na repescagem." />
        <div className="scrollbar-fina -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[380px] border-collapse text-left">
            <thead>
              <tr className="rotulo text-[9px] text-tinta-media">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">Jogador</th>
                <th className="hidden pb-2 text-center sm:table-cell">Jogos</th>
                <th className="hidden pb-2 text-center sm:table-cell">Vit.</th>
                <th className="hidden pb-2 text-center md:table-cell">Saldo</th>
                <th className="pb-2 pl-3 text-right">Gols</th>
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

      <Cartao className="p-4 sm:p-6">
        <TituloSecao
          className="mb-5"
          titulo="Cartões"
          descricao={`${LIMITE_AMARELOS} amarelos acumulados ou 1 vermelho = suspensão no jogo seguinte.`}
        />
        <div className="scrollbar-fina -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[440px] border-collapse text-left">
            <thead>
              <tr className="rotulo text-[9px] text-tinta-media">
                <th className="pb-2 pr-3">Jogador</th>
                <th className="pb-2 text-center">Jogos</th>
                <th className="pb-2 text-center">Amarelos</th>
                <th className="pb-2 text-center">Vermelhos</th>
                <th className="pb-2 pl-3 text-right">Situação</th>
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

      <p className="px-1 text-[12px] font-medium text-tinta-media">
        {resumo.totalPartidas} jogos finalizados · {resumo.decisoesNosPenaltis} decididos nos pênaltis ·{' '}
        {estatisticas.length} inscritos
      </p>
    </div>
  )
}
