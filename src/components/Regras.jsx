import { LIMITE_AMARELOS } from '../lib/estatisticas.js'
import { Cartao } from './ui.jsx'

const BLOCOS = [
  {
    numero: '01',
    titulo: 'Formato',
    itens: [
      'Mata-mata direto: quem perde na chave principal está fora dela.',
      'Fases na ordem Oitavas, Quartas, Semifinal e Final.',
      'O chaveamento inicial sai por sorteio, sem cabeças de chave.',
      'Se os inscritos não fecharem uma potência de 2, algumas chaves recebem classificação direta.',
    ],
  },
  {
    numero: '02',
    titulo: 'Repescagem',
    itens: [
      'Todos os eliminados da primeira fase entram na chave de repescagem.',
      'A repescagem também é mata-mata e mantém a ordem dos confrontos originais.',
      'O vencedor da repescagem fica com o terceiro lugar.',
    ],
  },
  {
    numero: '03',
    titulo: 'Partidas',
    itens: [
      'Seis minutos por tempo, nível Profissional.',
      'Lesões e desgaste desativados, velocidade normal.',
      'Cada participante escolhe um time no cadastro e mantém até o fim.',
      'Times repetidos são permitidos.',
    ],
  },
  {
    numero: '04',
    titulo: 'Empates',
    itens: [
      'Não existe empate no mata-mata: empatou, vai direto para os pênaltis.',
      'A prorrogação é dispensada para manter a programação do acampamento.',
      'O placar dos pênaltis não conta na artilharia.',
    ],
  },
  {
    numero: '05',
    titulo: 'Disciplina',
    itens: [
      `${LIMITE_AMARELOS} amarelos acumulados geram suspensão no jogo seguinte.`,
      'Cartão vermelho suspende automaticamente o próximo jogo.',
      'Controle arremessado, palavrão ou desrespeito ao adversário rende cartão da organização.',
      'Reincidência pode resultar em W.O.',
    ],
  },
  {
    numero: '06',
    titulo: 'Convivência',
    itens: [
      'Competição saudável: joga para ganhar, torce para todos.',
      'Cumprimente o adversário antes e depois da partida.',
      'Mais de 10 minutos de atraso caracteriza W.O.',
      'Quem estiver na programação espiritual tem o jogo remarcado, sem prejuízo.',
    ],
  },
]

export function Regras() {
  return (
    <div className="space-y-6">
      <Cartao realce className="flex flex-wrap items-end justify-between gap-6 p-6 sm:p-8">
        <div>
          <p className="rotulo text-realce/80">Premiação</p>
          <h2 className="num dourado mt-3 font-serif text-5xl leading-none">R$ 100,00</h2>
          <p className="mt-3 text-[13px] text-perola-400">Entregues ao campeão na noite de encerramento.</p>
        </div>
        <p className="max-w-xs text-[13px] leading-relaxed text-perola-400">
          Vice-campeão e terceiro colocado recebem a medalha simbólica do Unidos Acamp.
        </p>
      </Cartao>

      <div className="grid gap-4 lg:grid-cols-2">
        {BLOCOS.map(({ numero, titulo, itens }) => (
          <Cartao key={titulo} className="p-6">
            <div className="flex items-baseline gap-3">
              <span className="num font-serif text-lg text-realce/50">{numero}</span>
              <h3 className="font-serif text-xl leading-none text-perola-100">{titulo}</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {itens.map((item) => (
                <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-perola-400">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-realce/40" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Cartao>
        ))}
      </div>

      <p className="px-1 text-[12px] leading-relaxed text-perola-600">
        Casos omissos são resolvidos pela organização do Unidos Acamp. A decisão da mesa é final.
      </p>
    </div>
  )
}
