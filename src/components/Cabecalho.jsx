import { Moon, Sun } from 'lucide-react'
import { BarraProgresso } from './ui.jsx'

/** Mostra que o placar está chegando do servidor, e não só deste aparelho. */
function SeloAoVivo({ nuvem }) {
  if (!nuvem?.configurada) return null

  const conectado = nuvem.conectado && !nuvem.erro
  return (
    <span
      className={`contorno rotulo inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] ${
        conectado ? 'bg-rosa text-white' : 'bg-papel-escuro text-tinta-media'
      }`}
      title={nuvem.erro ?? (conectado ? 'Recebendo atualizações em tempo real' : 'Reconectando ao servidor')}
    >
      <span className={`size-1.5 rounded-full ${conectado ? 'animar-piscar bg-white' : 'bg-tinta-fraca'}`} />
      {conectado ? 'Ao vivo' : 'Conectando'}
    </span>
  )
}

function Caixa({ valor, rotulo, cor = 'papel' }) {
  const fundos = { papel: 'bg-papel-claro', lima: 'bg-lima text-carvao', cobalto: 'bg-cobalto text-white' }
  return (
    <div className={`contorno sombra-p min-w-24 flex-1 rounded-lg px-3 py-2.5 ${fundos[cor]}`}>
      <p className="num font-display text-2xl leading-none">{valor}</p>
      <p className={`rotulo mt-1.5 text-[9px] ${cor === 'papel' ? 'text-tinta-media' : 'opacity-70'}`}>{rotulo}</p>
    </div>
  )
}

function BotaoTema({ tema, aoAlternar }) {
  const escuro = tema === 'escuro'
  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-label={escuro ? 'Mudar para o tema claro' : 'Mudar para o tema preto'}
      title={escuro ? 'Tema claro' : 'Tema preto'}
      className={`contorno sombra-p apertar rotulo inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] ${
        escuro ? 'bg-lima text-carvao' : 'bg-papel-claro'
      }`}
    >
      {escuro ? <Sun className="size-3.5" strokeWidth={2.5} /> : <Moon className="size-3.5" strokeWidth={2.5} />}
      {escuro ? 'Claro' : 'Preto'}
    </button>
  )
}

export function Cabecalho({ totalParticipantes, totalGols, torneio, tema, aoAlternarTema, nuvem }) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-7 pb-5 sm:px-6 sm:pt-10">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="contorno rotulo rounded-md bg-tinta px-2 py-1 text-[10px] text-papel-claro">
              Unidos Acamp
            </span>
            <SeloAoVivo nuvem={nuvem} />
            <BotaoTema tema={tema} aoAlternar={aoAlternarTema} />
          </div>

          {/* Passo intermediário em 380px: em telas de 320px o corpo útil tem
              288px, e "Campeonato" em Archivo Black 48px não cabe. */}
          <h1 className="mt-4 text-[2.4rem] leading-[0.86] min-[380px]:text-[3rem] sm:text-[5.5rem]">
            Campeonato
            <br />
            <span className="marcado">FIFA</span>
          </h1>

          <p className="mt-4 max-w-md text-[14px] leading-snug text-tinta-media">
            Mata-mata entre a galera do acampamento. Perdeu na primeira fase? Calma, tem repescagem.
          </p>
        </div>

        {/* Premiação */}
        {/* Sem rotação no celular: girar um bloco de largura total só faz ele
            passar da borda da tela. */}
        <div className="girar-0 contorno sombra-g relative w-full rounded-xl bg-laranja px-5 py-4 text-white sm:girar-2 lg:w-64">
          <div className="listrado absolute inset-0 rounded-[10px]" aria-hidden="true" />
          <div className="relative">
            <p className="rotulo text-[10px] text-white/80">Prêmio do campeão</p>
            <p className="num mt-1.5 font-display text-5xl leading-none">R$100</p>
            <p className="mt-2 text-[12px] leading-snug font-medium">na mão, na noite de encerramento</p>
          </div>
        </div>
      </div>

      {/* Placar geral */}
      <div className="mt-7 flex flex-wrap items-stretch gap-3">
        <Caixa valor={totalParticipantes} rotulo="Jogadores" />
        <Caixa valor={totalGols} rotulo="Gols" cor="lima" />
        <Caixa valor={`${torneio.partidasFinalizadas}/${torneio.totalPartidas}`} rotulo="Jogos" />

        {torneio.ativo ? (
          <div className="contorno sombra-p min-w-52 flex-[2] rounded-lg bg-papel-claro px-3 py-2.5">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="rotulo text-[9px] text-tinta-media">Andamento do campeonato</p>
              <p className="num font-display text-[13px]">{torneio.progresso}%</p>
            </div>
            <BarraProgresso valor={torneio.progresso} />
          </div>
        ) : null}
      </div>
    </header>
  )
}
