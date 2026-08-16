import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useTorneio } from './hooks/useTorneio.js'
import { Cabecalho } from './components/Cabecalho.jsx'
import { Navegacao } from './components/Navegacao.jsx'
import { Chaveamento } from './components/Chaveamento.jsx'
import { Repescagem } from './components/Repescagem.jsx'
import { Estatisticas } from './components/Estatisticas.jsx'
import { Regras } from './components/Regras.jsx'
import { PainelAdmin } from './components/PainelAdmin.jsx'
import { ModalResultado } from './components/ModalResultado.jsx'
import { Botao } from './components/ui.jsx'

const ABAS = [
  { id: 'chaveamento', rotulo: 'Chaveamento', rotuloCurto: 'Chaves' },
  { id: 'repescagem', rotulo: 'Repescagem', rotuloCurto: 'Repescagem' },
  { id: 'estatisticas', rotulo: 'Estatísticas', rotuloCurto: 'Estatísticas' },
  { id: 'regras', rotulo: 'Regras', rotuloCurto: 'Regras' },
  { id: 'admin', rotulo: 'Painel Admin', rotuloCurto: 'Admin' },
]

function FaixaSomenteLeitura({ acoes }) {
  return (
    <div className="border-b border-borda bg-elevado">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <Eye className="size-4 shrink-0 text-zinc-500" strokeWidth={1.75} />
        <p className="min-w-0 flex-1 text-[12px] text-zinc-400">
          Você está vendo um placar compartilhado. Nada aqui altera o campeonato salvo neste aparelho.
        </p>
        <div className="flex gap-2">
          <Botao variante="contorno" onClick={acoes.adotarSnapshot} className="px-3 py-1.5 text-[12px]">
            Usar como meu campeonato
          </Botao>
          <Botao variante="fantasma" onClick={acoes.sairDoSnapshot} className="px-3 py-1.5 text-[12px]">
            Sair
          </Botao>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { participantes, torneio, estatisticas, resumo, salvamento, somenteLeitura, acoes } = useTorneio()
  const [abaAtiva, setAbaAtiva] = useState('chaveamento')
  const [partidaEmEdicao, setPartidaEmEdicao] = useState(null)

  const abas = somenteLeitura ? ABAS.filter((aba) => aba.id !== 'admin') : ABAS

  // A partida vem sempre do torneio recalculado, para o modal refletir edições recentes.
  const partidaAberta = partidaEmEdicao ? (torneio.porId.get(partidaEmEdicao) ?? null) : null
  const abrirResultado = somenteLeitura ? undefined : (partida) => setPartidaEmEdicao(partida.id)

  return (
    <div className="min-h-dvh">
      {somenteLeitura ? <FaixaSomenteLeitura acoes={acoes} /> : null}

      <Cabecalho totalParticipantes={participantes.length} totalGols={resumo.totalGols} torneio={torneio} />

      <Navegacao abas={abas} abaAtiva={abaAtiva} aoTrocar={setAbaAtiva} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div key={abaAtiva} className="animar-surgir">
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

          {abaAtiva === 'admin' && !somenteLeitura ? (
            <PainelAdmin
              participantes={participantes}
              torneio={torneio}
              acoes={acoes}
              aoEditarPartida={abrirResultado}
              salvamento={salvamento}
            />
          ) : null}
        </div>
      </main>

      <footer className="mt-8 border-t border-borda">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-[12px] text-zinc-600 sm:px-6">
          <span>Unidos Acamp · Campeonato FIFA</span>
          <span>{somenteLeitura ? 'Modo visualização' : 'Dados salvos neste navegador'}</span>
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
  )
}
