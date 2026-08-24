import { useEffect, useState } from 'react'
import { Dices } from 'lucide-react'
import { inscrever, lerSituacaoDaInscricao } from '../lib/nuvem.js'
import { Botao, Cartao, Confete, NumeroAnimado } from './ui.jsx'
import { tocar } from '../lib/som.js'

const CAMPO =
  'contorno w-full rounded-lg bg-papel-claro px-3.5 py-3.5 text-[16px] font-medium placeholder:text-tinta-fraca focus:bg-lima/20 focus:outline-none'

/**
 * Tela que o QR abre. Pede só o nome: os times são sorteados depois, quando a
 * organização já sabe quantas pessoas entraram.
 */
export function Inscricao({ aoSair }) {
  const [nome, setNome] = useState('')
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
      const resultado = await inscrever({ nome: nome.trim() })
      setPronto({ nome: nome.trim(), total: resultado.total })
      tocar('fanfarra')
    } catch (falha) {
      setErro(falha.message)
      tocar('erro')
    } finally {
      setEnviando(false)
    }
  }

  /* ------------------------------- confirmado ------------------------------ */

  if (pronto) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="animar-carimbo contorno sombra-g relative overflow-hidden rounded-xl bg-lima px-6 py-9 text-center text-carvao">
          <div className="varredura absolute inset-0" aria-hidden="true" />
          <Confete pecas={20} />
          <span className="brilho-passando" aria-hidden="true" />
          <p className="rotulo relative text-[11px]">Você está dentro</p>
          <h2 className="relative mt-4 text-4xl break-words">{pronto.nome}</h2>
          {/* O número do inscrito sobe do zero: é a hora da ficha caindo. */}
          <p className="num relative mt-5 font-display text-6xl leading-none">
            #<NumeroAnimado valor={pronto.total} deZero duracao={900} />
          </p>
          <p className="rotulo relative mt-2 text-[10px] opacity-70">inscrito número</p>
          <div className="relative mt-6 flex items-center justify-center gap-2 text-[13px] font-bold">
            <span className="animar-tremer">
              <Dices className="size-4" strokeWidth={2.5} />
            </span>
            <span>Seu time sai no sorteio</span>
          </div>
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
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 text-center">
        <span className="contorno rotulo inline-block rounded-md bg-tinta px-2 py-1 text-[10px] text-papel-claro">
          Unidos Acamp
        </span>
        <h1 className="mt-4 text-[2.4rem] leading-[0.9] min-[380px]:text-[2.9rem]">
          Bora jogar
          <br />
          <span className="marcado">FIFA?</span>
        </h1>
        <p className="mt-4 text-[15px] leading-snug text-tinta-media">
          Escreve seu nome e pronto, você está no campeonato. Quem ganhar leva{' '}
          <strong className="text-tinta">R$ 100</strong>.
        </p>
      </div>

      <Cartao className="p-5">
        <form onSubmit={enviar} className="space-y-4">
          <label className="block">
            <span className="rotulo mb-2 block text-[10px] text-tinta-media">Seu nome</span>
            <input
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Ex.: João Victor"
              maxLength={40}
              autoComplete="name"
              autoFocus
              className={CAMPO}
            />
          </label>

          {erro ? (
            <p className="contorno rounded-md bg-rosa px-3 py-2 text-[13px] font-bold text-white">{erro}</p>
          ) : null}

          <Botao type="submit" disabled={!nome.trim() || enviando} className="w-full py-3.5 text-[13px]">
            {enviando ? 'Inscrevendo…' : 'Quero jogar'}
          </Botao>
        </form>

        <div className="contorno mt-4 flex gap-2.5 rounded-lg bg-cobalto/10 p-3">
          <Dices className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
          <p className="text-[12px] leading-snug text-tinta-media">
            <strong className="text-tinta">Os times são sorteados.</strong> Quando as inscrições fecharem, a
            organização sorteia um time do FC 26 para cada jogador — ninguém escolhe, e ninguém repete.
          </p>
        </div>
      </Cartao>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <p className="text-[12px] text-tinta-media">
          {situacao ? (
            <>
              <span className="num font-bold text-tinta">
                <NumeroAnimado valor={situacao.inscritos} deZero />
              </span>{' '}
              já se inscreveram
            </>
          ) : (
            'Carregando…'
          )}
        </p>
        <button type="button" onClick={aoSair} className="rotulo text-[10px] text-tinta-media underline">
          Ver o campeonato
        </button>
      </div>
    </div>
  )
}
