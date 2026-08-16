import { useState } from 'react'
import { KeyRound, Lock, LogOut, RefreshCw } from 'lucide-react'
import { Botao, BotaoTexto, Cartao } from './ui.jsx'

const CAMPO =
  'contorno w-full rounded-lg bg-papel-claro px-3 py-2.5 text-[14px] font-medium placeholder:text-tinta-fraca focus:bg-lima/20 focus:outline-none'

/** Tela que aparece no lugar do Painel Admin enquanto o PIN não é informado. */
export function Destravar({ aoDestravar }) {
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState(null)
  const [conferindo, setConferindo] = useState(false)

  const enviar = async (evento) => {
    evento.preventDefault()
    if (!pin.trim() || conferindo) return
    setConferindo(true)
    setErro(null)
    try {
      const certo = await aoDestravar(pin.trim())
      if (!certo) setErro('PIN incorreto. Confira com quem organiza o campeonato.')
    } catch (falha) {
      setErro(falha.message || 'Não consegui falar com o servidor.')
    } finally {
      setConferindo(false)
    }
  }

  return (
    <Cartao className="mx-auto max-w-md p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="contorno grid size-11 shrink-0 place-items-center rounded-lg bg-lima text-carvao">
          <Lock className="size-5" strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="text-2xl">Painel do organizador</h2>
          <p className="mt-1 text-[13px] text-tinta-media">Só quem tem o PIN altera o campeonato.</p>
        </div>
      </div>

      <form onSubmit={enviar} className="flex gap-2">
        <input
          value={pin}
          onChange={(evento) => setPin(evento.target.value)}
          placeholder="PIN do organizador"
          autoComplete="off"
          className={`${CAMPO} font-display tracking-[0.15em] uppercase`}
        />
        <Botao type="submit" icone={conferindo ? RefreshCw : KeyRound} disabled={!pin.trim() || conferindo}>
          {conferindo ? 'Conferindo' : 'Entrar'}
        </Botao>
      </form>

      {erro ? (
        <p className="contorno mt-3 rounded-md bg-rosa px-2.5 py-1.5 text-[12px] font-bold text-white">{erro}</p>
      ) : null}

      <p className="mt-4 text-[12px] leading-snug text-tinta-media">
        Sem o PIN você continua vendo tudo: chaveamento, repescagem, estatísticas e regras acompanham o placar ao
        vivo sozinhos.
      </p>
    </Cartao>
  )
}

/** Faixa do topo do painel quando já está destravado. */
export function BarraDoOrganizador({ nuvem, aoTravar, aoTrocarPin }) {
  const [trocando, setTrocando] = useState(false)
  const [novoPin, setNovoPin] = useState('')
  const [aviso, setAviso] = useState(null)

  const confirmar = async () => {
    if (novoPin.trim().length < 6) {
      setAviso({ texto: 'O PIN novo precisa de pelo menos 6 caracteres.', erro: true })
      return
    }
    try {
      const trocou = await aoTrocarPin(novoPin.trim())
      setAviso(
        trocou
          ? { texto: 'PIN alterado. Avise quem mais organiza.', erro: false }
          : { texto: 'Não consegui trocar o PIN.', erro: true },
      )
      if (trocou) {
        setNovoPin('')
        setTrocando(false)
      }
    } catch (falha) {
      setAviso({ texto: falha.message, erro: true })
    }
  }

  return (
    <Cartao cor="lima" className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="contorno grid size-9 shrink-0 place-items-center rounded-lg bg-carvao text-lima">
          <KeyRound className="size-4" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-carvao">Você está como organizador</p>
          <p className="text-[12px] text-carvao/70">
            {nuvem.erro
              ? nuvem.erro
              : nuvem.sincronizando
                ? 'Enviando alterações…'
                : nuvem.versao
                  ? `Tudo salvo no servidor · versão ${nuvem.versao}`
                  : 'Conectando ao servidor…'}
          </p>
        </div>
        <BotaoTexto onClick={() => setTrocando((atual) => !atual)} className="text-carvao">
          Trocar PIN
        </BotaoTexto>
        <BotaoTexto icone={LogOut} onClick={aoTravar} className="text-carvao">
          Sair
        </BotaoTexto>
      </div>

      {trocando ? (
        <div className="mt-3 flex gap-2">
          <input
            value={novoPin}
            onChange={(evento) => setNovoPin(evento.target.value)}
            placeholder="PIN novo (mínimo 6 caracteres)"
            className={CAMPO}
          />
          <Botao variante="cobalto" onClick={confirmar}>
            Confirmar
          </Botao>
        </div>
      ) : null}

      {aviso ? (
        <p
          className={`contorno mt-3 inline-block rounded-md px-2.5 py-1.5 text-[12px] font-bold ${
            aviso.erro ? 'bg-rosa text-white' : 'bg-carvao text-lima'
          }`}
        >
          {aviso.texto}
        </p>
      ) : null}
    </Cartao>
  )
}
