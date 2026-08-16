import { useEffect, useState } from 'react'
import { ProvedorDeTimes } from './contexto/TimesContexto.jsx'
import { useTema } from './hooks/useTema.js'
import { useTorneio } from './hooks/useTorneio.js'
import { Cabecalho } from './components/Cabecalho.jsx'
import { Navegacao } from './components/Navegacao.jsx'
import { Chaveamento } from './components/Chaveamento.jsx'
import { Repescagem } from './components/Repescagem.jsx'
import { Estatisticas } from './components/Estatisticas.jsx'
import { Regras } from './components/Regras.jsx'
import { PainelAdmin } from './components/PainelAdmin.jsx'
import { ModalResultado } from './components/ModalResultado.jsx'
import { Inscricao } from './components/Inscricao.jsx'
import { Botao } from './components/ui.jsx'
import { nuvemConfigurada } from './lib/nuvem.js'

const ABAS = [
  { id: 'chaveamento', rotulo: 'Chaveamento', rotuloCurto: 'Chaves' },
  { id: 'repescagem', rotulo: 'Repescagem', rotuloCurto: 'Repescagem' },
  { id: 'estatisticas', rotulo: 'Estatísticas', rotuloCurto: 'Números' },
  { id: 'regras', rotulo: 'Regras', rotuloCurto: 'Regras' },
  { id: 'admin', rotulo: 'Painel Admin', rotuloCurto: 'Admin' },
]

function FaixaSomenteLeitura({ acoes }) {
  return (
    <div className="border-b-2 border-tinta bg-cobalto text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <span className="contorno rotulo rounded-md bg-lima px-2 py-1 text-[9px] text-carvao">Só olhando</span>
        <p className="min-w-0 flex-1 text-[12px] font-medium">
          Este é um placar compartilhado. Nada aqui mexe no campeonato salvo no seu aparelho.
        </p>
        <div className="flex gap-2">
          <Botao variante="papel" onClick={acoes.adotarSnapshot} className="px-3 py-1.5 text-[10px]">
            Usar como meu
          </Botao>
          <Botao variante="papel" onClick={acoes.sairDoSnapshot} className="px-3 py-1.5 text-[10px]">
            Sair
          </Botao>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const {
    participantes,
    timesDoUsuario,
    torneio,
    estatisticas,
    resumo,
    salvamento,
    nuvem,
    destravado,
    somenteLeitura,
    modoVisualizacao,
    acoes,
  } = useTorneio()
  const { tema, alternarTema } = useTema()
  const [abaAtiva, setAbaAtiva] = useState('chaveamento')
  const [partidaEmEdicao, setPartidaEmEdicao] = useState(null)

  // Tela que o QR code abre. Fica no hash para não exigir rota no servidor.
  const [inscrevendo, setInscrevendo] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#inscricao',
  )
  useEffect(() => {
    const aoTrocarHash = () => setInscrevendo(window.location.hash === '#inscricao')
    window.addEventListener('hashchange', aoTrocarHash)
    return () => window.removeEventListener('hashchange', aoTrocarHash)
  }, [])

  // A aba Admin some no modo visualização (link compartilhado), mas continua
  // acessível quando a nuvem está ligada — é por ela que se informa o PIN.
  const abas = modoVisualizacao ? ABAS.filter((aba) => aba.id !== 'admin') : ABAS

  // A partida vem sempre do torneio recalculado, para o modal refletir edições recentes.
  const partidaAberta = partidaEmEdicao ? (torneio.porId.get(partidaEmEdicao) ?? null) : null
  const abrirResultado = somenteLeitura ? undefined : (partida) => setPartidaEmEdicao(partida.id)

  const sairDaInscricao = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setInscrevendo(false)
  }

  if (inscrevendo && nuvemConfigurada) {
    return (
      <ProvedorDeTimes timesDoUsuario={timesDoUsuario}>
        <div className="min-h-dvh">
          <Inscricao aoSair={sairDaInscricao} participantes={participantes} />
        </div>
      </ProvedorDeTimes>
    )
  }

  return (
    <ProvedorDeTimes timesDoUsuario={timesDoUsuario}>
      <div className="min-h-dvh">
        {modoVisualizacao ? <FaixaSomenteLeitura acoes={acoes} /> : null}

        <Cabecalho
          totalParticipantes={participantes.length}
          totalGols={resumo.totalGols}
          torneio={torneio}
          tema={tema}
          aoAlternarTema={alternarTema}
          nuvem={nuvem}
        />

        <Navegacao abas={abas} abaAtiva={abaAtiva} aoTrocar={setAbaAtiva} />

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div key={abaAtiva} className="animar-entrar">
            {abaAtiva === 'chaveamento' ? (
              <Chaveamento
                torneio={torneio}
                aoEditarPartida={abrirResultado}
                aoIrParaAdmin={() => setAbaAtiva('admin')}
                somenteLeitura={somenteLeitura}
              />
            ) : null}

            {abaAtiva === 'repescagem' ? (
              <Repescagem torneio={torneio} aoEditarPartida={abrirResultado} somenteLeitura={somenteLeitura} />
            ) : null}

            {abaAtiva === 'estatisticas' ? <Estatisticas estatisticas={estatisticas} resumo={resumo} /> : null}

            {abaAtiva === 'regras' ? <Regras /> : null}

            {abaAtiva === 'admin' && !modoVisualizacao ? (
              <PainelAdmin
                participantes={participantes}
                timesDoUsuario={timesDoUsuario}
                torneio={torneio}
                acoes={acoes}
                aoEditarPartida={abrirResultado}
                salvamento={salvamento}
                nuvem={nuvem}
                destravado={destravado}
              />
            ) : null}
          </div>
        </main>

        {/* No tema preto o carvão se confunde com o fundo — vira papel-escuro. */}
        <footer className="mt-8 border-t-2 border-tinta bg-carvao text-creme escuro:bg-papel-escuro escuro:text-tinta">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
            <p className="font-display text-lg text-current uppercase">
              Unidos Acamp <span className="text-lima">· FIFA</span>
            </p>
            <p className="rotulo text-[9px] opacity-60">
              {somenteLeitura ? 'Modo visualização' : 'Salvo automático neste navegador'}
            </p>
          </div>
        </footer>

        {partidaAberta && !somenteLeitura ? (
          <ModalResultado
            partida={partidaAberta}
            aoSalvar={acoes.salvarResultado}
            aoLimpar={acoes.limparResultado}
            aoFechar={() => setPartidaEmEdicao(null)}
          />
        ) : null}
      </div>
    </ProvedorDeTimes>
  )
}
