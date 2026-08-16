import { useMemo, useState } from 'react'
import {
  Dices,
  ListOrdered,
  Pencil,
  RotateCcw,
  Sparkles,
  Trash2,
  TriangleAlert,
  UserPlus,
  Users,
} from 'lucide-react'
import { LIGAS, TIMES, buscarTime } from '../data/times.js'
import { Botao, Cartao, EscudoTime, Etiqueta, TituloSecao } from './ui.jsx'
import { ModalConfirmacao } from './ModalConfirmacao.jsx'

/* -------------------------------------------------------------------------- */
/* Cadastro de participantes                                                  */
/* -------------------------------------------------------------------------- */

function FormularioParticipante({ aoCadastrar }) {
  const [nome, setNome] = useState('')
  const [timeId, setTimeId] = useState(TIMES[0].id)

  const enviar = (evento) => {
    evento.preventDefault()
    if (!nome.trim()) return
    aoCadastrar({ nome, timeId })
    setNome('')
  }

  return (
    <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Nome do participante
        </span>
        <input
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Ex.: João Victor"
          maxLength={40}
          className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-neon-400/50 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Time no FIFA
        </span>
        <div className="flex items-center gap-2">
          <EscudoTime timeId={timeId} tamanho="md" />
          <select
            value={timeId}
            onChange={(evento) => setTimeId(evento.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2.5 text-sm text-white focus:border-neon-400/50 focus:outline-none"
          >
            {LIGAS.map((liga) => (
              <optgroup key={liga} label={liga} className="bg-navy-900">
                {TIMES.filter((time) => time.liga === liga).map((time) => (
                  <option key={time.id} value={time.id} className="bg-navy-900">
                    {time.nome}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </label>

      <div className="flex items-end">
        <Botao type="submit" icone={UserPlus} className="w-full sm:w-auto" disabled={!nome.trim()}>
          Cadastrar
        </Botao>
      </div>
    </form>
  )
}

function LinhaParticipante({ participante, indice, aoAtualizar, aoRemover }) {
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(participante.nome)
  const [timeId, setTimeId] = useState(participante.timeId)

  const salvar = () => {
    if (nome.trim()) aoAtualizar(participante.id, { nome: nome.trim(), timeId })
    setEditando(false)
  }

  if (editando) {
    return (
      <li className="rounded-xl border border-neon-400/30 bg-neon-400/[0.05] p-2.5">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            className="rounded-lg border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white focus:border-neon-400/50 focus:outline-none"
          />
          <select
            value={timeId}
            onChange={(evento) => setTimeId(evento.target.value)}
            className="rounded-lg border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white focus:border-neon-400/50 focus:outline-none"
          >
            {TIMES.map((time) => (
              <option key={time.id} value={time.id} className="bg-navy-900">
                {time.nome}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Botao variante="primario" onClick={salvar} className="flex-1 px-3 py-2">
              Salvar
            </Botao>
            <Botao variante="fantasma" onClick={() => setEditando(false)} className="px-3 py-2">
              Cancelar
            </Botao>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
      <span className="w-5 shrink-0 text-center font-display text-xs font-bold text-slate-600">{indice + 1}</span>
      <EscudoTime timeId={participante.timeId} tamanho="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{participante.nome}</p>
        <p className="truncate text-[11px] text-slate-500">{buscarTime(participante.timeId).nome}</p>
      </div>
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label={`Editar ${participante.nome}`}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => aoRemover(participante)}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
        aria-label={`Remover ${participante.nome}`}
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  )
}

/* -------------------------------------------------------------------------- */
/* Lista de jogos para lançamento rápido                                      */
/* -------------------------------------------------------------------------- */

function ListaDeJogos({ torneio, aoEditarPartida }) {
  const grupos = useMemo(() => {
    const rodadas = [...torneio.principal, ...torneio.repescagem]
    return rodadas.map((rodada) => ({
      chave: `${rodada.chave}-${rodada.rodada}`,
      titulo: rodada.nome,
      repescagem: rodada.chave === 'rep',
      partidas: rodada.partidas,
    }))
  }, [torneio])

  return (
    <div className="space-y-4">
      {grupos.map((grupo) => (
        <div key={grupo.chave}>
          <div className="mb-2 flex items-center gap-2">
            <h4
              className={`font-display text-[11px] font-bold tracking-widest uppercase ${
                grupo.repescagem ? 'text-amber-300' : 'text-royal-300'
              }`}
            >
              {grupo.titulo}
            </h4>
            {grupo.repescagem ? <Etiqueta tom="amarelo">Repescagem</Etiqueta> : null}
          </div>

          <ul className="space-y-1.5">
            {grupo.partidas.map((partida) => {
              const disponivel = partida.editavel
              return (
                <li key={partida.id}>
                  <button
                    type="button"
                    disabled={!disponivel}
                    onClick={() => aoEditarPartida(partida)}
                    className={`flex w-full items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                      disponivel
                        ? 'cursor-pointer border-white/10 bg-white/[0.02] hover:border-neon-400/40 hover:bg-white/[0.06]'
                        : 'cursor-not-allowed border-dashed border-white/10 bg-transparent opacity-50'
                    }`}
                  >
                    <span className="w-6 shrink-0 text-center font-display text-[11px] font-bold text-slate-600">
                      {partida.numero}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                      {partida.a?.nome ?? <span className="text-slate-500 italic">A definir</span>}
                    </span>

                    <span className="shrink-0 rounded-lg bg-navy-950/70 px-2 py-1 font-display text-xs font-bold text-white">
                      {partida.resultado ? `${partida.resultado.golsA} × ${partida.resultado.golsB}` : '– × –'}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-right text-sm text-slate-200">
                      {partida.b?.nome ?? <span className="text-slate-500 italic">A definir</span>}
                    </span>

                    <span className="hidden shrink-0 sm:block">
                      {partida.status === 'finalizada' ? (
                        <Etiqueta tom="neon">Ok</Etiqueta>
                      ) : partida.status === 'pronta' ? (
                        <Etiqueta tom="ouro">Lançar</Etiqueta>
                      ) : (
                        <Etiqueta tom="neutro">—</Etiqueta>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Painel                                                                     */
/* -------------------------------------------------------------------------- */

export function PainelAdmin({ participantes, torneio, acoes, aoEditarPartida }) {
  const [confirmacao, setConfirmacao] = useState(null)

  const podeSortear = participantes.length >= 4
  const chaveamentoAtivo = torneio.ativo

  const pedirConfirmacao = (config) => setConfirmacao(config)

  return (
    <div className="space-y-5">
      <ModalConfirmacao
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.titulo ?? ''}
        descricao={confirmacao?.descricao ?? ''}
        textoConfirmar={confirmacao?.textoConfirmar}
        variante={confirmacao?.variante}
        aoConfirmar={confirmacao?.acao ?? (() => {})}
        aoFechar={() => setConfirmacao(null)}
      />

      {/* Cadastro ------------------------------------------------------- */}
      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          icone={Users}
          titulo="Participantes"
          descricao="Cadastre cada jovem e o time que ele vai usar no FIFA."
          acao={<Etiqueta tom={podeSortear ? 'neon' : 'amarelo'}>{participantes.length} inscritos</Etiqueta>}
        />

        <FormularioParticipante aoCadastrar={acoes.adicionarParticipante} />

        {participantes.length ? (
          <ul className="mt-4 grid gap-1.5 lg:grid-cols-2">
            {participantes.map((participante, indice) => (
              <LinhaParticipante
                key={participante.id}
                participante={participante}
                indice={indice}
                aoAtualizar={acoes.atualizarParticipante}
                aoRemover={(alvo) =>
                  pedirConfirmacao({
                    titulo: `Remover ${alvo.nome}?`,
                    descricao: torneio.ativo
                      ? 'Esse participante já está no chaveamento. Removê-lo apaga o sorteio e todos os resultados lançados.'
                      : 'O participante será excluído da lista de inscritos.',
                    textoConfirmar: 'Remover',
                    acao: () => acoes.removerParticipante(alvo.id),
                  })
                }
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
            Nenhum participante cadastrado ainda.
          </p>
        )}
      </Cartao>

      {/* Sorteio -------------------------------------------------------- */}
      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          icone={Dices}
          titulo="Sorteio dos confrontos"
          descricao="Gera as chaves do mata-mata e a repescagem automaticamente."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Botao
            variante="roxo"
            icone={Dices}
            disabled={!podeSortear}
            onClick={() =>
              chaveamentoAtivo
                ? pedirConfirmacao({
                    titulo: 'Sortear novamente?',
                    descricao: 'Um novo sorteio embaralha todos os confrontos e apaga os resultados já lançados.',
                    textoConfirmar: 'Sortear de novo',
                    acao: acoes.sortear,
                  })
                : acoes.sortear()
            }
          >
            {chaveamentoAtivo ? 'Sortear novamente' : 'Sortear e gerar confrontos'}
          </Botao>

          {chaveamentoAtivo ? (
            <Botao
              variante="contorno"
              icone={RotateCcw}
              onClick={() =>
                pedirConfirmacao({
                  titulo: 'Zerar todos os placares?',
                  descricao: 'Os confrontos sorteados continuam, mas todos os resultados voltam a ficar em aberto.',
                  textoConfirmar: 'Zerar placares',
                  acao: acoes.zerarResultados,
                })
              }
            >
              Zerar placares
            </Botao>
          ) : null}
        </div>

        {!podeSortear ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-amber-300">
            <TriangleAlert className="size-4 shrink-0" />
            Cadastre pelo menos 4 participantes para sortear as chaves.
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Com {participantes.length} inscritos, o chaveamento terá {torneio.principal.length || '—'} fases na chave
            principal. Números fora da potência de 2 recebem classificação direta (bye) na primeira fase.
          </p>
        )}
      </Cartao>

      {/* Lançamento de resultados --------------------------------------- */}
      <Cartao className="p-4 sm:p-5">
        <TituloSecao
          icone={ListOrdered}
          titulo="Lançar resultados"
          descricao="Clique em um jogo liberado para registrar placar, cartões e pênaltis."
          acao={
            <Etiqueta tom="neon">
              {torneio.partidasFinalizadas}/{torneio.totalPartidas} jogos
            </Etiqueta>
          }
        />

        {chaveamentoAtivo ? (
          <ListaDeJogos torneio={torneio} aoEditarPartida={aoEditarPartida} />
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
            Faça o sorteio para liberar os jogos.
          </p>
        )}
      </Cartao>

      {/* Zona de risco --------------------------------------------------- */}
      <Cartao className="border-rose-500/20 p-4 sm:p-5">
        <TituloSecao icone={TriangleAlert} titulo="Zona de risco" descricao="Ações que apagam dados do campeonato." />
        <div className="flex flex-wrap gap-2">
          <Botao
            variante="contorno"
            icone={Sparkles}
            onClick={() =>
              pedirConfirmacao({
                titulo: 'Restaurar dados de exemplo?',
                descricao: 'O campeonato atual será substituído pelos 16 participantes fictícios de demonstração.',
                textoConfirmar: 'Restaurar exemplo',
                variante: 'roxo',
                acao: acoes.restaurarExemplo,
              })
            }
          >
            Restaurar exemplo
          </Botao>

          <Botao
            variante="contorno"
            icone={RotateCcw}
            disabled={!chaveamentoAtivo}
            onClick={() =>
              pedirConfirmacao({
                titulo: 'Desfazer o chaveamento?',
                descricao: 'O sorteio e os resultados são apagados. A lista de participantes é mantida.',
                textoConfirmar: 'Desfazer chaveamento',
                acao: acoes.desfazerChaveamento,
              })
            }
          >
            Desfazer chaveamento
          </Botao>

          <Botao
            variante="perigo"
            icone={Trash2}
            onClick={() =>
              pedirConfirmacao({
                titulo: 'Apagar tudo?',
                descricao: 'Participantes, sorteio e resultados serão removidos definitivamente deste navegador.',
                textoConfirmar: 'Apagar tudo',
                acao: acoes.limparTudo,
              })
            }
          >
            Apagar tudo
          </Botao>
        </div>
      </Cartao>
    </div>
  )
}
