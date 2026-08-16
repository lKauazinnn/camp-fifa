# Campeonato FIFA · Unidos Acamp

Aplicação web para gerenciar o campeonato de FIFA do acampamento **Unidos Acamp**: chaveamento mata-mata,
repescagem com disputa de 3º lugar, estatísticas de gols e cartões, regras e painel administrativo.

Prêmio em destaque: **R$ 100,00 para o campeão**.

## Stack

- React 19 + Vite 8
- Tailwind CSS 4 (plugin oficial do Vite, tema customizado em `src/index.css`)
- Lucide React (ícones)
- Persistência local via `localStorage` — sem backend

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

> ⚠️ **Importante sobre os dados em produção:** o campeonato é salvo no `localStorage` do navegador de quem
> acessa. Isso significa que cada celular vê a sua própria cópia — os resultados lançados no Painel Admin
> **não** aparecem automaticamente para os jovens. Para um placar compartilhado em tempo real é preciso
> plugar um banco (Vercel KV, Supabase, Firebase) no lugar do `localStorage`, trocando apenas as funções de
> leitura/escrita do hook `src/hooks/useTorneio.js`.

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
│   └── estatisticas.js         # artilharia, cartões e resumo
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

## Painel Admin

- Cadastro de participantes com escolha do time do FIFA (por liga).
- Sorteio automático dos confrontos (com confirmação antes de refazer).
- Lançamento de resultados por modal: placar, cartões amarelos, vermelhos e pênaltis.
- Zona de risco: restaurar dados de exemplo, desfazer chaveamento, zerar placares, apagar tudo.
