import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ImagePlus, Lock, Plus, Search, X } from 'lucide-react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { inscrever, lerSituacaoDaInscricao } from '../lib/nuvem.js'
import { prepararEscudo } from '../lib/imagem.js'
import { Botao, Cartao, EscudoTime } from './ui.jsx'

const CAMPO =
  'contorno w-full rounded-lg bg-papel-claro px-3.5 py-3 text-[15px] font-medium placeholder:text-tinta-fraca focus:bg-lima/20 focus:outline-none'

const TIMES_DE_ENTRADA = 12

/* -------------------------------------------------------------------------- */
/* Cadastro de um time que não está na lista                                  */
/* -------------------------------------------------------------------------- */

function TimeNovo({ valor, aoMudar, aoCancelar }) {
  const entrada = useRef(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const enviarEscudo = async (evento) => {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    setErro(null)
    setCarregando(true)
    try {
      aoMudar({ ...valor, escudo: await prepararEscudo(arquivo) })
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="contorno rounded-lg bg-cobalto/10 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rotulo text-[10px]">Time novo</span>
        <button type="button" onClick={aoCancelar} className="rotulo flex items-center gap-1 text-[10px] underline">
          <X className="size-3" strokeWidth={3} />
          usar um da lista
        </button>
      </div>

      <div className="flex items-center gap-3">
        <EscudoTime tamanho="md" time={{ nome: valor.nome || '??', cores: valor.cores, escudo: valor.escudo }} />
        <input
          value={valor.nome}
          onChange={(evento) => aoMudar({ ...valor, nome: evento.target.value })}
          placeholder="Nome do time"
          maxLength={40}
          className={CAMPO}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="rotulo text-[10px] text-tinta-media">Cores</span>
          {valor.cores.map((cor, indice) => (
            <input
              key={indice}
              type="color"
              value={cor}
              onChange={(evento) =>
                aoMudar({
                  ...valor,
                  cores: valor.cores.map((atual, posicao) => (posicao === indice ? evento.target.value : atual)),
                })
              }
              className="contorno size-9 cursor-pointer rounded-md bg-transparent p-0"
              aria-label={`Cor ${indice + 1} do time`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={carregando}
          className="rotulo flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] text-tinta-media underline"
        >
          <ImagePlus className="size-3.5" strokeWidth={2.5} />
          {carregando ? 'abrindo…' : valor.escudo ? 'trocar escudo' : 'enviar escudo (opcional)'}
        </button>
        <input ref={entrada} type="file" accept="image/*" onChange={enviarEscudo} className="hidden" />
      </div>

      {erro ? <p className="mt-2 text-[11px] font-bold text-rosa">{erro}</p> : null}
      <p className="mt-2 text-[11px] leading-snug text-tinta-media">
        Sem escudo o time aparece com as iniciais e as cores que você escolher. Vale time de clube ou seleção —{' '}
        <strong className="text-tinta">seleção de lendas não entra</strong>.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Escolha entre os times livres                                              */
/* -------------------------------------------------------------------------- */

function EscolhaDeTime({ selecionado, aoSelecionar, ocupados, aoCriarTime }) {
  const { times } = useTimes()
  const [busca, setBusca] = useState('')
  const [verTodos, setVerTodos] = useState(false)

  const encontrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const lista = termo
      ? times.filter((time) => `${time.nome} ${time.liga}`.toLowerCase().includes(termo))
      : times
    // Quem já foi escolhido vai para o fim, ainda visível, mas fora do caminho.
    return [...lista].sort((a, b) => Number(ocupados.has(a.id)) - Number(ocupados.has(b.id)))
  }, [times, busca, ocupados])

  const buscando = busca.trim().length > 0
  const visiveis = buscando || verTodos ? encontrados : encontrados.slice(0, TIMES_DE_ENTRADA)
  const escondidos = encontrados.length - visiveis.length
  const livres = times.filter((time) => !ocupados.has(time.id)).length

  return (
    <div>
      <div className="relative mb-2">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-fraca"
          strokeWidth={2.5}
        />
        <input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder={`Procurar entre ${livres} times livres`}
          className={`${CAMPO} pl-9`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visiveis.map((time) => {
          const ocupado = ocupados.has(time.id)
          const escolhido = time.id === selecionado
          return (
            <button
              key={time.id}
              type="button"
              disabled={ocupado}
              onClick={() => aoSelecionar(time.id)}
              title={ocupado ? `${time.nome} já foi escolhido` : time.nome}
              className={`contorno flex items-center gap-2 rounded-lg p-2 text-left transition-colors ${
                ocupado
                  ? 'cursor-not-allowed border-tinta-fraca bg-papel-escuro opacity-55'
                  : escolhido
                    ? 'sombra-p bg-lima text-carvao'
                    : 'bg-papel-claro'
              }`}
            >
              <EscudoTime timeId={time.id} tamanho="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] leading-tight font-bold">{time.nome}</span>
                <span className={`block truncate text-[10px] ${escolhido ? 'opacity-70' : 'text-tinta-fraca'}`}>
                  {ocupado ? 'já escolhido' : time.liga}
                </span>
              </span>
              {ocupado ? <Lock className="size-3.5 shrink-0 text-tinta-fraca" strokeWidth={2.5} /> : null}
              {escolhido && !ocupado ? <Check className="size-4 shrink-0" strokeWidth={3} /> : null}
            </button>
          )
        })}

        {!visiveis.length ? (
          <p className="col-span-full py-6 text-center text-[13px] text-tinta-media">Nenhum time com esse nome.</p>
        ) : null}
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {escondidos > 0 ? (
          <button
            type="button"
            onClick={() => setVerTodos(true)}
            className="contorno rotulo w-full rounded-lg bg-papel-escuro py-2.5 text-[10px]"
          >
            Ver todos os {encontrados.length}
          </button>
        ) : null}
        <button
          type="button"
          onClick={aoCriarTime}
          className={`contorno rotulo sombra-p w-full rounded-lg bg-cobalto py-2.5 text-[10px] text-white ${
            escondidos > 0 ? '' : 'sm:col-span-2'
          }`}
        >
          <Plus className="mr-1 inline size-3.5" strokeWidth={3} />
          Meu time não está aqui
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export function Inscricao({ aoSair, participantes = [] }) {
  const { times, buscarTime } = useTimes()

  // Um time por pessoa: o que já foi escolhido sai de circulação.
  const ocupados = useMemo(
    () => new Set(participantes.map((participante) => participante.timeId)),
    [participantes],
  )

  const [nome, setNome] = useState('')
  const [timeId, setTimeId] = useState(null)
  const [timeNovo, setTimeNovo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [pronto, setPronto] = useState(null)
  const [situacao, setSituacao] = useState(null)

  useEffect(() => {
    lerSituacaoDaInscricao()
      .then(setSituacao)
      .catch(() => setSituacao(null))
  }, [pronto])

  // Se alguém pegar o time enquanto a pessoa preenche, a escolha é solta.
  useEffect(() => {
    if (timeId && ocupados.has(timeId)) {
      setTimeId(null)
      setErro('Alguém acabou de pegar esse time. Escolhe outro.')
    }
  }, [ocupados, timeId])

  const escolhaFeita = Boolean(timeNovo?.nome.trim() || timeId)

  const enviar = async (evento) => {
    evento.preventDefault()
    if (!nome.trim() || !escolhaFeita || enviando) return
    setEnviando(true)
    setErro(null)
    try {
      const resultado = await inscrever({
        nome: nome.trim(),
        timeId: timeNovo ? null : timeId,
        timeNovo: timeNovo ? { nome: timeNovo.nome.trim(), cores: timeNovo.cores, escudo: timeNovo.escudo } : null,
      })
      setPronto({ nome: nome.trim(), timeId: resultado.timeId, total: resultado.total, timeNovo })
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEnviando(false)
    }
  }

  /* ------------------------------- confirmado ------------------------------ */

  if (pronto) {
    const time = pronto.timeNovo
      ? { nome: pronto.timeNovo.nome, cores: pronto.timeNovo.cores, escudo: pronto.timeNovo.escudo }
      : buscarTime(pronto.timeId)
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="animar-carimbo contorno sombra-g relative overflow-hidden rounded-xl bg-lima px-6 py-8 text-center text-carvao">
          <span className="brilho-passando" aria-hidden="true" />
          <p className="rotulo relative text-[11px]">Inscrição confirmada</p>
          <div className="relative mt-4 flex justify-center">
            <span className="animar-tremer">
              <EscudoTime tamanho="lg" time={time} />
            </span>
          </div>
          <h2 className="relative mt-4 text-3xl break-words">{pronto.nome}</h2>
          <p className="relative mt-2 text-[14px] font-bold">{time.nome}</p>
          <p className="relative mt-4 text-[13px] font-medium opacity-70">
            Você é o inscrito número {pronto.total}. Esse time agora é só seu — ninguém mais pode escolher.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Botao
            variante="papel"
            onClick={() => {
              setPronto(null)
              setNome('')
              setTimeId(null)
              setTimeNovo(null)
            }}
          >
            Inscrever outra pessoa
          </Botao>
          <Botao variante="cobalto" onClick={aoSair}>
            Ver o campeonato
          </Botao>
        </div>
      </div>
    )
  }

  /* ------------------------------- encerrada ------------------------------- */

  if (situacao?.sorteado) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Cartao cor="laranja" className="p-6 text-center">
          <h2 className="text-2xl text-white">Inscrições encerradas</h2>
          <p className="mt-3 text-[14px] font-medium text-white/85">
            As chaves já foram sorteadas com {situacao.inscritos} jogadores. Fala com quem está organizando.
          </p>
        </Cartao>
        <div className="mt-4 flex justify-center">
          <Botao onClick={aoSair}>Ver o chaveamento</Botao>
        </div>
      </div>
    )
  }

  /* -------------------------------- formulário ------------------------------ */

  const timeEscolhido = timeNovo
    ? { nome: timeNovo.nome || 'Time novo', cores: timeNovo.cores, escudo: timeNovo.escudo }
    : timeId
      ? buscarTime(timeId)
      : null

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-5 text-center">
        <span className="contorno rotulo inline-block rounded-md bg-tinta px-2 py-1 text-[10px] text-papel-claro">
          Unidos Acamp
        </span>
        <h1 className="mt-3 text-[2.2rem] leading-[0.9] min-[380px]:text-[2.6rem]">
          Bora jogar
          <br />
          <span className="marcado">FIFA?</span>
        </h1>
        <p className="mt-3 text-[14px] leading-snug text-tinta-media">
          Coloca seu nome, escolhe o time e pronto. Quem ganhar leva <strong className="text-tinta">R$ 100</strong>.
        </p>
      </div>

      <Cartao className="p-4 sm:p-5">
        <form onSubmit={enviar} className="space-y-4">
          <label className="block">
            <span className="rotulo mb-1.5 block text-[10px] text-tinta-media">Seu nome</span>
            <input
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Ex.: João Victor"
              maxLength={40}
              autoComplete="name"
              className={CAMPO}
            />
          </label>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="rotulo text-[10px] text-tinta-media">Time que vai usar</span>
              {timeEscolhido ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold">
                  <EscudoTime tamanho="sm" time={timeEscolhido} />
                  <span className="max-w-32 truncate">{timeEscolhido.nome}</span>
                </span>
              ) : (
                <span className="text-[11px] text-tinta-fraca">nenhum ainda</span>
              )}
            </div>

            {timeNovo ? (
              <TimeNovo valor={timeNovo} aoMudar={setTimeNovo} aoCancelar={() => setTimeNovo(null)} />
            ) : (
              <EscolhaDeTime
                selecionado={timeId}
                aoSelecionar={setTimeId}
                ocupados={ocupados}
                aoCriarTime={() => {
                  setTimeId(null)
                  setTimeNovo({ nome: '', cores: ['#22c55e', '#0f172a'], escudo: null })
                }}
              />
            )}
          </div>

          {erro ? (
            <p className="contorno rounded-md bg-rosa px-3 py-2 text-[13px] font-bold text-white">{erro}</p>
          ) : null}

          <Botao
            type="submit"
            disabled={!nome.trim() || !escolhaFeita || enviando}
            className="w-full py-3 text-[13px]"
          >
            {enviando ? 'Inscrevendo…' : 'Confirmar inscrição'}
          </Botao>
        </form>
      </Cartao>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <p className="text-[12px] text-tinta-media">
          {situacao ? `${situacao.inscritos} inscritos · ${times.length - ocupados.size} times livres` : 'Carregando…'}
        </p>
        <button type="button" onClick={aoSair} className="rotulo text-[10px] text-tinta-media underline">
          Ver o campeonato
        </button>
      </div>
    </div>
  )
}
