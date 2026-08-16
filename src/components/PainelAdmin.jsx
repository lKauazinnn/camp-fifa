import { useMemo, useRef, useState } from 'react'
import { Check, Download, Link2, Pencil, Trash2, Upload } from 'lucide-react'
import { LIGAS, TIMES, buscarTime } from '../data/times.js'
import { formatarHorario } from '../lib/persistencia.js'
import { Botao, Cartao, EscudoTime, Etiqueta, TituloSecao } from './ui.jsx'
import { ModalConfirmacao } from './ModalConfirmacao.jsx'

const CAMPO =
  'w-full rounded-xl border border-borda bg-fundo/60 px-3.5 py-2.5 text-[13px] text-perola-200 placeholder:text-perola-600 transition-colors focus:border-realce/40 focus:outline-none'

/* -------------------------------------------------------------------------- */
/* Cadastro                                                                   */
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
    <form onSubmit={enviar} className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
      <input
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Nome do participante"
        maxLength={40}
        className={CAMPO}
      />
      <div className="flex items-center gap-2.5">
        <EscudoTime timeId={timeId} tamanho="md" />
        <select value={timeId} onChange={(evento) => setTimeId(evento.target.value)} className={CAMPO}>
          {LIGAS.map((liga) => (
            <optgroup key={liga} label={liga}>
              {TIMES.filter((time) => time.liga === liga).map((time) => (
                <option key={time.id} value={time.id}>
                  {time.nome}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <Botao type="submit" disabled={!nome.trim()} className="sm:px-6">
        Adicionar
      </Botao>
    </form>
  )
}

function LinhaParticipante({ participante, indice, aoAtualizar, aoRemover }) {
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(participante.nome)
  const [timeId, setTimeId] = useState(participante.timeId)

  if (editando) {
    return (
      <li className="grid gap-2.5 rounded-xl border border-realce/25 bg-realce/[0.04] p-2.5 sm:grid-cols-[1fr_1fr_auto]">
        <input value={nome} onChange={(evento) => setNome(evento.target.value)} className={CAMPO} />
        <select value={timeId} onChange={(evento) => setTimeId(evento.target.value)} className={CAMPO}>
          {TIMES.map((time) => (
            <option key={time.id} value={time.id}>
              {time.nome}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Botao
            onClick={() => {
              if (nome.trim()) aoAtualizar(participante.id, { nome: nome.trim(), timeId })
              setEditando(false)
            }}
          >
            Salvar
          </Botao>
          <Botao variante="fantasma" onClick={() => setEditando(false)}>
            Cancelar
          </Botao>
        </div>
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 transition-colors hover:border-borda hover:bg-white/[0.02]">
      <span className="num w-5 shrink-0 text-right text-[11px] text-perola-600">{indice + 1}</span>
      <EscudoTime timeId={participante.timeId} tamanho="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-perola-200">{participante.nome}</p>
        <p className="truncate text-[11px] text-perola-600">{buscarTime(participante.timeId).nome}</p>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="grid size-8 place-items-center rounded-lg text-perola-500 transition-colors hover:bg-white/[0.06] hover:text-perola-100"
          aria-label={`Editar ${participante.nome}`}
        >
          <Pencil className="size-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => aoRemover(participante)}
          className="grid size-8 place-items-center rounded-lg text-perola-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          aria-label={`Remover ${participante.nome}`}
        >
          <Trash2 className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </li>
  )
}

/* -------------------------------------------------------------------------- */
/* Jogos                                                                      */
/* -------------------------------------------------------------------------- */

function ListaDeJogos({ torneio, aoEditarPartida }) {
  const grupos = useMemo(
    () =>
      [...torneio.principal, ...torneio.repescagem]
        .map((rodada) => ({
          chave: `${rodada.chave}-${rodada.rodada}`,
          titulo: rodada.nome,
          repescagem: rodada.chave === 'rep',
          partidas: rodada.partidas.filter((partida) => partida.status !== 'vazia'),
        }))
        .filter((grupo) => grupo.partidas.length),
    [torneio],
  )

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => (
        <div key={grupo.chave}>
          <div className="mb-2 flex items-center gap-2.5 border-b border-borda pb-2">
            <h4 className="font-serif text-[15px] leading-none text-perola-200">{grupo.titulo}</h4>
            {grupo.repescagem ? <Etiqueta tom="discreto">Repescagem</Etiqueta> : null}
          </div>

          <ul>
            {grupo.partidas.map((partida) => {
              const disponivel = partida.editavel
              return (
                <li key={partida.id}>
                  <button
                    type="button"
                    disabled={!disponivel}
                    onClick={() => aoEditarPartida(partida)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                      disponivel ? 'hover:bg-white/[0.04]' : 'cursor-not-allowed opacity-35'
                    }`}
                  >
                    <span className="num w-4 shrink-0 text-[11px] text-perola-600">{partida.numero}</span>

                    <span className="min-w-0 flex-1 truncate text-[13px] text-perola-300">
                      {partida.a?.nome ?? <span className="text-perola-600 italic">A definir</span>}
                    </span>

                    <span
                      className={`num shrink-0 font-serif text-[15px] ${
                        partida.resultado ? 'text-realce' : 'text-perola-600'
                      }`}
                    >
                      {partida.resultado
                        ? `${partida.resultado.golsA} · ${partida.resultado.golsB}`
                        : partida.status === 'bye'
                          ? '—'
                          : '– · –'}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-right text-[13px] text-perola-300">
                      {partida.b?.nome ?? <span className="text-perola-600 italic">A definir</span>}
                    </span>

                    <span className="hidden w-16 shrink-0 text-right sm:block">
                      {partida.status === 'finalizada' ? (
                        <span className="rotulo text-realce/70">Lançado</span>
                      ) : partida.status === 'pronta' ? (
                        <span className="rotulo text-amber-300/80">Lançar</span>
                      ) : (
                        <span className="rotulo">—</span>
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
/* Dados e backup                                                             */
/* -------------------------------------------------------------------------- */

function BlocoDados({ acoes, salvamento, temDados }) {
  const inputArquivo = useRef(null)
  const [aviso, setAviso] = useState(null)

  const mostrar = (texto, erro = false) => {
    setAviso({ texto, erro })
    window.setTimeout(() => setAviso(null), 4000)
  }

  const importar = async (evento) => {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    try {
      const total = await acoes.importarBackup(arquivo)
      mostrar(`Backup restaurado: ${total} participantes.`)
    } catch (erro) {
      mostrar(erro.message || 'Não foi possível ler o arquivo.', true)
    }
  }

  return (
    <Cartao className="p-5 sm:p-7">
      <TituloSecao
        className="mb-6"
        titulo="Dados e backup"
        descricao="Tudo é salvo automaticamente neste navegador e sobrevive a atualizar a página. O backup em arquivo protege contra limpeza de cache ou troca de aparelho."
      />

      <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-borda bg-fundo/50 px-4 py-3">
        {salvamento.falhou ? (
          <>
            <span className="size-1.5 shrink-0 rounded-full bg-rose-400" />
            <p className="text-[12px] text-rose-300">
              O navegador bloqueou o armazenamento (janela anônima?). Baixe um backup antes de fechar a página.
            </p>
          </>
        ) : (
          <>
            <span className="animar-respirar size-1.5 shrink-0 rounded-full bg-realce" />
            <p className="text-[12px] text-perola-500">
              Salvo automaticamente
              {salvamento.em ? <span className="text-perola-300"> · {formatarHorario(salvamento.em)}</span> : null}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Botao variante="contorno" icone={Download} onClick={acoes.exportarBackup} disabled={!temDados}>
          Baixar backup
        </Botao>
        <Botao variante="contorno" icone={Upload} onClick={() => inputArquivo.current?.click()}>
          Restaurar backup
        </Botao>
        <Botao
          variante="contorno"
          icone={Link2}
          disabled={!temDados}
          onClick={async () => {
            const copiou = await acoes.copiarLink()
            mostrar(copiou ? 'Link copiado — cole no grupo do acampamento.' : 'Não foi possível copiar o link.', !copiou)
          }}
        >
          Copiar link do placar
        </Botao>
        <input ref={inputArquivo} type="file" accept="application/json,.json" onChange={importar} className="hidden" />
      </div>

      {aviso ? (
        <p className={`mt-4 flex items-center gap-2 text-[12px] ${aviso.erro ? 'text-rose-300' : 'text-realce'}`}>
          {aviso.erro ? null : <Check className="size-3.5" strokeWidth={2} />}
          {aviso.texto}
        </p>
      ) : null}

      <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-perola-600">
        O link do placar carrega uma cópia dos resultados dentro do próprio endereço — quem abrir vê o campeonato como
        está agora, em modo somente leitura. Gere um link novo depois de lançar mais jogos.
      </p>
    </Cartao>
  )
}

/* -------------------------------------------------------------------------- */
/* Painel                                                                     */
/* -------------------------------------------------------------------------- */

export function PainelAdmin({ participantes, torneio, acoes, aoEditarPartida, salvamento }) {
  const [confirmacao, setConfirmacao] = useState(null)
  const podeSortear = participantes.length >= 4

  const pedir = (config) => setConfirmacao(config)

  return (
    <div className="space-y-6">
      <ModalConfirmacao
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.titulo ?? ''}
        descricao={confirmacao?.descricao ?? ''}
        textoConfirmar={confirmacao?.textoConfirmar}
        variante={confirmacao?.variante}
        aoConfirmar={confirmacao?.acao ?? (() => {})}
        aoFechar={() => setConfirmacao(null)}
      />

      {/* Participantes */}
      <Cartao className="p-5 sm:p-7">
        <TituloSecao
          className="mb-6"
          titulo="Participantes"
          descricao="Cadastre cada jovem e o time que ele vai usar no FIFA."
          acao={
            <div className="shrink-0 text-right">
              <p className="num font-serif text-2xl leading-none text-perola-100">{participantes.length}</p>
              <p className="rotulo mt-1.5">Inscritos</p>
            </div>
          }
        />

        <FormularioParticipante aoCadastrar={acoes.adicionarParticipante} />

        {participantes.length ? (
          <ul className="mt-5 grid gap-1 lg:grid-cols-2">
            {participantes.map((participante, indice) => (
              <LinhaParticipante
                key={participante.id}
                participante={participante}
                indice={indice}
                aoAtualizar={acoes.atualizarParticipante}
                aoRemover={(alvo) =>
                  pedir({
                    titulo: `Remover ${alvo.nome}?`,
                    descricao: torneio.ativo
                      ? 'Este participante já está no chaveamento. Removê-lo apaga o sorteio e os resultados lançados.'
                      : 'O participante será excluído da lista de inscritos.',
                    textoConfirmar: 'Remover',
                    acao: () => acoes.removerParticipante(alvo.id),
                  })
                }
              />
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-borda px-4 py-10 text-center text-[13px] text-perola-600">
            Nenhum participante cadastrado.
          </p>
        )}
      </Cartao>

      {/* Sorteio */}
      <Cartao className="p-5 sm:p-7">
        <TituloSecao
          className="mb-6"
          titulo="Sorteio"
          descricao={
            podeSortear
              ? 'Gera os confrontos da chave principal e a repescagem de uma vez.'
              : 'Cadastre pelo menos 4 participantes para sortear as chaves.'
          }
        />
        <div className="flex flex-wrap gap-2.5">
          <Botao
            disabled={!podeSortear}
            onClick={() =>
              torneio.ativo
                ? pedir({
                    titulo: 'Sortear novamente?',
                    descricao: 'Um novo sorteio embaralha os confrontos e apaga os resultados já lançados.',
                    textoConfirmar: 'Sortear de novo',
                    acao: acoes.sortear,
                  })
                : acoes.sortear()
            }
          >
            {torneio.ativo ? 'Sortear novamente' : 'Sortear confrontos'}
          </Botao>

          {torneio.ativo ? (
            <Botao
              variante="contorno"
              onClick={() =>
                pedir({
                  titulo: 'Zerar todos os placares?',
                  descricao: 'Os confrontos continuam, mas os resultados voltam a ficar em aberto.',
                  textoConfirmar: 'Zerar placares',
                  acao: acoes.zerarResultados,
                })
              }
            >
              Zerar placares
            </Botao>
          ) : null}
        </div>
      </Cartao>

      {/* Resultados */}
      <Cartao className="p-5 sm:p-7">
        <TituloSecao
          className="mb-6"
          titulo="Resultados"
          descricao="Clique em um jogo liberado para registrar placar, cartões e pênaltis."
          acao={
            <div className="shrink-0 text-right">
              <p className="num font-serif text-2xl leading-none text-perola-100">
                {torneio.partidasFinalizadas}
                <span className="text-perola-600">/{torneio.totalPartidas}</span>
              </p>
              <p className="rotulo mt-1.5">Lançados</p>
            </div>
          }
        />
        {torneio.ativo ? (
          <ListaDeJogos torneio={torneio} aoEditarPartida={aoEditarPartida} />
        ) : (
          <p className="rounded-xl border border-dashed border-borda px-4 py-10 text-center text-[13px] text-perola-600">
            Faça o sorteio para liberar os jogos.
          </p>
        )}
      </Cartao>

      <BlocoDados acoes={acoes} salvamento={salvamento} temDados={participantes.length > 0} />

      {/* Reinício */}
      <Cartao className="p-5 sm:p-7">
        <TituloSecao className="mb-6" titulo="Reiniciar" descricao="Ações que apagam dados do campeonato." />
        <div className="flex flex-wrap gap-2.5">
          <Botao
            variante="contorno"
            onClick={() =>
              pedir({
                titulo: 'Restaurar dados de exemplo?',
                descricao: 'O campeonato atual será substituído pelos 16 participantes de demonstração.',
                textoConfirmar: 'Restaurar',
                variante: 'primario',
                acao: acoes.restaurarExemplo,
              })
            }
          >
            Dados de exemplo
          </Botao>

          <Botao
            variante="contorno"
            disabled={!torneio.ativo}
            onClick={() =>
              pedir({
                titulo: 'Desfazer o chaveamento?',
                descricao: 'O sorteio e os resultados são apagados. A lista de participantes é mantida.',
                textoConfirmar: 'Desfazer',
                acao: acoes.desfazerChaveamento,
              })
            }
          >
            Desfazer chaveamento
          </Botao>

          <Botao
            variante="perigo"
            onClick={() =>
              pedir({
                titulo: 'Apagar tudo?',
                descricao:
                  'Participantes, sorteio e resultados serão removidos deste navegador. Baixe um backup antes se quiser poder voltar atrás.',
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
