/**
 * Verificação sem navegador: renderiza todas as telas em HTML e roda
 * auditorias sobre o resultado.
 *
 *   npm run verificar
 *
 * Cobre três coisas que já quebraram na prática:
 *   1. Telas que estouram em algum estado (vazio, com bye, campeão definido…)
 *   2. Contraste no tema preto — texto sobre cor viva não pode depender do tema
 *   3. Catálogo de times: mesclagem entre a lista embutida e os ajustes do usuário
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { montarTorneio } from '../src/lib/torneio.js'
import { calcularEstatisticas, calcularResumo } from '../src/lib/estatisticas.js'
import { ESTADO_EXEMPLO } from '../src/data/mock.js'
import { TIMES } from '../src/data/times.js'
import { ProvedorDeTimes, criarCatalogo } from '../src/contexto/TimesContexto.jsx'
import App from '../src/App.jsx'
import { Cabecalho } from '../src/components/Cabecalho.jsx'
import { Navegacao } from '../src/components/Navegacao.jsx'
import { Chaveamento } from '../src/components/Chaveamento.jsx'
import { Repescagem } from '../src/components/Repescagem.jsx'
import { Estatisticas } from '../src/components/Estatisticas.jsx'
import { Regras } from '../src/components/Regras.jsx'
import { PainelAdmin } from '../src/components/PainelAdmin.jsx'
import { ModalResultado } from '../src/components/ModalResultado.jsx'
import { ModalConfirmacao } from '../src/components/ModalConfirmacao.jsx'
import { GerenciadorDeTimes } from '../src/components/GerenciadorDeTimes.jsx'

let falhas = 0
const ok = (condicao, mensagem) => {
  if (!condicao) falhas += 1
  console.log(`${condicao ? 'PASS' : 'FALHA'}  ${mensagem}`)
}

const nada = () => {}
const acoes = new Proxy({}, { get: () => nada })
const salvamento = { em: new Date().toISOString(), falhou: false }

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
const TIMES_DO_USUARIO = [
  { id: 'real-madrid', escudo: PNG },
  { id: 'meu-galera-ab12', nome: 'Galera do Acamp', liga: 'Meus times', cores: ['#22c55e', '#0f172a'], escudo: PNG },
]

const torneio = montarTorneio(ESTADO_EXEMPLO)
const estatisticas = calcularEstatisticas(ESTADO_EXEMPLO.participantes, torneio.todasPartidas)
const resumo = calcularResumo(estatisticas, torneio.todasPartidas)
const vazio = montarTorneio({ participantes: [], seeds: [], resultados: {} })
const semJogos = calcularEstatisticas([], vazio.todasPartidas)

const zerado = { golsA: 0, golsB: 0, penaltisA: 0, penaltisB: 0, amarelosA: 0, vermelhosA: 0, amarelosB: 0, vermelhosB: 0 }
const concluido = montarTorneio({
  ...ESTADO_EXEMPLO,
  resultados: {
    ...ESTADO_EXEMPLO.resultados,
    'main-r2-m1': { ...zerado, golsA: 2, golsB: 1 },
    'main-r3-m0': { ...zerado, golsA: 1, golsB: 3 },
    'rep-r1-m1': { ...zerado, golsA: 3, golsB: 0 },
    'rep-r2-m0': { ...zerado, golsA: 2, golsB: 2, penaltisA: 5, penaltisB: 4 },
  },
})
const comByes = montarTorneio({
  participantes: Array.from({ length: 9 }, (_, i) => ({ id: `n${i}`, nome: `Jogador ${i + 1}`, timeId: 'brasil' })),
  seeds: [...Array.from({ length: 9 }, (_, i) => `n${i}`), ...Array(7).fill(null)],
  resultados: {},
})

const comTimes = (elemento) => <ProvedorDeTimes timesDoUsuario={TIMES_DO_USUARIO}>{elemento}</ProvedorDeTimes>

const telas = [
  ['App completo', <App />],
  ['Cabecalho (tema claro)', <Cabecalho totalParticipantes={16} totalGols={resumo.totalGols} torneio={torneio} tema="claro" aoAlternarTema={nada} />],
  ['Cabecalho (tema preto)', <Cabecalho totalParticipantes={16} totalGols={resumo.totalGols} torneio={torneio} tema="escuro" aoAlternarTema={nada} />],
  ['Navegacao', <Navegacao abas={[{ id: 'a', rotulo: 'Chaveamento', rotuloCurto: 'Chaves' }]} abaAtiva="a" aoTrocar={nada} />],
  ['Chaveamento', <Chaveamento torneio={torneio} aoEditarPartida={nada} aoIrParaAdmin={nada} />],
  ['Chaveamento (escudos enviados)', comTimes(<Chaveamento torneio={torneio} aoEditarPartida={nada} aoIrParaAdmin={nada} />)],
  ['Chaveamento (campeao)', <Chaveamento torneio={concluido} aoEditarPartida={nada} aoIrParaAdmin={nada} />],
  ['Chaveamento (byes)', <Chaveamento torneio={comByes} aoEditarPartida={nada} aoIrParaAdmin={nada} />],
  ['Chaveamento (somente leitura)', <Chaveamento torneio={torneio} aoIrParaAdmin={nada} somenteLeitura />],
  ['Chaveamento (vazio)', <Chaveamento torneio={vazio} aoEditarPartida={nada} aoIrParaAdmin={nada} />],
  ['Repescagem', <Repescagem torneio={torneio} aoEditarPartida={nada} />],
  ['Repescagem (3o definido)', <Repescagem torneio={concluido} aoEditarPartida={nada} />],
  ['Repescagem (vazio)', <Repescagem torneio={vazio} aoEditarPartida={nada} />],
  ['Estatisticas', <Estatisticas estatisticas={estatisticas} resumo={resumo} />],
  ['Estatisticas (vazio)', <Estatisticas estatisticas={semJogos} resumo={calcularResumo(semJogos, [])} />],
  ['Regras', <Regras />],
  ['PainelAdmin', <PainelAdmin participantes={ESTADO_EXEMPLO.participantes} torneio={torneio} acoes={acoes} aoEditarPartida={nada} salvamento={salvamento} />],
  ['PainelAdmin (times do usuario)', comTimes(<PainelAdmin participantes={ESTADO_EXEMPLO.participantes} timesDoUsuario={TIMES_DO_USUARIO} torneio={torneio} acoes={acoes} aoEditarPartida={nada} salvamento={salvamento} />)],
  ['PainelAdmin (sem inscritos)', <PainelAdmin participantes={[]} torneio={vazio} acoes={acoes} aoEditarPartida={nada} salvamento={salvamento} />],
  ['PainelAdmin (storage bloqueado)', <PainelAdmin participantes={ESTADO_EXEMPLO.participantes} torneio={torneio} acoes={acoes} aoEditarPartida={nada} salvamento={{ em: null, falhou: true }} />],
  ['GerenciadorDeTimes', comTimes(<GerenciadorDeTimes acoes={acoes} totalDeAjustes={2} />)],
  ['ModalResultado (finalizado)', <ModalResultado partida={torneio.porId.get('main-r0-m1')} aoSalvar={nada} aoLimpar={nada} aoFechar={nada} />],
  ['ModalResultado (a jogar)', <ModalResultado partida={torneio.porId.get('main-r2-m1')} aoSalvar={nada} aoLimpar={nada} aoFechar={nada} />],
  ['ModalConfirmacao', <ModalConfirmacao aberto titulo="t" descricao="d" aoConfirmar={nada} aoFechar={nada} />],
]

console.log('--- telas ---')
const html = []
for (const [nome, elemento] of telas) {
  try {
    const saida = renderToStaticMarkup(elemento)
    html.push(saida)
    console.log(`PASS  ${nome} (${saida.length} bytes)`)
  } catch (erro) {
    falhas += 1
    console.log(`FALHA ${nome}: ${erro.message}`)
  }
}

/* -------------------------------------------------------------------------- */
/* Catálogo de times                                                           */
/* -------------------------------------------------------------------------- */

console.log('\n--- catalogo de times ---')
const padrao = criarCatalogo([])
const ajustado = criarCatalogo(TIMES_DO_USUARIO)

ok(ajustado.times.length === padrao.times.length + 1, `time criado entra no catalogo -> ${ajustado.times.length}`)
ok(ajustado.buscarTime('real-madrid').escudo === PNG, 'escudo enviado sobrescreve o do time embutido')
ok(ajustado.buscarTime('real-madrid').nome === 'Real Madrid', 'nome do time embutido e preservado')
ok(ajustado.ehEmbutido('real-madrid') && !ajustado.ehEmbutido('meu-galera-ab12'), 'distingue embutido de criado')
ok(ajustado.temEscudoProprio('real-madrid') && !ajustado.temEscudoProprio('flamengo'), 'sabe de quem e o escudo')
ok(ajustado.buscarTime('inexistente').nome === 'Time livre', 'time desconhecido cai no padrao')
ok(ajustado.ligas[0] === 'Meus times', `liga do usuario aparece primeiro -> ${ajustado.ligas[0]}`)

const semEscudo = TIMES.filter((time) => !time.escudo || !time.escudoReserva)
ok(semEscudo.length === 0, `os ${TIMES.length} times embutidos tem escudo e reserva`)
const idsDeEscudo = TIMES.map((time) => time.escudoReserva)
ok(new Set(idsDeEscudo).size === TIMES.length, 'nenhum escudo repetido entre times diferentes')

/* -------------------------------------------------------------------------- */
/* Contraste no tema preto                                                     */
/* -------------------------------------------------------------------------- */

const VAZIAS = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'path', 'circle', 'line'])
const CORES = ['carvao', 'creme', 'white', 'lima', 'cobalto', 'laranja', 'rosa', 'papel', 'papel-claro', 'papel-escuro', 'tinta', 'tinta-media', 'tinta-fraca', 'current', 'transparent']

function acharCor(classe, prefixo) {
  for (const cor of [...CORES].sort((a, b) => b.length - a.length)) {
    if (new RegExp(`(^| )${prefixo}-${cor}(\\/\\d+)?( |$)`).test(classe)) {
      return { cor, translucido: new RegExp(`${prefixo}-${cor}\\/\\d+`).test(classe) }
    }
  }
  return null
}

function analisar(fonte) {
  const pilha = []
  const elementos = []
  const regex = /<(\/?)([a-zA-Z0-9-]+)([^>]*?)(\/?)>|([^<]+)/g
  let achado
  while ((achado = regex.exec(fonte))) {
    if (achado[5] !== undefined) {
      const texto = achado[5].replace(/&[a-z]+;/g, '').trim()
      if (texto && pilha.length) pilha[pilha.length - 1].texto += texto
      continue
    }
    const [, barra, tag, atributos, fechamento] = achado
    if (barra === '/') {
      const elemento = pilha.pop()
      if (elemento) elementos.push(elemento)
      continue
    }
    const classe = (atributos.match(/class="([^"]*)"/) ?? ['', ''])[1]
    const elemento = { tag, classe, texto: '', ancestrais: pilha.map((item) => item.classe) }
    if (fechamento === '/' || VAZIAS.has(tag)) elementos.push(elemento)
    else pilha.push(elemento)
  }
  while (pilha.length) elementos.push(pilha.pop())
  return elementos
}

/** Fundo translúcido deixa o de baixo aparecer; texto translúcido mantém a matiz. */
function resolver(elemento, prefixo) {
  for (const classe of [elemento.classe, ...[...elemento.ancestrais].reverse()]) {
    const achado = acharCor(classe, prefixo)
    if (!achado || achado.cor === 'transparent') continue
    if (prefixo === 'bg' && achado.translucido) continue
    if (achado.cor === 'current') continue
    return achado.cor
  }
  return null
}

console.log('\n--- tema preto ---')
const elementos = analisar(html.join('\n'))
const SEMPRE_ESCURO = new Set(['carvao', 'cobalto', 'laranja', 'rosa'])
const SEMPRE_CLARO = new Set(['lima', 'white', 'creme'])
const TEXTO_DO_TEMA = new Set(['tinta', 'tinta-media', 'tinta-fraca', 'papel', 'papel-claro', 'papel-escuro'])

const problemas = new Set()
for (const elemento of elementos) {
  if (!elemento.texto) continue
  const fundo = resolver(elemento, 'bg')
  if (!fundo || (!SEMPRE_ESCURO.has(fundo) && !SEMPRE_CLARO.has(fundo))) continue
  const texto = resolver(elemento, 'text')
  if (texto === null || TEXTO_DO_TEMA.has(texto)) {
    problemas.add(`fundo ${fundo} + texto ${texto ?? 'herdado'} -> "${elemento.texto.slice(0, 32)}"`)
  }
}
problemas.forEach((linha) => console.log(`FALHA ${linha}`))
ok(problemas.size === 0, 'todo texto sobre cor viva tem cor independente do tema')

const carvaoSolto = new Set(
  elementos
    .filter((elemento) => {
      const proprio = acharCor(elemento.classe, 'bg')
      if (proprio?.cor !== 'carvao' || proprio.translucido) return false
      if (/escuro:bg-/.test(elemento.classe)) return false
      return !elemento.ancestrais.some((classe) => {
        const cor = acharCor(classe, 'bg')
        return cor && (SEMPRE_CLARO.has(cor.cor) || SEMPRE_ESCURO.has(cor.cor))
      })
    })
    .map((elemento) => elemento.classe),
)
carvaoSolto.forEach((classe) => console.log(`FALHA carvao invisivel no tema preto -> ${classe}`))
ok(carvaoSolto.size === 0, 'nenhum bloco carvao some no tema preto')

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO CERTO')
process.exitCode = falhas ? 1 : 0
