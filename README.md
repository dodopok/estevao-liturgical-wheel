# O Ano Litúrgico — Calendário do Ano Cristão

Aplicação web que gera um calendário circular interativo do Ano Litúrgico Anglicano, buscando os dados da **[Estêvão API](https://estevao.caminhoanglicano.com.br/)**. Disponível em **[calendario.caminhoanglicano.com.br](https://calendario.caminhoanglicano.com.br)**.

---

## O que é

Uma roda visual do Ano Litúrgico com:

- **Anel externo** com as estações litúrgicas coloridas (Advento, Natal, Epifania, Quaresma, Semana Santa, Páscoa, Tempo Comum)
- **Raios** para cada domingo, Festa Principal e Dia Santo — na cor litúrgica do dia
- **Anel de meses** com os meses do ano civil
- **Números dos dias** em arco interno
- **Medalhão central** com a inscrição "Agnus Dei" e "Eis o Cordeiro de Deus"
- Suporte a múltiplos **Livros de Oração** (LOC 1549, 1662, 1987, LOCb 2008, LOC 2015, 2019, 2021)
- Download de **PDF vetorizado em A1, A2, A3 ou A4** via impressão nativa do browser

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML + SVG + JavaScript vanilla |
| Servidor / Proxy | Vercel Serverless Functions |
| PDF | `window.print()` com `@page { size }` em mm (vetorizado) |
| Dados | [Estêvão API](https://estevao.caminhoanglicano.com.br/) |

---

## Desenvolvimento local

```bash
git clone <este-repo>
cd liturgical-wheel
npm install
cp .env.example .env   # preencha as variáveis
npm run dev            # → http://localhost:3000
```

O [Vercel CLI](https://vercel.com/docs/cli) é uma `devDependency` — não precisa
instalar nada globalmente, o `npm install` já resolve. Na primeira execução ele
pede login e a vinculação do projeto.

> O `npm audit` reporta vulnerabilidades nas dependências do CLI da Vercel. São
> todas de desenvolvimento: o app publicado não tem nenhuma dependência de
> runtime. Rodar `npm audit fix --force` só faz downgrade do CLI.

### Testando a impressão

Bugs de impressão não aparecem na tela — só no PDF. O script abaixo gera um PDF
de cada formato (com dados simulados) e falha se algum não couber em uma página:

```bash
npm run test:print   # PDFs em tmp/print-test/
```

Ele usa o Chrome já instalado na máquina; se não achar, informe o caminho com
`CHROME_PATH=/caminho/do/chrome`.

---

## Deploy na Vercel

```bash
npm run deploy
```

Configure as variáveis de ambiente no dashboard da Vercel em **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `LITURGICAL_API_KEY` | Sua chave da Estêvão API |
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
├── scripts/
│   └── print-test.js       # Gera PDFs de cada formato pra conferir o layout
├── vercel.json             # Roteamento
├── package.json
├── .env.example            # Modelo das variáveis
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

O proxy em `api/[year]/[endpoint].js` injeta a API key no servidor — ela nunca é
exposta ao browser. Ele também valida `year`, `endpoint` e `pb` contra uma lista
fechada (a URL é pública, então sem isso a chave daria acesso a qualquer rota da
Estêvão API) e devolve `Cache-Control` com `s-maxage`, já que o calendário de um
(ano, livro de oração) nunca muda — o CDN da Vercel serve as visitas seguintes
sem tocar na Estêvão API.

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
