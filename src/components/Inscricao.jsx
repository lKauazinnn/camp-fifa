import { useEffect, useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { inscrever, lerSituacaoDaInscricao } from '../lib/nuvem.js'
import { Botao, Cartao, EscudoTime } from './ui.jsx'

const CAMPO =
  'contorno w-full rounded-lg bg-papel-claro px-3.5 py-3 text-[15px] font-medium placeholder:text-tinta-fraca focus:bg-lima/20 focus:outline-none'

const TIMES_DE_ENTRADA = 12

function EscolhaDeTime({ selecionado, aoSelecionar }) {
  const { times } = useTimes()
  const [busca, setBusca] = useState('')
  const [verTodos, setVerTodos] = useState(false)

  const encontrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return times
    return times.filter((time) => `${time.nome} ${time.liga}`.toLowerCase().includes(termo))
  }, [times, busca])

  // Sem busca, mostra só um punhado: no celular, uma lista com rolagem própria
  // dentro da página que já rola é péssima de usar no dedo.
  const buscando = busca.trim().length > 0
  const visiveis = buscando || verTodos ? encontrados : encontrados.slice(0, TIMES_DE_ENTRADA)
  const escondidos = encontrados.length - visiveis.length

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
          placeholder="Procurar time"
          className={`${CAMPO} pl-9`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visiveis.map((time) => {
          const escolhido = time.id === selecionado
          return (
            <button
              key={time.id}
              type="button"
              onClick={() => aoSelecionar(time.id)}
              className={`contorno flex items-center gap-2 rounded-lg p-2 text-left transition-colors ${
                escolhido ? 'sombra-p bg-lima text-carvao' : 'bg-papel-claro'
              }`}
            >
              <EscudoTime timeId={time.id} tamanho="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] leading-tight font-bold">{time.nome}</span>
                <span className={`block truncate text-[10px] ${escolhido ? 'opacity-70' : 'text-tinta-fraca'}`}>
                  {time.liga}
                </span>
              </span>
              {escolhido ? <Check className="size-4 shrink-0" strokeWidth={3} /> : null}
            </button>
          )
        })}
        {!visiveis.length ? (
          <p className="col-span-full py-6 text-center text-[13px] text-tinta-media">Nenhum time com esse nome.</p>
        ) : null}
      </div>

      {escondidos > 0 ? (
        <button
          type="button"
          onClick={() => setVerTodos(true)}
          className="contorno rotulo mt-2 w-full rounded-lg bg-papel-escuro py-2.5 text-[10px]"
        >
          Ver todos os {encontrados.length} times
        </button>
      ) : null}
    </div>
  )
}

export function Inscricao({ aoSair }) {
  const { times, buscarTime } = useTimes()
  const [nome, setNome] = useState('')
  const [timeId, setTimeId] = useState(times[0]?.id ?? 'sem-time')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [pronto, setPronto] = useState(null)
  const [situacao, setSituacao] = useState(null)

  useEffect(() => {
    lerSituacaoDaInscricao()
      .then(setSituacao)
      .catch(() => setSituacao(null))
  }, [pronto])

  const enviar = async (evento) => {
    evento.preventDefault()
    if (!nome.trim() || enviando) return
    setEnviando(true)
    setErro(null)
    try {
      const total = await inscrever({ nome: nome.trim(), timeId })
      setPronto({ nome: nome.trim(), timeId, total })
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEnviando(false)
    }
  }

  /* ------------------------------- confirmado ------------------------------ */

  if (pronto) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="animar-carimbo contorno sombra-g relative overflow-hidden rounded-xl bg-lima px-6 py-8 text-center text-carvao">
          <span className="brilho-passando" aria-hidden="true" />
          <p className="rotulo relative text-[11px]">Inscrição confirmada</p>
          <div className="relative mt-4 flex justify-center">
            <span className="animar-tremer">
              <EscudoTime timeId={pronto.timeId} tamanho="lg" />
            </span>
          </div>
          <h2 className="relative mt-4 text-3xl break-words">{pronto.nome}</h2>
          <p className="relative mt-2 text-[14px] font-bold">{buscarTime(pronto.timeId).nome}</p>
          <p className="relative mt-4 text-[13px] font-medium opacity-70">
            Você é o inscrito número {pronto.total}. Agora é esperar o sorteio das chaves.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Botao
            variante="papel"
            onClick={() => {
              setPronto(null)
              setNome('')
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
            <div className="mb-1.5 flex items-center justify-between">
              <span className="rotulo text-[10px] text-tinta-media">Time que vai usar</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold">
                <EscudoTime timeId={timeId} tamanho="sm" />
                <span className="max-w-32 truncate">{buscarTime(timeId).nome}</span>
              </span>
            </div>
            <EscolhaDeTime selecionado={timeId} aoSelecionar={setTimeId} />
          </div>

          {erro ? (
            <p className="contorno rounded-md bg-rosa px-3 py-2 text-[13px] font-bold text-white">{erro}</p>
          ) : null}

          <Botao type="submit" disabled={!nome.trim() || enviando} className="w-full py-3 text-[13px]">
            {enviando ? 'Inscrevendo…' : 'Confirmar inscrição'}
          </Botao>
        </form>
      </Cartao>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <p className="text-[12px] text-tinta-media">
          {situacao ? `${situacao.inscritos} já se inscreveram` : 'Carregando inscritos…'}
        </p>
        <button type="button" onClick={aoSair} className="rotulo text-[10px] text-tinta-media underline">
          Ver o campeonato
        </button>
      </div>
    </div>
  )
}
