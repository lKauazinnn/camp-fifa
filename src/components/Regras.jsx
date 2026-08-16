import { LIMITE_AMARELOS } from '../lib/estatisticas.js'
import { Cartao } from './ui.jsx'

const BLOCOS = [
  {
    titulo: 'Formato',
    itens: [
      'Mata-mata direto: quem perde na chave principal está fora dela.',
      'Fases na ordem Oitavas, Quartas, Semifinal e Final.',
      'O chaveamento inicial sai por sorteio, sem cabeças de chave.',
      'Se os inscritos não fecharem uma potência de 2, algumas chaves recebem classificação direta.',
    ],
  },
  {
    titulo: 'Repescagem',
    itens: [
      'Todos os eliminados da primeira fase entram na chave de repescagem.',
      'A repescagem também é mata-mata e mantém a ordem dos confrontos originais.',
      'O vencedor da repescagem fica com o terceiro lugar.',
    ],
  },
  {
    titulo: 'Configuração das partidas',
    itens: [
      'Seis minutos por tempo, nível Profissional.',
      'Lesões e desgaste desativados, velocidade normal.',
      'Cada participante escolhe um time no cadastro e mantém até o fim.',
      'Times repetidos são permitidos.',
    ],
  },
  {
    titulo: 'Empates',
    itens: [
      'Não existe empate no mata-mata: empatou, vai direto para os pênaltis.',
      'A prorrogação é dispensada para manter a programação do acampamento.',
      'O placar dos pênaltis não conta na artilharia.',
    ],
  },
  {
    titulo: 'Disciplina',
    itens: [
      `${LIMITE_AMARELOS} amarelos acumulados geram suspensão no jogo seguinte.`,
      'Cartão vermelho suspende automaticamente o próximo jogo.',
      'Controle arremessado, palavrão ou desrespeito ao adversário rende cartão da organização.',
      'Reincidência pode resultar em W.O.',
    ],
  },
  {
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
    <div className="space-y-4">
      <Cartao className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="rotulo">Premiação</p>
          <h2 className="num mt-1 text-2xl font-semibold text-zinc-50">R$ 100,00</h2>
          <p className="mt-1 text-[13px] text-zinc-500">Entregues ao campeão na noite de encerramento.</p>
        </div>
        <p className="max-w-xs text-[13px] leading-relaxed text-zinc-500">
          Vice-campeão e terceiro colocado recebem a medalha simbólica do Unidos Acamp.
        </p>
      </Cartao>

      <div className="grid gap-4 lg:grid-cols-2">
        {BLOCOS.map(({ titulo, itens }) => (
          <Cartao key={titulo} className="p-5">
            <h3 className="text-[13px] font-medium text-zinc-200">{titulo}</h3>
            <ul className="mt-3 space-y-2.5">
              {itens.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-zinc-400">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-zinc-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Cartao>
        ))}
      </div>

      <p className="px-1 text-[12px] leading-relaxed text-zinc-600">
        Casos omissos são resolvidos pela organização do Unidos Acamp. A decisão da mesa é final.
      </p>
    </div>
  )
}
