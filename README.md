# EcoTrend

**Consumo consciente, escolhas que transformam.**

EcoTrend é um site de e-commerce (front-end) voltado a produtos sustentáveis, reunindo quatro categorias — **Moda**, **Beleza**, **Casa** e **Tecnologia** — para incentivar hábitos de consumo mais conscientes.

## Funcionalidades

- Página inicial com carrossel de destaques
- Navegação por categorias de produtos
- Busca de produtos no cabeçalho
- Carrinho de compras (offcanvas) com contador e subtotal
- Página de categoria com filtro por parâmetro na URL (`categoria.html?categoria=...`)
- Página de contato
- Formulário de newsletter
- Layout responsivo, com atenção a acessibilidade (skip link, `aria-label`, `alt` descritivo nas imagens)

## Tecnologias

- HTML5 semântico
- CSS3 (`css/style.css`)
- JavaScript (`js/script.js`)
- [Bootstrap 5.3.8](https://getbootstrap.com/) — grid, componentes e offcanvas
- [Font Awesome 6.5.1](https://fontawesome.com/) — ícones
- Google Fonts — Playfair Display e Inter

## Estrutura do projeto

```
EcoTrend/
├── css/              # Estilos do site
├── js/               # Scripts (busca, carrinho, etc.)
├── midia/imgs/       # Imagens do carrossel e das páginas
├── pages/            # Páginas internas (categoria, contato)
├── index.html        # Página inicial
└── integrantes.txt   # Integrantes do projeto
```

## Como executar

Como é um projeto estático (HTML, CSS e JS puros), basta:

1. Clonar o repositório:
   ```bash
   git clone https://github.com/gprsilva/EcoTrend.git
   ```
2. Abrir o arquivo `index.html` no navegador,

   ou servir a pasta localmente, por exemplo:
   ```bash
   npx serve .
   ```

## Equipe

| Nome | RM |
|---|---|
| Guilherme Pereira Ruiz da Silva | 573360 |
| Antonio do Nascimento Ferreira de Sousa | 573706 |
| Gustavo Leal | 569361 |
| Matheus Mendes Duarte da Silva | 569559 |
| Matheus Sato Oliveira do Prado | 569392 |
