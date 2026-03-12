# O Ano Litúrgico — Calendário do Ano Cristão

Aplicação web que gera um calendário circular interativo do Ano Litúrgico Anglicano, buscando os dados da **Ordo API**. Disponível em **[calendario.caminhoanglicano.com.br](https://calendario.caminhoanglicano.com.br)**.

---

## O que é

Uma roda visual do Ano Litúrgico com:

- **Anel externo** com as estações litúrgicas coloridas (Advento, Natal, Epifania, Quaresma, Semana Santa, Páscoa, Tempo Comum)
- **Raios** para cada domingo, Festa Principal e Dia Santo — na cor litúrgica do dia
- **Anel de meses** com os meses do ano civil
- **Números dos dias** em arco interno
- **Medalhão central** com a inscrição "Agnus Dei" e "Eis o Cordeiro de Deus"
- Suporte a múltiplos **Livros de Oração** (LOC 1662, 1987, LOCB 2008, LOC 2015, LOC 2021)
- Download de **PDF A3 vetorizado** via impressão nativa do browser

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML + SVG + JavaScript vanilla |
| Servidor / Proxy | Vercel Serverless Functions |
| PDF | `window.print()` com `@page { size: A3 }` (vetorizado) |
| Dados | [Ordo API](http://localhost:3000) |

---

## Desenvolvimento local

**Pré-requisito:** [Vercel CLI](https://vercel.com/docs/cli)

```bash
npm install -g vercel
```

Clone e configure:

```bash
git clone <este-repo>
cd liturgical-wheel
cp .env.example .env   # preencha as variáveis
```

Crie um `.env` com:

```env
LITURGICAL_API_KEY=sua_chave_aqui
LITURGICAL_API_BASE=http://localhost:3000/api/v1
```

Rode localmente:

```bash
npx vercel dev
# → http://localhost:3000
```

---

## Deploy na Vercel

```bash
npx vercel --prod
```

Configure as variáveis de ambiente no dashboard da Vercel em **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `LITURGICAL_API_KEY` | Sua chave da Ordo API |
| `LITURGICAL_API_BASE` | URL base da API |

---

## Estrutura do projeto

```
liturgical-wheel/
├── api/
│   └── [year]/
│       └── [endpoint].js   # Proxy serverless (esconde a API key)
├── public/
│   ├── index.html          # Aplicação completa (SVG + JS)
│   ├── favicon.ico
│   └── apple-touch-icon.png
├── vercel.json             # Roteamento
├── package.json
└── .env                    # Local only — não commitar
```

---

## Como funciona

O frontend faz **5 chamadas paralelas** à API (via proxy) para cada ano litúrgico:

| Endpoint | Dados usados |
|---|---|
| `GET /calendar/{ano}/overview` | Estações + key dates do ano atual |
| `GET /calendar/{ano-1}/overview` | Estações do Advento anterior |
| `GET /calendar/{ano-1}/key_dates` | Data de início do Advento |
| `GET /calendar/{ano}/celebrations` | Celebrações do ano atual |
| `GET /calendar/{ano-1}/celebrations` | Celebrações do ano anterior |

O proxy em `api/[year]/[endpoint].js` injeta a API key no servidor — ela nunca é exposta ao browser.

---

## Mapeamento de cores

| API | Cor | Hex |
|---|---|---|
| `branco` | Branco/Creme | `#F5EDD8` |
| `verde` | Verde | `#3B6E34` |
| `roxo` / `violeta` | Roxo/Violeta | `#5B2D86` |
| `vermelho` | Vermelho | `#AB1F1F` |
| `rosa` | Rosa | `#CC6B88` |
| `preto` | Preto | `#333333` |
| `dourado` | Dourado | `#D4B86A` |

---

## Datas de referência

| Ano litúrgico | Início (Advento) | Páscoa | Pentecostes | Fim |
|---|---|---|---|---|
| 2024–2025 | 1 dez 2024 | 20 abr 2025 | 8 jun 2025 | 28 nov 2025 |
| 2025–2026 | 30 nov 2025 | 5 abr 2026 | 24 mai 2026 | 28 nov 2026 |
| 2026–2027 | 29 nov 2026 | 28 mar 2027 | 16 mai 2027 | 27 nov 2027 |
