import { useState } from 'react'
import { Pencil, QrCode, Trash2, UserPlus } from 'lucide-react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { Botao, BotaoTexto, Cartao, EscudoTime, Etiqueta } from './ui.jsx'

const CAMPO =
  'contorno w-full rounded-lg bg-papel-claro px-3 py-2.5 text-[14px] font-medium placeholder:text-tinta-fraca focus:bg-lima/20 focus:outline-none'

/** Veio do QR quando o id foi gerado pelo banco. */
const veioDoQr = (participante) => participante.id.startsWith('qr')

function horaDaInscricao(iso) {
  if (!iso) return null
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return null
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function Linha({ participante, posicao, aoAtualizar, aoRemover }) {
  const { times, buscarTime } = useTimes()
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(participante.nome)

  const time = buscarTime(participante.timeId)
  const temTime = participante.timeId !== 'sem-time'
  const hora = horaDaInscricao(participante.em)

  if (editando) {
    return (
      <li className="contorno flex flex-wrap items-center gap-2 rounded-lg bg-lima/25 p-2">
        <input value={nome} onChange={(evento) => setNome(evento.target.value)} className={`${CAMPO} flex-1`} />
        <Botao
          onClick={() => {
            if (nome.trim()) aoAtualizar(participante.id, { nome: nome.trim() })
            setEditando(false)
          }}
        >
          Salvar
        </Botao>
        <Botao variante="papel" onClick={() => setEditando(false)}>
          Cancelar
        </Botao>
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-2.5 rounded-lg border-2 border-transparent px-2 py-2 transition-colors hover:border-tinta hover:bg-papel-claro">
      <span className="num w-6 shrink-0 text-right font-display text-[12px] text-tinta-fraca">{posicao}</span>

      {temTime ? (
        <EscudoTime timeId={participante.timeId} tamanho="sm" />
      ) : (
        <span className="contorno grid size-7 shrink-0 place-items-center rounded-md border-dashed bg-papel text-[9px] text-tinta-fraca">
          ?
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold">{participante.nome}</p>
        <p className="truncate text-[11px] text-tinta-fraca">
          {temTime ? time.nome : 'time sai no sorteio'}
          {hora ? ` · ${hora}` : null}
        </p>
      </div>

      {veioDoQr(participante) ? (
        <span className="contorno hidden shrink-0 rounded-md bg-cobalto p-1 text-white sm:block" title="Inscreveu-se pelo QR">
          <QrCode className="size-3" strokeWidth={2.5} />
        </span>
      ) : null}

      <div className="acoes-linha flex shrink-0 gap-0.5 transition-opacity">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="grid size-8 place-items-center rounded-md border-2 border-transparent transition-colors hover:border-tinta hover:bg-lima hover:text-carvao"
          aria-label={`Editar ${participante.nome}`}
        >
          <Pencil className="size-3.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => aoRemover(participante)}
          className="grid size-8 place-items-center rounded-md border-2 border-transparent transition-colors hover:border-tinta hover:bg-rosa hover:text-white"
          aria-label={`Remover ${participante.nome}`}
        >
          <Trash2 className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </li>
  )
}

function CadastroManual({ aoCadastrar }) {
  const [nome, setNome] = useState('')
  const [aberto, setAberto] = useState(false)

  if (!aberto) {
    return (
      <BotaoTexto icone={UserPlus} onClick={() => setAberto(true)} className="mt-3">
        Inscrever alguém na mão
      </BotaoTexto>
    )
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault()
        if (!nome.trim()) return
        aoCadastrar({ nome, timeId: 'sem-time' })
        setNome('')
      }}
      className="mt-3 flex flex-wrap gap-2"
    >
      <input
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Nome de quem não escaneou o QR"
        maxLength={40}
        autoFocus
        className={`${CAMPO} min-w-44 flex-1`}
      />
      <Botao type="submit" disabled={!nome.trim()}>
        Inscrever
      </Botao>
      <Botao variante="papel" onClick={() => setAberto(false)}>
        Fechar
      </Botao>
    </form>
  )
}

/**
 * Quem está inscrito, na ordem em que entrou. É por aqui que a organização
 * acompanha as inscrições chegando durante o acampamento — a lista se atualiza
 * sozinha conforme a galera escaneia o QR.
 */
export function ListaDeInscritos({ participantes, torneio, acoes, aoPedirConfirmacao }) {
  const doQr = participantes.filter(veioDoQr).length
  const naMao = participantes.length - doQr
  const semTime = participantes.filter((participante) => participante.timeId === 'sem-time').length

  return (
    <Cartao className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-[28px]">Quem está inscrito</h2>
          <p className="mt-2 text-[14px] leading-snug text-tinta-media">
            A lista enche sozinha conforme a galera escaneia o QR — não precisa recarregar.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Etiqueta cor="cobalto">{doQr} pelo QR</Etiqueta>
            {naMao > 0 ? <Etiqueta cor="papel">{naMao} na mão</Etiqueta> : null}
            {semTime > 0 ? <Etiqueta cor="laranja">{semTime} sem time</Etiqueta> : null}
          </div>
        </div>

        <div className="contorno shrink-0 rounded-lg bg-lima px-4 py-2.5 text-center text-carvao">
          <p className="num font-display text-4xl leading-none">{participantes.length}</p>
          <p className="rotulo mt-1 text-[9px] opacity-70">inscritos</p>
        </div>
      </div>

      {participantes.length ? (
        <ul className="grid gap-1 lg:grid-cols-2">
          {participantes.map((participante, indice) => (
            <Linha
              key={participante.id}
              participante={participante}
              posicao={indice + 1}
              aoAtualizar={acoes.atualizarParticipante}
              aoRemover={(alvo) =>
                aoPedirConfirmacao({
                  titulo: `Tirar ${alvo.nome}?`,
                  descricao: torneio.ativo
                    ? 'Ele já está no chaveamento. Tirar agora apaga o sorteio e todos os placares lançados.'
                    : 'A pessoa sai da lista de inscritos.',
                  textoConfirmar: 'Pode tirar',
                  acao: () => acoes.removerParticipante(alvo.id),
                })
              }
            />
          ))}
        </ul>
      ) : (
        <div className="contorno rounded-lg border-dashed px-4 py-10 text-center">
          <p className="text-[15px] font-bold">Ninguém se inscreveu ainda</p>
          <p className="mt-1.5 text-[13px] text-tinta-media">
            Mande o convite ou mostre o QR — os nomes aparecem aqui na hora.
          </p>
        </div>
      )}

      <CadastroManual aoCadastrar={acoes.adicionarParticipante} />
    </Cartao>
  )
}
