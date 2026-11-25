<!--
Título: Conventional Commits em inglês: `feat(wheel): …`, `fix(print): …`.
Escreva para quem vai revisar sem ter acompanhado a conversa. Seção que não se
aplica fica com "Nada." em vez de sumir: assim fica claro que ela foi pensada.
Estes comentários não aparecem no PR.
-->

## Por quê

<!-- O problema ou a necessidade, do ponto de vista de quem usa a roda, na tela
ou impressa. Para erro litúrgico: o livro, o ano e o que o livro impresso diz.
Link para a issue ou a conversa. -->

## O que muda

<!-- O que muda na roda, na tela ou no PDF, e para quais livros de oração e
anos. Lista curta; o diff já mostra o código. -->

## Como foi feito

<!-- O que o diff não explica: a abordagem, o que foi descartado e por quê, os
trechos que valem ser lidos primeiro. -->

## Riscos

<!--
Uma linha por risco: o que pode dar errado, quem sente, e o que segura. Pense
em:
- o proxy (`api/[year]/[endpoint].js`): a URL é pública e leva a nossa chave;
  endpoint, ano ou livro fora da lista fechada vira acesso a qualquer rota da
  Estêvão API;
- a chave (`LITURGICAL_API_KEY`) chegando ao navegador;
- cache: o CDN guarda cada ano e livro por um dia e serve a resposta velha
  por até uma semana enquanto revalida, então uma correção na API não aparece
  na hora;
- liturgia: a virada do ano no Advento (que pode cair em novembro), as
  estações e as cores de cada livro;
- os livros do seletor em `public/index.html` e os que a API conhece;
- impressão: A1 a A4, cada um numa página, vetorial;
- a prévia ao compartilhar (`public/og-image.png`);
- carga na API: chamadas por visita (hoje cinco por ano mostrado).
Se não há risco que valha nomear, diga por quê.
-->

## Deploy

<!--
A Vercel publica o `main` em `calendario.caminhoanglicano.com.br`
(`npm run deploy` faz o mesmo à mão). Escreva o que vai além disso, em ordem:
- variável de ambiente nova ou mudada na Vercel (está no `.env.example`?);
- livro ou rota que precisa estar em produção na API antes, com o link do PR;
- `og-image.png` regerada (`npm run og-image`) quando o desenho da roda muda;
- o que olhar depois (a roda no ar com cada livro tocado, um PDF impresso).
-->

- [ ] Nada além do deploy normal.

## Como desfazer

<!-- Reverter o merge (ou promover o deploy anterior na Vercel) basta? Diga o
que não volta: resposta que o CDN já guardou, PDF já impresso, prévia do link
que o WhatsApp ou o Instagram já guardaram. -->

## Como testar

<!-- O que foi rodado, com o resultado (`npm run serve`, `npm run test:print`),
e como conferir à mão: livro, ano litúrgico (inclusive um cujo Advento cai em
novembro), tela e PDF. -->

## Telas

<!-- A roda antes e depois, e o PDF quando a impressão muda. "Nada." se não
muda tela. -->

## Relacionados

<!-- PRs em outros repositórios (`dodopok/estevao-api#123`), a ordem em que
entram, e issues. -->

## Checklist

- [ ] Conferido com `npm run serve` nos livros e anos tocados
- [ ] Layout ou impressão mudou: `npm run test:print` passa, cada formato numa página
- [ ] Desenho da roda mudou: `public/og-image.png` regerada com `npm run og-image`
- [ ] O proxy continua aceitando só a lista fechada de `endpoint`, `year` e `pb`
- [ ] `LITURGICAL_API_KEY` só no servidor; `.env` fora do commit
- [ ] Livro novo no seletor existe na API de produção
- [ ] Virada do ano litúrgico (Advento) conferida nos anos tocados
- [ ] A página continua sem dependência de runtime: HTML, SVG e JS, sem build
- [ ] Variável de ambiente nova no `.env.example` e no README
