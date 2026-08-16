import { LIMITE_AMARELOS } from '../lib/estatisticas.js'
import { Cartao } from './ui.jsx'

const BLOCOS = [
  {
    numero: '01',
    cor: 'bg-lima text-carvao',
    titulo: 'Como funciona',
    itens: [
      'Mata-mata direto: perdeu na chave principal, saiu dela.',
      'Oitavas, quartas, semifinal e final, nessa ordem.',
      'O chaveamento sai por sorteio — sem cabeça de chave, sem panelinha.',
      'Se o número de inscritos não fechar, alguém passa direto na primeira fase.',
    ],
  },
  {
    numero: '02',
    cor: 'bg-laranja text-white',
    titulo: 'Repescagem',
    itens: [
      'Todo mundo que cai na primeira fase entra na repescagem.',
      'Também é mata-mata, mantendo a ordem dos confrontos.',
      'Quem vencer a repescagem fica com o terceiro lugar.',
    ],
  },
  {
    numero: '03',
    cor: 'bg-papel-escuro',
    titulo: 'Os times',
    itens: [
      'Só os times da lista: os melhores do FC 26, e nada de seleção de lendas ou time montado.',
      'Cada time é de um jogador só. Escolheu, ninguém mais pega aquele.',
      'Escolheu no cadastro, fica com ele até o fim.',
      'Time que não está na lista pode ser cadastrado na hora da inscrição — desde que não seja time de lenda.',
    ],
  },
  {
    numero: '07',
    cor: 'bg-papel-escuro',
    titulo: 'Os jogos',
    itens: [
      'Seis minutos por tempo, nível Profissional.',
      'Lesão e desgaste desligados, velocidade normal.',
      'Sem alterar formação ou escalação de outro jogador.',
    ],
  },
  {
    numero: '04',
    cor: 'bg-cobalto text-white',
    titulo: 'Deu empate',
    itens: [
      'Não existe empate: acabou empatado, vai direto pros pênaltis.',
      'Sem prorrogação, pra não atrasar a programação.',
      'Gol de pênalti na decisão não conta na artilharia.',
    ],
  },
  {
    numero: '05',
    cor: 'bg-rosa text-white',
    titulo: 'Cartões',
    itens: [
      `${LIMITE_AMARELOS} amarelos acumulados = fica de fora do jogo seguinte.`,
      'Vermelho suspende automaticamente na próxima partida.',
      'Controle arremessado, palavrão ou zoação pesada = cartão da organização.',
      'Insistiu? A organização pode dar W.O.',
    ],
  },
  {
    numero: '06',
    cor: 'bg-papel-escuro',
    titulo: 'O combinado',
    itens: [
      'Joga pra ganhar, mas torce por todo mundo.',
      'Cumprimenta o adversário antes e depois. Sempre.',
      'Mais de 10 minutos de atraso é W.O.',
      'Quem estiver na programação espiritual joga depois, sem prejuízo.',
    ],
  },
]

export function Regras() {
  return (
    <div className="space-y-5">
      <div className="contorno sombra-g relative overflow-hidden rounded-xl bg-laranja px-6 py-7 text-white sm:px-8">
        <div className="listrado absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="contorno rotulo inline-block rounded-md bg-lima px-2 py-1 text-[10px] text-carvao">
              Premiação
            </span>
            <p className="num mt-3 font-display text-6xl leading-none">R$ 100</p>
            <p className="mt-2 text-[14px] font-medium">na mão do campeão, na noite de encerramento.</p>
          </div>
          <p className="max-w-xs text-[13px] leading-snug font-medium text-white/85">
            Vice e terceiro colocado levam a medalha do Unidos Acamp. E o direito de encher o saco até o ano que vem.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {BLOCOS.map(({ numero, cor, titulo, itens }) => (
          <Cartao key={titulo} className="overflow-hidden">
            <div className={`flex items-center gap-3 border-b-2 border-tinta px-4 py-3 ${cor}`}>
              <span className="num font-display text-2xl leading-none">{numero}</span>
              {/* text-current: o título assume a cor definida pela faixa */}
              <h3 className="text-xl text-current">{titulo}</h3>
            </div>
            <ul className="space-y-3 p-4">
              {itens.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-snug">
                  <span className="mt-1.5 size-2 shrink-0 rounded-sm border-2 border-tinta bg-lima" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Cartao>
        ))}
      </div>

      <p className="px-1 text-[12px] font-medium text-tinta-media">
        Deu treta em algo que não está aqui? A organização do Unidos Acamp decide — e a decisão da mesa é final.
      </p>
    </div>
  )
}
