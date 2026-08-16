import { useMemo, useRef, useState } from 'react'
import { ImagePlus, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react'
import { useTimes } from '../contexto/TimesContexto.jsx'
import { prepararEscudo, tamanhoLegivel, validarEnderecoDeEscudo } from '../lib/imagem.js'
import { Botao, BotaoTexto, Cartao, EscudoTime, Etiqueta, TituloSecao } from './ui.jsx'

const CAMPO =
  'contorno w-full rounded-lg bg-papel-claro px-3 py-2.5 text-[14px] font-medium placeholder:text-tinta-fraca focus:bg-lima/20 focus:outline-none'

function novoIdDeTime(nome) {
  const base = nome
    .toLowerCase()
    .normalize('NFD')
    // Remove os acentos separados pelo NFD para "São Paulo" virar "sao-paulo".
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 24)
  return `meu-${base || 'time'}-${Math.random().toString(36).slice(2, 6)}`
}

/* -------------------------------------------------------------------------- */
/* Escolha do escudo: arquivo do aparelho ou endereço na internet             */
/* -------------------------------------------------------------------------- */

function SeletorDeEscudo({ escudo, aoDefinir, aoLimpar, podeLimpar = true, compacto = false }) {
  const entrada = useRef(null)
  const [mostrarEndereco, setMostrarEndereco] = useState(false)
  const [endereco, setEndereco] = useState('')
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const enviarArquivo = async (evento) => {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    setErro(null)
    setCarregando(true)
    try {
      aoDefinir(await prepararEscudo(arquivo))
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }

  const confirmarEndereco = () => {
    try {
      const limpo = validarEnderecoDeEscudo(endereco)
      if (!limpo) return
      aoDefinir(limpo)
      setEndereco('')
      setMostrarEndereco(false)
      setErro(null)
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <BotaoTexto icone={ImagePlus} onClick={() => entrada.current?.click()} disabled={carregando}>
          {carregando ? 'Abrindo…' : escudo ? 'Trocar' : 'Enviar escudo'}
        </BotaoTexto>
        <BotaoTexto onClick={() => setMostrarEndereco((atual) => !atual)}>Colar link</BotaoTexto>
        {escudo && podeLimpar ? (
          <BotaoTexto icone={X} onClick={aoLimpar}>
            Tirar
          </BotaoTexto>
        ) : null}
        <input ref={entrada} type="file" accept="image/*" onChange={enviarArquivo} className="hidden" />
      </div>

      {mostrarEndereco ? (
        <div className="mt-2 flex gap-1.5">
          <input
            value={endereco}
            onChange={(evento) => setEndereco(evento.target.value)}
            onKeyDown={(evento) => evento.key === 'Enter' && confirmarEndereco()}
            placeholder="https://.../escudo.png"
            className={`${CAMPO} py-1.5 text-[12px]`}
          />
          <Botao onClick={confirmarEndereco} className="px-3 py-1.5">
            Usar
          </Botao>
        </div>
      ) : null}

      {erro ? <p className="mt-2 text-[11px] font-bold text-rosa">{erro}</p> : null}

      {!compacto && escudo?.startsWith('data:') ? (
        <p className="mt-2 text-[11px] text-tinta-fraca">Imagem reduzida para 96px · {tamanhoLegivel(escudo)}</p>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Formulário de time novo                                                    */
/* -------------------------------------------------------------------------- */

function FormularioDeTime({ aoSalvar, aoCancelar, ligaPadrao }) {
  const [nome, setNome] = useState('')
  const [liga, setLiga] = useState(ligaPadrao)
  const [cores, setCores] = useState(['#22c55e', '#0f172a'])
  const [escudo, setEscudo] = useState(null)

  const enviar = (evento) => {
    evento.preventDefault()
    if (!nome.trim()) return
    aoSalvar({
      id: novoIdDeTime(nome),
      nome: nome.trim(),
      liga: liga.trim() || ligaPadrao,
      cores,
      ...(escudo ? { escudo } : {}),
    })
  }

  return (
    <form onSubmit={enviar} className="contorno mb-4 rounded-lg bg-lima/15 p-3">
      <div className="mb-3 flex items-center gap-3">
        <EscudoTime tamanho="md" time={{ nome: nome || '??', cores, escudo }} />
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <input
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Nome do time"
            maxLength={40}
            autoFocus
            className={CAMPO}
          />
          <input
            value={liga}
            onChange={(evento) => setLiga(evento.target.value)}
            placeholder="Liga ou grupo"
            maxLength={30}
            className={CAMPO}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="rotulo text-[9px] text-tinta-media">Cores</span>
          {cores.map((cor, indice) => (
            <input
              key={indice}
              type="color"
              value={cor}
              onChange={(evento) =>
                setCores((atual) => atual.map((valor, posicao) => (posicao === indice ? evento.target.value : valor)))
              }
              className="contorno size-8 cursor-pointer rounded-md bg-transparent p-0"
              aria-label={`Cor ${indice + 1}`}
            />
          ))}
        </div>

        <SeletorDeEscudo escudo={escudo} aoDefinir={setEscudo} aoLimpar={() => setEscudo(null)} compacto />

        <div className="ml-auto flex gap-2">
          <Botao variante="papel" onClick={aoCancelar}>
            Cancelar
          </Botao>
          <Botao type="submit" disabled={!nome.trim()}>
            Criar time
          </Botao>
        </div>
      </div>
    </form>
  )
}

/* -------------------------------------------------------------------------- */
/* Lista                                                                      */
/* -------------------------------------------------------------------------- */

function LinhaTime({ time, ehEmbutido, temAjuste, temEscudoProprio, acoes }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-transparent px-2 py-2 transition-colors hover:border-tinta hover:bg-papel-claro">
      <EscudoTime timeId={time.id} tamanho="md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[14px] font-bold">{time.nome}</p>
          {!ehEmbutido ? <Etiqueta cor="lima">Criado por você</Etiqueta> : null}
          {ehEmbutido && temAjuste ? <Etiqueta cor="cobalto">Ajustado</Etiqueta> : null}
        </div>
        <p className="truncate text-[11px] text-tinta-fraca">{time.liga}</p>
      </div>

      <SeletorDeEscudo
        escudo={time.escudo}
        podeLimpar={temEscudoProprio}
        aoDefinir={(escudo) => acoes.salvarTime({ id: time.id, escudo })}
        aoLimpar={() => acoes.removerEscudo(time.id)}
        compacto
      />

      {temAjuste ? (
        <BotaoTexto
          icone={ehEmbutido ? RotateCcw : Trash2}
          onClick={() => acoes.removerTime(time.id)}
          className={ehEmbutido ? '' : 'text-rosa'}
        >
          {ehEmbutido ? 'Restaurar' : 'Excluir'}
        </BotaoTexto>
      ) : null}
    </li>
  )
}

export function GerenciadorDeTimes({ acoes, totalDeAjustes }) {
  const { times, ehEmbutido, temAjuste, temEscudoProprio, ligaDoUsuario } = useTimes()
  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = termo
      ? times.filter((time) => `${time.nome} ${time.liga}`.toLowerCase().includes(termo))
      : times
    // Times do usuário e ajustados primeiro — são os que ele quer rever.
    return [...filtrados].sort((a, b) => Number(temAjuste(b.id)) - Number(temAjuste(a.id)))
  }, [times, busca, temAjuste])

  return (
    <Cartao className="p-4 sm:p-6">
      <TituloSecao
        className="mb-4"
        titulo="Times e escudos"
        descricao="Os times da lista já vêm com o escudo oficial. Você pode trocar por outra imagem ou criar times que não estão aqui."
        acao={
          <div className="contorno shrink-0 rounded-lg bg-papel-escuro px-3 py-2 text-center">
            <p className="num font-display text-2xl leading-none">{times.length}</p>
            <p className="rotulo mt-1 text-[9px]">Times</p>
          </div>
        }
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-fraca" strokeWidth={2.5} />
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar time ou liga"
            className={`${CAMPO} pl-9`}
          />
        </div>
        <Botao icone={Plus} onClick={() => setCriando((atual) => !atual)}>
          Novo time
        </Botao>
      </div>

      {criando ? (
        <FormularioDeTime
          ligaPadrao={ligaDoUsuario}
          aoCancelar={() => setCriando(false)}
          aoSalvar={(time) => {
            acoes.salvarTime(time)
            setCriando(false)
          }}
        />
      ) : null}

      {/* A altura fixa só entra a partir do tablet: no celular, uma lista com
          rolagem própria dentro da página que já rola é um inferno de usar. */}
      <ul className="scrollbar-fina space-y-1 sm:max-h-[26rem] sm:overflow-y-auto sm:pr-1">
        {visiveis.map((time) => (
          <LinhaTime
            key={time.id}
            time={time}
            ehEmbutido={ehEmbutido(time.id)}
            temAjuste={temAjuste(time.id)}
            temEscudoProprio={temEscudoProprio(time.id)}
            acoes={acoes}
          />
        ))}
        {!visiveis.length ? (
          <li className="contorno rounded-lg border-dashed px-4 py-8 text-center text-[13px] text-tinta-media">
            Nenhum time encontrado para “{busca}”.
          </li>
        ) : null}
      </ul>

      <p className="mt-3 text-[12px] leading-snug text-tinta-media">
        Os escudos da lista vêm de um servidor público e precisam de internet; sem conexão, o time aparece com as
        iniciais. Imagens que <strong className="text-tinta">você</strong> enviar ficam salvas neste navegador (
        {totalDeAjustes} time{totalDeAjustes === 1 ? '' : 's'} com ajuste), funcionam offline e entram no backup em
        arquivo — mas não no link do placar, para ele não ficar gigante.
      </p>
    </Cartao>
  )
}
