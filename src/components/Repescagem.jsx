import { buscarTime } from '../data/times.js'
import { ChaveVisual } from './ChaveVisual.jsx'
import { Cartao, EscudoTime, EstadoVazio, TituloSecao } from './ui.jsx'

export function Repescagem({ torneio, aoEditarPartida, somenteLeitura }) {
  if (!torneio.ativo || !torneio.repescagem.length) {
    return (
      <EstadoVazio
        titulo="Repescagem ainda não existe"
        descricao="A chave dos eliminados nasce junto com o sorteio da primeira fase."
      />
    )
  }

  const decisao = torneio.repescagem.at(-1)?.partidas[0] ?? null
  const disputados = torneio.repescagem.reduce(
    (total, rodada) => total + rodada.partidas.filter((partida) => partida.status === 'finalizada').length,
    0,
  )
  const totais = torneio.repescagem.reduce(
    (total, rodada) =>
      total + rodada.partidas.filter((partida) => partida.status !== 'vazia' && partida.status !== 'bye').length,
    0,
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        <Cartao className="p-5 sm:p-6">
          <h2 className="text-3xl">
            Ninguém sai fora
            <br />
            <span className="marcado">com um jogo só</span>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-snug text-tinta-media">
            Perdeu na primeira fase? Você cai automaticamente aqui e continua jogando. Quem ganhar tudo nesta chave
            termina o campeonato em <strong className="text-tinta">terceiro lugar</strong> — e ainda leva medalha.
          </p>
        </Cartao>

        <Cartao cor={torneio.terceiro ? 'laranja' : 'papel'} className="p-5">
          <p className={`rotulo text-[10px] ${torneio.terceiro ? 'text-white/80' : 'text-tinta-media'}`}>
            Terceiro lugar
          </p>
          {torneio.terceiro ? (
            <div className="mt-3 flex items-center gap-3">
              <EscudoTime timeId={torneio.terceiro.timeId} tamanho="md" />
              <div className="min-w-0">
                <p className="truncate font-display text-xl leading-tight text-white uppercase">
                  {torneio.terceiro.nome}
                </p>
                <p className="mt-1 truncate text-[11px] text-white/75">{buscarTime(torneio.terceiro.timeId).nome}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[13px] leading-snug text-tinta-media">
              {decisao ? 'Sai na última rodada da repescagem.' : 'Ainda vai demorar.'}
            </p>
          )}
        </Cartao>
      </div>

      <Cartao className="p-4 sm:p-6">
        <TituloSecao
          className="mb-6"
          titulo="Chave da repescagem"
          descricao={somenteLeitura ? null : 'Toque num jogo pra lançar o placar.'}
          acao={
            <div className="contorno shrink-0 rounded-lg bg-papel-escuro px-3 py-2 text-center">
              <p className="num font-display text-2xl leading-none">
                {disputados}
                <span className="text-tinta-media">/{totais}</span>
              </p>
              <p className="rotulo mt-1 text-[9px]">Jogos</p>
            </div>
          }
        />
        <ChaveVisual rodadas={torneio.repescagem} aoEditar={aoEditarPartida} />
      </Cartao>
    </div>
  )
}
