import { useState } from 'react'
import { BarChart3, RotateCcw, ScrollText, Settings, Swords } from 'lucide-react'
import { useTorneio } from './hooks/useTorneio.js'
import { Cabecalho } from './components/Cabecalho.jsx'
import { Navegacao } from './components/Navegacao.jsx'
import { Chaveamento } from './components/Chaveamento.jsx'
import { Repescagem } from './components/Repescagem.jsx'
import { Estatisticas } from './components/Estatisticas.jsx'
import { Regras } from './components/Regras.jsx'
import { PainelAdmin } from './components/PainelAdmin.jsx'
import { ModalResultado } from './components/ModalResultado.jsx'

const ABAS = [
  { id: 'chaveamento', rotulo: 'Chaveamento', rotuloCurto: 'Chaves', icone: Swords },
  { id: 'repescagem', rotulo: 'Repescagem', rotuloCurto: 'Repesca', icone: RotateCcw },
  { id: 'estatisticas', rotulo: 'Estatísticas', rotuloCurto: 'Stats', icone: BarChart3 },
  { id: 'regras', rotulo: 'Regras', rotuloCurto: 'Regras', icone: ScrollText },
  { id: 'admin', rotulo: 'Painel Admin', rotuloCurto: 'Admin', icone: Settings },
]

export default function App() {
  const { participantes, torneio, estatisticas, resumo, acoes } = useTorneio()
  const [abaAtiva, setAbaAtiva] = useState('chaveamento')
  const [partidaEmEdicao, setPartidaEmEdicao] = useState(null)

  // A partida vem sempre do torneio recalculado, para o modal refletir edições recentes.
  const partidaAberta = partidaEmEdicao ? (torneio.porId.get(partidaEmEdicao) ?? null) : null

  const abrirResultado = (partida) => setPartidaEmEdicao(partida.id)
  const fecharResultado = () => setPartidaEmEdicao(null)

  return (
    <div className="min-h-dvh">
      <Cabecalho totalParticipantes={participantes.length} totalGols={resumo.totalGols} torneio={torneio} />

      <Navegacao abas={ABAS} abaAtiva={abaAtiva} aoTrocar={setAbaAtiva} />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <div key={abaAtiva} className="animar-surgir">
          {abaAtiva === 'chaveamento' ? (
            <Chaveamento
              torneio={torneio}
              aoEditarPartida={abrirResultado}
              aoIrParaAdmin={() => setAbaAtiva('admin')}
            />
          ) : null}

          {abaAtiva === 'repescagem' ? <Repescagem torneio={torneio} aoEditarPartida={abrirResultado} /> : null}

          {abaAtiva === 'estatisticas' ? <Estatisticas estatisticas={estatisticas} resumo={resumo} /> : null}

          {abaAtiva === 'regras' ? <Regras /> : null}

          {abaAtiva === 'admin' ? (
            <PainelAdmin
              participantes={participantes}
              torneio={torneio}
              acoes={acoes}
              aoEditarPartida={abrirResultado}
            />
          ) : null}
        </div>
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-slate-500">
        <p className="font-display tracking-widest uppercase">Unidos Acamp · Campeonato FIFA</p>
        <p className="mt-1">
          Os dados ficam salvos neste navegador. Use o Painel Admin para reiniciar ou restaurar o exemplo.
        </p>
      </footer>

      {partidaAberta ? (
        <ModalResultado
          partida={partidaAberta}
          aoSalvar={acoes.salvarResultado}
          aoLimpar={acoes.limparResultado}
          aoFechar={fecharResultado}
        />
      ) : null}
    </div>
  )
}
