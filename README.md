# Campeonato FIFA · Unidos Acamp

Aplicação web para gerenciar o campeonato de FIFA do acampamento **Unidos Acamp**: chaveamento mata-mata,
repescagem com disputa de 3º lugar, estatísticas de gols e cartões, regras e painel administrativo.

Prêmio em destaque: **R$ 100,00 para o campeão**.

## Stack

- React 19 + Vite 8
- Tailwind CSS 4 (plugin oficial do Vite, tema customizado em `src/index.css`)
- Lucide React (ícones)
- Persistência local via `localStorage`, backup em arquivo e link compartilhável — sem backend

Visual escuro e minimalista: fundo quase preto, divisórias de 1px, tipografia Inter e um único acento verde.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve o build
```

## Deploy na Vercel

O projeto já vem com `vercel.json` (framework `vite`, saída em `dist`, rewrite de SPA e cache dos assets).

**Pelo painel (recomendado):**

1. Suba o projeto para um repositório no GitHub/GitLab.
2. Em vercel.com → **Add New… → Project** → importe o repositório.
3. A Vercel detecta o Vite sozinho. Confirme: Build Command `npm run build`, Output Directory `dist`.
4. **Deploy**. Cada push na branch principal gera um novo deploy automático.

**Pela CLI:**

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # produção
```

Não há variáveis de ambiente a configurar.

## Placar ao vivo (Supabase)

Com as variáveis de ambiente configuradas, o campeonato passa a viver no Supabase: o organizador lança um
placar e **todos os celulares atualizam sozinhos em menos de um segundo**, sem ninguém recarregar a página.

### Como o acesso é protegido

O site é estático, então a chave publicável fica visível para qualquer visitante — o desenho parte desse
princípio (tudo em `supabase/schema.sql`):

| Quem | Pode |
|---|---|
| Qualquer visitante (chave publicável) | **só ler** o placar |
| Organizador (com o PIN) | ler e gravar, através da função `salvar_campeonato` |

- A tabela `campeonatos` tem apenas política de `SELECT`. Não existe política de escrita, então nem a chave
  anônima nem um usuário logado conseguem alterar a tabela direto.
- Toda gravação passa por uma função `SECURITY DEFINER` que confere o PIN **dentro do Postgres**.
- O hash do PIN mora em `segredos`, tabela sem nenhuma permissão para as chaves públicas e fora da
  publicação de tempo real — assim ele não vaza nem no payload de um evento.
- Tentativa com PIN errado tem atraso proposital, para encarecer a força bruta.

O PIN fica no `sessionStorage`, então some ao fechar a aba. Para trocá-lo, use *Trocar PIN* no painel — ou,
pelo SQL Editor do Supabase:

```sql
update public.segredos
   set pin_hash = extensions.crypt('SEU-PIN-NOVO', extensions.gen_salt('bf', 10))
 where id = 'unidos-acamp';
```

### Configuração

```bash
cp .env.example .env   # preencha com a URL e a chave publicável do seu projeto
```

A chave fica em **Settings → API Keys**. Prefira a *publishable* (`sb_publishable_…`): com o app usando
ela, as chaves legadas (`anon` e `service_role`) podem ser desativadas no painel, o que é bom porque a
`service_role` ignora todas as regras de segurança se vazar.

Na Vercel, cadastre as mesmas variáveis em **Settings → Environment Variables** e refaça o deploy. Sem elas
o site continua funcionando, só que cada aparelho guarda a própria cópia.

Rode o `supabase/schema.sql` uma vez no SQL Editor do projeto e crie a linha do campeonato:

```sql
insert into public.campeonatos (id, estado) values ('unidos-acamp', '{}');
insert into public.segredos (id, pin_hash)
values ('unidos-acamp', extensions.crypt('SEU-PIN', extensions.gen_salt('bf', 10)));
```

### Como os dois lados conversam

- O evento de tempo real é só um **aviso**: o cliente relê a linha pelo REST. Isso evita depender do
  tamanho do payload, que cresce quando há escudos enviados.
- As alterações do organizador sobem agrupadas depois de 700 ms parado, para uma sequência de cliques não
  virar uma sequência de gravações.
- Cada gravação incrementa `versao`; o cliente ignora o eco da própria escrita comparando esse número.

## Onde os dados ficam guardados

Três camadas, da mais automática para a mais manual — todas em `src/lib/persistencia.js`:

1. **`localStorage`** — grava a cada alteração. Sobrevive a atualizar a página, fechar o navegador e desligar
   o computador. É o que responde à pergunta "perco tudo se der refresh?": não.
2. **Backup em arquivo `.json`** — botão *Baixar backup* no Painel Admin. Protege contra limpar o cache,
   trocar de celular ou usar janela anônima. *Restaurar backup* lê o arquivo de volta.
3. **Link do placar** — botão *Copiar link do placar*. O estado do campeonato viaja compactado dentro da
   própria URL (~1,5 KB), então dá para mandar no grupo do WhatsApp e todo mundo abrir o chaveamento como
   está agora, em modo somente leitura, sem backend nenhum. Gere um link novo depois de lançar mais jogos.
   Os escudos enviados **não** entram no link (apenas nomes e cores), senão ele ficaria dez vezes maior.

Se o navegador bloquear o armazenamento (janela anônima), o Painel Admin avisa em vermelho e pede um backup.

> **Limite conhecido:** o placar não é compartilhado em tempo real. Cada aparelho tem sua própria cópia, e o
> link é uma foto do momento em que foi gerado. Para um placar ao vivo, basta trocar as funções de leitura e
> escrita de `src/lib/persistencia.js` por um banco (Vercel KV, Supabase ou Firebase) — o resto do código não
> muda.

## Estrutura

```
src/
├── App.jsx                     # abas e composição da página
├── index.css                   # tema (azul marinho, roxo, verde neon, dourado)
├── data/
│   ├── times.js                # catálogo de times do FIFA + escudos em degradê
│   └── mock.js                 # 16 participantes e resultados de exemplo
├── lib/
│   ├── torneio.js              # motor do torneio (sorteio, chaves, byes, pênaltis)
│   ├── estatisticas.js         # artilharia, cartões e resumo
│   └── persistencia.js         # localStorage, backup em arquivo e link do placar
├── hooks/
│   └── useTorneio.js           # estado único + persistência + ações
└── components/
    ├── Cabecalho.jsx           # título, premiação e indicadores
    ├── Navegacao.jsx           # abas
    ├── Chaveamento.jsx         # pódio + chave principal
    ├── Repescagem.jsx          # chave dos eliminados / 3º lugar
    ├── ChaveVisual.jsx         # bracket gráfico (desktop) e por fase (mobile)
    ├── CartaoPartida.jsx       # card de confronto
    ├── Estatisticas.jsx        # artilharia e disciplina
    ├── Regras.jsx              # regulamento
    ├── PainelAdmin.jsx         # cadastro, sorteio, lançamento de resultados
    ├── ModalResultado.jsx      # placar, cartões e pênaltis
    ├── ModalConfirmacao.jsx    # confirmação de ações destrutivas
    └── ui.jsx                  # cartão, botão, etiqueta, escudo, progresso
```

## Como o torneio funciona

O estado guardado é mínimo: **participantes**, **seeds** (ordem sorteada) e **resultados** por jogo.
Todo o chaveamento é recalculado a partir daí (`montarTorneio`), então corrigir o placar de um jogo antigo
reorganiza automaticamente todas as fases seguintes — inclusive quem cai na repescagem.

- Chave principal: Oitavas → Quartas → Semifinal → Final (o número de fases se ajusta ao total de inscritos).
- Repescagem: recebe todos os eliminados da 1ª fase; quem vencer a chave fica com o 3º lugar.
- Empate no tempo normal exige o placar dos pênaltis para definir quem avança.
- Inscritos fora de uma potência de 2 geram "byes" (classificação direta), distribuídos pela chave.

## Times e escudos

O catálogo traz 40 times prontos (Brasileirão, ligas europeias e seleções), **todos com o escudo oficial**.
As imagens são carregadas pelo navegador em três níveis, do melhor para o pior caso:

1. `wsrv.nl` redimensionando para 96px em WebP — os 40 escudos somam 137 KB (média de 3,4 KB cada)
2. o PNG original do `media.api-sports.io`, se o redimensionador falhar
3. o quadrado com iniciais e as cores do clube, se não houver internet

> Nenhum logo é redistribuído neste repositório: os endereços apontam para servidores públicos e as imagens
> são buscadas em tempo de execução. Cada id de escudo foi conferido visualmente antes de entrar no código,
> para nenhum time aparecer com o escudo de outro.

No Painel Admin ainda dá para:

- **Trocar o escudo** de qualquer time por uma imagem sua — ela é reduzida para 96×96 e guardada como data
  URL (3 a 6 KB), funciona offline e entra nos backups.
- **Colar o link** de uma imagem `https://` em vez de subir arquivo.
- **Criar times novos**, com nome, liga, duas cores e escudo.
- **Restaurar** um time embutido ao original, ou excluir um time criado.

## Verificação

```bash
npm run verificar
```

Renderiza as 24 telas em HTML fora do navegador e roda três auditorias sobre o resultado: telas que
estouram em algum estado, contraste no tema preto (texto sobre cor viva não pode depender do tema) e
mesclagem do catálogo de times. Foi essa verificação que pegou o bug dos rótulos de pênalti e o do bloco
que sumia no tema preto.

## Painel Admin

- Cadastro de participantes com escolha do time do FIFA (por liga).
- Sorteio automático dos confrontos (com confirmação antes de refazer).
- Lançamento de resultados por modal: placar, cartões amarelos, vermelhos e pênaltis.
- Zona de risco: restaurar dados de exemplo, desfazer chaveamento, zerar placares, apagar tudo.
