import { useMemo, useRef, useState } from 'react'
import { Check, Download, Link2, Upload } from 'lucide-react'
import { formatarHorario } from '../lib/persistencia.js'
import { Botao, BotaoTexto, Cartao, Etiqueta, TituloSecao } from './ui.jsx'
import { ModalConfirmacao } from './ModalConfirmacao.jsx'
import { GerenciadorDeTimes } from './GerenciadorDeTimes.jsx'
import { BarraDoOrganizador, Destravar } from './Destravar.jsx'
import { QrInscricao } from './QrInscricao.jsx'
import { SorteioDeTimes } from './SorteioDeTimes.jsx'
import { ListaDeInscritos } from './ListaDeInscritos.jsx'

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
    <div className="space-y-5">
      {grupos.map((grupo) => (
        <div key={grupo.chave}>
          <div className="mb-2 flex items-center gap-2 border-b-2 border-tinta pb-2">
            <h4 className="text-lg">{grupo.titulo}</h4>
            {grupo.repescagem ? <Etiqueta cor="laranja">Repescagem</Etiqueta> : null}
          </div>

          <ul className="space-y-1">
            {grupo.partidas.map((partida) => {
              const disponivel = partida.editavel
              return (
                <li key={partida.id}>
                  <button
                    type="button"
                    disabled={!disponivel}
                    onClick={() => aoEditarPartida(partida)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border-2 px-2.5 py-2 text-left transition-colors ${
                      disponivel
                        ? 'border-transparent hover:border-tinta hover:bg-papel-claro'
                        : 'cursor-not-allowed border-transparent opacity-40'
                    }`}
                  >
                    <span className="num w-4 shrink-0 font-display text-[11px] text-tinta-fraca">{partida.numero}</span>

                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                      {partida.a?.nome ?? <span className="text-tinta-fraca">a definir</span>}
                    </span>

                    <span
                      className={`num contorno shrink-0 rounded-md px-2 py-0.5 font-display text-[13px] ${
                        partida.resultado ? 'bg-lima text-carvao' : 'border-dashed bg-transparent text-tinta-fraca'
                      }`}
                    >
                      {partida.resultado
                        ? `${partida.resultado.golsA} - ${partida.resultado.golsB}`
                        : partida.status === 'bye'
                          ? 'bye'
                          : '– – –'}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-right text-[13px] font-medium">
                      {partida.b?.nome ?? <span className="text-tinta-fraca">a definir</span>}
                    </span>

                    <span className="hidden w-16 shrink-0 text-right sm:block">
                      {partida.status === 'pronta' ? (
                        <span className="rotulo text-[9px] text-laranja">Lançar</span>
                      ) : partida.status === 'finalizada' ? (
                        <span className="rotulo text-[9px] text-tinta-fraca">Ok</span>
                      ) : null}
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
      mostrar(`Backup restaurado: ${total} jogadores.`)
    } catch (erro) {
      mostrar(erro.message || 'Não deu pra ler o arquivo.', true)
    }
  }

  return (
    <Cartao className="p-4 sm:p-6">
      <TituloSecao
        className="mb-5"
        titulo="Backup"
        descricao="Tudo é salvo sozinho neste navegador e aguenta atualizar a página. O arquivo de backup protege contra limpar o cache ou trocar de celular."
      />

      <div
        className={`contorno mb-4 flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${
          salvamento.falhou ? 'bg-rosa text-white' : 'bg-lima text-carvao'
        }`}
      >
        <span
          className={`size-2 shrink-0 rounded-full border-2 ${
            salvamento.falhou ? 'border-white bg-white' : 'animar-piscar border-carvao bg-carvao'
          }`}
        />
        <p className="text-[12px] font-bold">
          {salvamento.falhou
            ? 'O navegador bloqueou o armazenamento (aba anônima?). Baixe um backup antes de fechar.'
            : `Salvo automaticamente${salvamento.em ? ` · ${formatarHorario(salvamento.em)}` : ''}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Botao variante="papel" icone={Download} onClick={acoes.exportarBackup} disabled={!temDados}>
          Baixar backup
        </Botao>
        <Botao variante="papel" icone={Upload} onClick={() => inputArquivo.current?.click()}>
          Restaurar backup
        </Botao>
        <Botao
          variante="cobalto"
          icone={Link2}
          disabled={!temDados}
          onClick={async () => {
            const copiou = await acoes.copiarLink()
            mostrar(copiou ? 'Link copiado! Cola no grupo do acampamento.' : 'Não deu pra copiar o link.', !copiou)
          }}
        >
          Copiar link do placar
        </Botao>
        <input ref={inputArquivo} type="file" accept="application/json,.json" onChange={importar} className="hidden" />
      </div>

      {aviso ? (
        <p
          className={`contorno mt-3 inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-bold ${
            aviso.erro ? 'bg-rosa text-white' : 'bg-lima text-carvao'
          }`}
        >
          {aviso.erro ? null : <Check className="size-3.5" strokeWidth={3} />}
          {aviso.texto}
        </p>
      ) : null}

      <p className="mt-4 max-w-2xl text-[12px] leading-snug text-tinta-media">
        O link do placar leva uma cópia dos resultados dentro do próprio endereço — quem abrir vê o campeonato como
        está agora, só pra olhar. Gere um link novo depois de lançar mais jogos.
      </p>
    </Cartao>
  )
}

/* -------------------------------------------------------------------------- */
/* Painel                                                                     */
/* -------------------------------------------------------------------------- */

export function PainelAdmin({
  participantes,
  elenco = [],
  torneio,
  acoes,
  aoEditarPartida,
  salvamento,
  timesDoUsuario = [],
  nuvem,
  destravado,
}) {
  const [confirmacao, setConfirmacao] = useState(null)
  const podeSortear = participantes.length >= 4

  const pedir = (config) => setConfirmacao(config)

  // Com a nuvem ligada, o painel só abre para quem tem o PIN.
  if (nuvem?.configurada && !destravado) {
    return <Destravar aoDestravar={acoes.destravar} />
  }

  return (
    <div className="space-y-5">
      {nuvem?.configurada ? (
        <BarraDoOrganizador nuvem={nuvem} aoTravar={acoes.travar} aoTrocarPin={acoes.alterarPin} />
      ) : null}
      <ModalConfirmacao
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.titulo ?? ''}
        descricao={confirmacao?.descricao ?? ''}
        textoConfirmar={confirmacao?.textoConfirmar}
        variante={confirmacao?.variante}
        aoConfirmar={confirmacao?.acao ?? (() => {})}
        aoFechar={() => setConfirmacao(null)}
      />

      {nuvem?.configurada ? <QrInscricao torneio={torneio} /> : null}

      <ListaDeInscritos
        participantes={participantes}
        torneio={torneio}
        acoes={acoes}
        aoPedirConfirmacao={pedir}
      />

      {participantes.length ? (
        <SorteioDeTimes
          participantes={participantes}
          elenco={elenco}
          acoes={acoes}
          aoPedirConfirmacao={pedir}
        />
      ) : null}

      <GerenciadorDeTimes acoes={acoes} totalDeAjustes={timesDoUsuario.length} />

      {/* Sorteio */}
      <Cartao cor={podeSortear && !torneio.ativo ? 'cobalto' : 'papel'} className="p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className={`text-2xl sm:text-[28px] ${podeSortear && !torneio.ativo ? 'text-white' : ''}`}>Sorteio</h2>
            <p
              className={`mt-2 max-w-lg text-[14px] leading-snug ${
                podeSortear && !torneio.ativo ? 'text-white/80' : 'text-tinta-media'
              }`}
            >
              {podeSortear
                ? 'Embaralha todo mundo e monta a chave principal + a repescagem de uma vez.'
                : 'Cadastre pelo menos 4 jogadores pra poder sortear.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Botao
              disabled={!podeSortear}
              onClick={() =>
                torneio.ativo
                  ? pedir({
                      titulo: 'Sortear de novo?',
                      descricao: 'Um sorteio novo embaralha os confrontos e apaga todos os placares já lançados.',
                      textoConfirmar: 'Pode sortear',
                      acao: acoes.sortear,
                    })
                  : acoes.sortear()
              }
            >
              {torneio.ativo ? 'Sortear de novo' : 'Sortear as chaves'}
            </Botao>

            {torneio.ativo ? (
              <Botao
                variante="papel"
                onClick={() =>
                  pedir({
                    titulo: 'Zerar os placares?',
                    descricao: 'Os confrontos continuam iguais, mas todos os resultados voltam a ficar em aberto.',
                    textoConfirmar: 'Zerar',
                    acao: acoes.zerarResultados,
                  })
                }
              >
                Zerar placares
              </Botao>
            ) : null}
          </div>
        </div>
      </Cartao>

      {/* Resultados */}
      <Cartao className="p-4 sm:p-6">
        <TituloSecao
          className="mb-5"
          titulo="Lançar placares"
          descricao="Toque num jogo liberado pra registrar gols, cartões e pênaltis."
          acao={
            <div className="contorno shrink-0 rounded-lg bg-papel-escuro px-3 py-2 text-center">
              <p className="num font-display text-2xl leading-none">
                {torneio.partidasFinalizadas}
                <span className="text-tinta-media">/{torneio.totalPartidas}</span>
              </p>
              <p className="rotulo mt-1 text-[9px]">Lançados</p>
            </div>
          }
        />
        {torneio.ativo ? (
          <ListaDeJogos torneio={torneio} aoEditarPartida={aoEditarPartida} />
        ) : (
          <p className="contorno rounded-lg border-dashed px-4 py-8 text-center text-[13px] text-tinta-media">
            Faça o sorteio pra liberar os jogos.
          </p>
        )}
      </Cartao>

      <BlocoDados acoes={acoes} salvamento={salvamento} temDados={participantes.length > 0} />

      {/* Recomeçar */}
      <Cartao className="p-4 sm:p-6">
        <TituloSecao className="mb-5" titulo="Recomeçar" descricao="Cuidado: daqui pra baixo, apaga coisa." />
        <div className="flex flex-wrap items-center gap-2.5">
          <BotaoTexto
            onClick={() =>
              pedir({
                titulo: 'Voltar pros dados de exemplo?',
                descricao: 'O campeonato atual será trocado pelos 16 jogadores de demonstração.',
                textoConfirmar: 'Restaurar',
                variante: 'cobalto',
                acao: acoes.restaurarExemplo,
              })
            }
          >
            Dados de exemplo
          </BotaoTexto>

          <BotaoTexto
            disabled={!torneio.ativo}
            onClick={() =>
              pedir({
                titulo: 'Desfazer o chaveamento?',
                descricao: 'O sorteio e os placares somem. A lista de jogadores continua.',
                textoConfirmar: 'Desfazer',
                acao: acoes.desfazerChaveamento,
              })
            }
          >
            Desfazer chaveamento
          </BotaoTexto>

          <Botao
            variante="perigo"
            onClick={() =>
              pedir({
                titulo: 'Apagar tudo mesmo?',
                descricao:
                  'Jogadores, sorteio e placares somem deste navegador. Baixe um backup antes se quiser poder voltar atrás.',
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
