import { Banknote, Clock, Gamepad2, HeartHandshake, RotateCcw, ScrollText, ShieldAlert, Swords } from 'lucide-react'
import { LIMITE_AMARELOS } from '../lib/estatisticas.js'
import { Cartao, Etiqueta } from './ui.jsx'

const BLOCOS = [
  {
    icone: Swords,
    titulo: 'Formato do campeonato',
    itens: [
      'Mata-mata direto: quem perde na chave principal está fora dela.',
      'As fases seguem a ordem Oitavas → Quartas → Semifinal → Grande Final.',
      'O chaveamento inicial é definido por sorteio, sem cabeças de chave.',
      'Se o número de inscritos não fechar uma potência de 2, algumas chaves recebem “bye” (classificação direta).',
    ],
  },
  {
    icone: RotateCcw,
    titulo: 'Repescagem e 3º lugar',
    itens: [
      'Todos os eliminados da primeira fase entram automaticamente na chave de repescagem.',
      'A repescagem também é em mata-mata, mantendo a ordem dos confrontos originais.',
      'O vencedor da repescagem conquista o 3º lugar do campeonato.',
    ],
  },
  {
    icone: Clock,
    titulo: 'Duração e configuração dos jogos',
    itens: [
      'Partidas de 6 minutos por tempo, nível Profissional.',
      'Lesões e desgaste desativados; velocidade de jogo normal.',
      'Cada participante escolhe seu time no cadastro e mantém o mesmo até o fim.',
      'Times repetidos são permitidos — vale a habilidade, não a escalação.',
    ],
  },
  {
    icone: Gamepad2,
    titulo: 'Empates',
    itens: [
      'Não existe empate no mata-mata: empatou no tempo normal, vai direto para os pênaltis.',
      'A prorrogação é dispensada para manter a programação do acampamento.',
      'O placar dos pênaltis é registrado à parte e não conta na artilharia.',
    ],
  },
  {
    icone: ShieldAlert,
    titulo: 'Cartões e disciplina',
    itens: [
      `${LIMITE_AMARELOS} cartões amarelos acumulados = suspensão automática no jogo seguinte.`,
      'Cartão vermelho = suspensão imediata no próximo jogo do participante.',
      'Controle remoto arremessado, grito com palavrão ou desrespeito ao adversário = cartão da organização.',
      'A organização pode aplicar W.O. em caso de reincidência.',
    ],
  },
  {
    icone: HeartHandshake,
    titulo: 'Espírito do Unidos Acamp',
    itens: [
      'Aqui é competição saudável: joga para ganhar, torce para todos.',
      'Cumprimente o adversário antes e depois da partida.',
      'Atraso de mais de 10 minutos no horário do jogo caracteriza W.O.',
      'Quem estiver na programação espiritual tem o jogo remarcado, sem prejuízo.',
    ],
  },
]

export function Regras() {
  return (
    <div className="space-y-5">
      <Cartao className="brilho-ouro relative overflow-hidden border-gold-400/40 bg-gradient-to-r from-gold-400/15 to-transparent p-5">
        <Banknote className="absolute -top-3 -right-3 size-24 text-gold-400/10" />
        <div className="relative">
          <Etiqueta tom="ouro">Premiação oficial</Etiqueta>
          <h2 className="mt-2 font-display text-2xl font-black text-white">R$ 100,00 para o campeão</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-300">
            O prêmio é entregue na noite de encerramento do acampamento, direto para o vencedor da Grande Final.
            Vice-campeão e 3º lugar recebem a medalha simbólica do <strong>Unidos Acamp</strong>.
          </p>
        </div>
      </Cartao>

      <div className="grid gap-4 lg:grid-cols-2">
        {BLOCOS.map(({ icone: Icone, titulo, itens }) => (
          <Cartao key={titulo} className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-royal-500/40 bg-royal-600/20 text-neon-400">
                <Icone className="size-4" />
              </span>
              <h3 className="text-sm font-bold text-white uppercase">{titulo}</h3>
            </div>
            <ul className="space-y-2">
              {itens.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-300">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-neon-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Cartao>
        ))}
      </div>

      <Cartao className="flex items-start gap-3 p-4 text-sm text-slate-400">
        <ScrollText className="mt-0.5 size-4 shrink-0 text-royal-300" />
        <p>
          Casos omissos são resolvidos pela organização do <strong className="text-slate-200">Unidos Acamp</strong>. A
          decisão da mesa é final — e vale mais a amizade do que o troféu.
        </p>
      </Cartao>
    </div>
  )
}
