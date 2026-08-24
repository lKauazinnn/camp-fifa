# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Site do campeonato de FIFA do acampamento Unidos Acamp: inscrição por QR code, sorteio dos times,
chaveamento mata-mata com repescagem, estatísticas e painel do organizador. React 19 + Vite 8 +
Tailwind 4, publicado na Vercel (projeto `camp-fifa`), com Supabase opcional para o placar ao vivo.

## Idioma do código

**Todo o código é escrito em português do Brasil** — nomes de variáveis, funções, componentes, arquivos e
comentários (`participantes`, `sortearTimes`, `buscarTime`, `ChaveVisual.jsx`). Mantenha assim: código novo
em inglês destoa de tudo o que já existe. Os textos de interface usam o tom do acampamento — informal,
direto, sem jargão ("Bora jogar", "quem não gostou, joga melhor").

## Comandos

```bash
npm run dev        # Vite em http://localhost:5173
npm run build      # gera dist/
npm run preview    # serve o build
npm run verificar  # a suíte de testes do projeto (ver abaixo)
```

Não há ESLint nem Prettier configurados. O estilo do código é: **sem ponto e vírgula**, aspas simples,
largura ~120 colunas. Rodar `npx prettier` sem passar `--no-semi --single-quote --print-width 120`
reformata o arquivo inteiro no estilo errado.

### `npm run verificar` é a suíte de testes

Não existe Jest/Vitest. `scripts/verificar.jsx` é compilado em modo SSR e executado no Node: ele renderiza
todas as telas em HTML (em vários estados: vazio, com byes, campeão definido, somente leitura) e roda
auditorias sobre o resultado. Cobre três coisas que já quebraram na prática:

1. telas que estouram em algum estado;
2. **contraste no tema preto** — texto sobre cor viva (`bg-lima`, `bg-cobalto`, `bg-laranja`, `bg-rosa`,
   `bg-carvao`) precisa de cor fixa (`text-carvao`, `text-white`, `text-creme`), nunca de cor que muda com
   o tema (`text-tinta`, `text-papel`);
3. mesclagem do catálogo de times.

Testes de lógica pura (funções de `src/lib/`) entram no mesmo arquivo, como blocos de `ok(condicao, texto)`.
Tela nova = uma linha no array `telas`. Não há como rodar um teste isolado: o script roda inteiro (é rápido).

## Arquitetura

### Estado único, chaveamento derivado

`src/hooks/useTorneio.js` é a fonte de verdade. O estado persistido é mínimo:

```js
{ participantes, seeds, resultados, elenco, timesDoUsuario }
```

`seeds` é a ordem sorteada da 1ª fase (`null` = bye) e `resultados` é um mapa `idPartida -> placar`. **Todo o
chaveamento** (confrontos, quem avançou, repescagem, campeão, progresso) é recalculado por `montarTorneio`
(`src/lib/torneio.js`), que é pura. Por isso corrigir o placar de um jogo antigo reorganiza sozinho todas as
fases seguintes. Nunca guarde no estado algo que dê para derivar.

Campo novo no estado precisa ser adicionado em **três lugares**, senão some ao recarregar ou ao passar pela
nuvem: `ESTADO_VAZIO` e `comCamposNovos` (em `useTorneio.js`) e `validarEstado` (em `persistencia.js`), que
descarta tudo o que não reconhece.

### Quatro camadas de persistência (`src/lib/persistencia.js` e `src/lib/nuvem.js`)

1. **localStorage** — grava a cada alteração, automático.
2. **Backup `.json`** — botões baixar/restaurar no Painel Admin.
3. **Link do placar** — o estado viaja compactado dentro da URL; quem abre entra em *modo visualização*
   (somente leitura, sem tocar nos dados locais do aparelho). Escudos enviados ficam de fora do link.
4. **Supabase** (opcional, ligado só se as variáveis `VITE_SUPABASE_*` existirem — ver `.env.example`).

### Como a nuvem é protegida

O site é estático, então a chave publicável fica visível: o desenho parte disso (`supabase/schema.sql`).

- A tabela `campeonatos` só tem política de `SELECT` — ninguém escreve nela direto.
- Gravação passa pela função `salvar_campeonato` (`SECURITY DEFINER`), que confere o **PIN** dentro do
  Postgres. O hash mora em `segredos`, tabela sem permissão nenhuma para as chaves públicas.
- A inscrição pelo QR usa a função `inscrever`, sem PIN; as travas (nome repetido, inscrição depois do
  sorteio, limite) ficam no banco, não no cliente.
- O PIN fica no `sessionStorage`. `somenteLeitura = modoVisualizacao || (nuvemConfigurada && !pin)`: sem PIN,
  o Painel Admin mostra a tela `Destravar`.
- O evento de tempo real é só um **aviso** — o cliente relê a linha pelo REST (o payload estoura com escudos
  embutidos). As gravações sobem agrupadas depois de 700 ms parado, e o campo `versao` serve para o cliente
  ignorar o eco da própria escrita.

### Catálogo de times

`src/data/times.js` traz 22 clubes de nota alta do FC 26 (só clube, sem seleção, sem brasileiro). O usuário
pode sobrescrever qualquer time ou criar os seus: os ajustes ficam em `estado.timesDoUsuario` e são mesclados
com a lista embutida por `criarCatalogo` (`src/contexto/TimesContexto.jsx`) — um ajuste é `{ id, ...só o que
muda }`. Use sempre `useTimes()` para ler time; nunca importe `TIMES` direto num componente.

Escudo tem queda escalonada: miniatura WebP (`wsrv.nl`) → PNG original (`media.api-sports.io`) → quadrado com
as iniciais e as cores do clube. Um efeito em `useTorneio` baixa os escudos em uso e guarda como data URL
dentro do campeonato, para viajarem junto nos backups e na nuvem (só o organizador faz isso).

### Fluxo do acampamento

Inscrição pelo QR (`#inscricao`) → organização confere a lista → marca quais times entram no bolo e sorteia
(um time por pessoa; com mais gente que time o elenco repete distribuído por igual) → sorteia as chaves →
lança os placares. O elenco marcado fica salvo em `estado.elenco`, e é dele que sai o time de quem for
sorteado sozinho depois (`sortearTimeAvulso`, para quem chegou atrasado ou precisa trocar).

## Sistema visual

`src/index.css` define tudo: tokens de cor, tema claro/preto (via `data-tema` no `<html>`) e as utilidades do
sistema — `contorno` (borda de 2px), `sombra`/`sombra-p`/`sombra-g` (sombra sólida, sem blur), `apertar`
(botão que afunda), `rotulo` (caixa alta), `marcado`, `listrado`, `varredura`. Estética de pôster de
campeonato: papel bege, tinta preta, três cores elétricas com função fixa (lima = positivo, cobalto =
destaque, laranja = atenção).

### Camada fliperama

O site tem uma camada de arcade que precisa ser mantida coerente:

- **Animações** (`index.css`): `animar-surgir` (cascata, atraso via `--atraso`), `piscar-duro`,
  `animar-placar`, `animar-confete`, `animar-travar`, `animar-chacoalhar`, `animar-tela`, `dado` (botão de
  dado que rola). **Toda animação nova precisa entrar no bloco `@media (prefers-reduced-motion: reduce)`** no
  fim do arquivo — a suíte não pega isso, é disciplina.
- **Som** (`src/lib/som.js`): chiptune sintetizado no Web Audio, sem arquivo de áudio. `tocar('gol')`,
  `vibrar()`. O mudo fica no localStorage e vale também para a vibração.
- **Cerimônias**: `PalcoSorteio.jsx` (sorteio em tela cheia, revela um por vez) e `Abertura.jsx` (a tela
  "aperte start", uma vez por aba). Ambas são puro enfeite — o resultado já está decidido antes de abrirem, e
  quem pediu `prefers-reduced-motion` recebe o conteúdo direto.

## Deploy

`git push origin main` → a Vercel publica sozinha (projeto `camp-fifa`, `vercel.json` já configurado). O
`.bat` `enviar-para-github.bat` faz commit+push para quem prefere clicar. Variáveis de ambiente da nuvem
ficam em Settings → Environment Variables no painel da Vercel.

## Aviso sobre o README

O `README.md` explica bem a nuvem, a persistência e o desenho do banco, mas envelheceu em alguns pontos:
fala em 40 times com seleções e clubes brasileiros (hoje são 22 clubes), em 24 telas na verificação e num
tema visual antigo (Inter, verde neon). Confie no código quando divergirem.
