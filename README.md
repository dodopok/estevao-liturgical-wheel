# Liturgical Year Wheel

Gera um pôster circular do ano litúrgico em SVG, buscando os dados diretamente na **Ordo API** com uma API key.

O resultado final é um arquivo SVG em tamanho A4 (2480 × 3508 px @ 300 dpi) com:

- **Seis quadras litúrgicas** coloridas em anel (Advento, Natal, Epifania, Quaresma, Páscoa, Tempo Comum)
- **Raios/spokes** para cada domingo e celebração (Festas Principais + Dias Santos)
- Cada raio na **cor litúrgica** do dia
- **Rótulo de mês** em arco externo
- **Medalhão central** (com imagem opcional do Cordeiro)
- Título e rodapé customizáveis

---

## Setup

```bash
git clone <este-repo>
cd liturgical-wheel
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

---

## Uso

### Básico

```bash
python generate.py \
  --liturgical-year 2026 \
  --api-key estevao_SEU_KEY_AQUI
```

Gera `wheel_2025_2026.svg` no diretório atual.

### Com imagem central

Coloque um PNG/JPG quadrado (ex: o Cordeiro) em `assets/lamb.png`:

```bash
python generate.py \
  --liturgical-year 2026 \
  --api-key estevao_SEU_KEY_AQUI \
  --center-image assets/lamb.png
```

### Outros prayer books

```bash
python generate.py \
  --liturgical-year 2026 \
  --api-key estevao_SEU_KEY_AQUI \
  --prayer-book loc_1987
```

### Todas as opções

```
--liturgical-year YEAR    Ano litúrgico (ex: 2026 = Advento 2025 → Cristo Rei 2026)
--api-key KEY             Ordo API key (começa com estevao_)
--api-base URL            URL base da API (default: https://api.estevao.app/api/v1)
--prayer-book CODE        Código do livro de oração (default: loc_2015)
--output PATH             Caminho de saída (default: wheel_YYYY_YYYY.svg)
--center-image PATH       PNG/JPG para o medalhão central (opcional)
```

---

## Exportar para PNG / PDF

### Via Inkscape (recomendado para impressão)

```bash
inkscape wheel_2025_2026.svg \
  --export-filename=wheel_2025_2026.png \
  --export-dpi=300
```

### Via cairosvg (Python)

```bash
pip install cairosvg
python -c "
import cairosvg
cairosvg.svg2png(url='wheel_2025_2026.svg', write_to='wheel_2025_2026.png', dpi=300)
"
```

### Via Inkscape — PDF para impressão offset

```bash
inkscape wheel_2025_2026.svg \
  --export-filename=wheel_2025_2026.pdf \
  --export-dpi=300
```

---

## Como funciona

O script faz **6 chamadas à API** para cada ano litúrgico gerado:

| Chamada | Endpoint | Dados usados |
|---|---|---|
| 1 | `GET /calendar/{ano-1}/key_dates` | Data de início do Advento |
| 2 | `GET /calendar/{ano}/key_dates` | Data do Cristo Rei (fim) |
| 3 | `GET /calendar/{ano-1}` | Dados de cada dia (nov–dez) |
| 4 | `GET /calendar/{ano}` | Dados de cada dia (jan–nov) |
| 5 | `GET /calendar/{ano-1}/seasons` | Quadra do Advento |
| 6 | `GET /calendar/{ano}/seasons` | Demais quadras |

Cada resposta é cacheada pela API por 1 mês, então chamadas repetidas ao mesmo ano são instantâneas do lado do servidor.

### Quais dias aparecem como raios?

- Todos os **domingos**
- Qualquer dia com **`celebration_name`** preenchido (Festas Principais, Dias Santos, Festivais)

O nome exibido é o `celebration_name` quando presente, ou o `week_name` do domingo.

### Mapeamento de cores

As cores retornadas pela API em português são mapeadas para hex:

| API | Cor | Hex |
|---|---|---|
| `branco` | Branco/Creme | `#F5EDD8` |
| `verde` | Verde | `#3B6E34` |
| `roxo` / `violeta` | Roxo/Violeta | `#5B2D86` |
| `vermelho` | Vermelho | `#AB1F1F` |
| `rosa` | Rosa | `#CC6B88` |

As cores das faixas de estação seguem a mesma paleta com saturação ligeiramente maior.

---

## Customização

Todas as constantes visuais estão no início de `generate.py`:

```python
# Tamanho da página
PAGE_W = 2480   # px
PAGE_H = 3508   # px (A4 @ 300dpi — trocar para 3508 × 4961 para A3)

# Raios do gráfico
R_INNER     = 230   # medalhão central
R_SEASON_IN = 300   # borda interna da faixa de estação
R_SPOKE_OUT = 1025  # comprimento dos raios

# Largura angular de cada raio (graus)
SPOKE_WIDTH_DEG = 0.45

# Cores das faixas de estação
SEASON_BG = {
    "Advento":     "#4A235A",
    "Natal":       "#E8D8B0",
    ...
}
```

---

## Datas de referência

| Ano litúrgico | Início (Advento) | Páscoa | Pentecostes | Fim (Cristo Rei) |
|---|---|---|---|---|
| 2024–2025 | 1 dez 2024 | 20 abr 2025 | 8 jun 2025 | 23 nov 2025 |
| 2025–2026 | 30 nov 2025 | 5 abr 2026 | 24 mai 2026 | 22 nov 2026 |
| 2026–2027 | 29 nov 2026 | 28 mar 2027 | 16 mai 2027 | 21 nov 2027 |
| 2027–2028 | 28 nov 2027 | 16 abr 2028 | 4 jun 2028 | 26 nov 2028 |
