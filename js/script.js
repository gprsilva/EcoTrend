/* ======================================================================
   EcoTrend — script.js
   Funções do HEADER e FOOTER (Etapa 1/3 — correção de bugs)
   ====================================================================== */
(function () {
    "use strict";

    /* ---------- HEADER: sombra ao rolar a página ---------- */
    var header = document.getElementById("site-header");

    function updateHeaderOnScroll() {
        if (!header) return;
        if (window.scrollY > 8) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    if (header) {
        updateHeaderOnScroll();
        window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
    }

    /* ---------- HEADER: alternância da busca no mobile ---------- */
    var mobileSearchToggle = document.getElementById("mobile-search-toggle");
    var searchForm = document.getElementById("header-search-form");

    if (mobileSearchToggle && searchForm) {
        mobileSearchToggle.addEventListener("click", function () {
            var isActive = searchForm.classList.toggle("is-active");
            mobileSearchToggle.setAttribute("aria-expanded", isActive ? "true" : "false");
            if (isActive) {
                var input = document.getElementById("search-input");
                if (input) input.focus();
            }
        });
    }

    /* ---------- HEADER: envio do formulário de busca ---------- */
    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = document.getElementById("search-input");
            var termo = input ? input.value.trim() : "";

            if (!termo) {
                if (input) input.focus();
                return;
            }

            // Leva o visitante até a página de categorias/produtos,
            // preservando o termo pesquisado para uso futuro.
            var isSubpage = window.location.pathname.indexOf("/pages/") !== -1;
            var destino = (isSubpage ? "categoria.html" : "pages/categoria.html") +
                "?busca=" + encodeURIComponent(termo);
            window.location.href = destino;
        });
    }

    /* ---------- Helper: mostra uma mensagem de retorno após um formulário ---------- */
    function showFormFeedback(form, message) {
        if (!form) return;
        var feedback = form.querySelector(".form-feedback");
        if (!feedback) {
            feedback = document.createElement("p");
            feedback.className = "form-feedback";
            form.appendChild(feedback);
        }
        feedback.textContent = message;
        feedback.classList.add("is-visible");
        window.clearTimeout(feedback._hideTimer);
        feedback._hideTimer = window.setTimeout(function () {
            feedback.classList.remove("is-visible");
        }, 4000);
    }

    /* ---------- FOOTER: formulário de newsletter ---------- */
    var newsletterForms = document.querySelectorAll(".newsletter-form");
    newsletterForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            var emailInput = form.querySelector('input[type="email"]');
            showFormFeedback(form, "Inscrição confirmada! Em breve você recebe nossas novidades.");
            if (emailInput) emailInput.value = "";
        });
    });

    /* ---------- FORMULÁRIO DE CONTATO (página Contato) ---------- */
    var contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }
            showFormFeedback(contactForm, "Mensagem enviada! Nosso time responde em até 1 dia útil.");
            contactForm.reset();
        });
    }

    /* ======================================================================
       PÁGINA CATEGORIAS: filtro de categorias + aba "Ofertas"
       (Etapa 2/3)
       ====================================================================== */
    var filterButtons = document.querySelectorAll("#filtro-categorias [data-filter]");
    var productItems = document.querySelectorAll("#grade-produtos [data-category]");
    var emptyState = document.getElementById("filtro-vazio");

    function aplicarFiltro(filtro) {
        var valor = (filtro || "todos").toLowerCase();
        var visiveis = 0;

        productItems.forEach(function (item) {
            var categoria = (item.getAttribute("data-category") || "").toLowerCase();
            var emOferta = item.getAttribute("data-oferta") === "true";
            var mostrar = valor === "todos" || categoria === valor || (valor === "ofertas" && emOferta);

            item.classList.toggle("d-none", !mostrar);
            if (mostrar) visiveis++;
        });

        if (emptyState) {
            emptyState.classList.toggle("d-none", visiveis > 0);
        }

        filterButtons.forEach(function (btn) {
            var filtroBotao = (btn.getAttribute("data-filter") || "").toLowerCase();
            var ativo = filtroBotao === valor;
            btn.classList.toggle("btn-success", ativo);
            btn.classList.toggle("btn-outline-success", !ativo);
            btn.setAttribute("aria-pressed", ativo ? "true" : "false");
        });
    }

    if (filterButtons.length && productItems.length) {
        filterButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var filtro = btn.getAttribute("data-filter") || "todos";
                aplicarFiltro(filtro);

                // Mantém o filtro navegável/compartilhável pela URL, sem recarregar a página.
                var url = new URL(window.location.href);
                if (filtro === "todos") {
                    url.searchParams.delete("categoria");
                } else {
                    url.searchParams.set("categoria", filtro);
                }
                window.history.replaceState({}, "", url);
            });
        });

        // Aplica o filtro vindo pela URL (ex.: link "Ofertas" do menu ou de outra página).
        var parametros = new URLSearchParams(window.location.search);
        aplicarFiltro(parametros.get("categoria"));
    }
})();

/* ======================================================================
   CARRINHO DE COMPRAS
   Adicionar produtos, alterar quantidade, remover itens, persistência
   em localStorage e atualização do contador/offcanvas do Header.
   ====================================================================== */
(function () {
    "use strict";

    var CART_KEY = "ecotrend-cart";

    /* ---------- Helpers de dados ---------- */
    function getCart() {
        try {
            var dados = window.localStorage.getItem(CART_KEY);
            var carrinho = dados ? JSON.parse(dados) : [];
            return Array.isArray(carrinho) ? carrinho : [];
        } catch (erro) {
            return [];
        }
    }

    function setCart(carrinho) {
        try {
            window.localStorage.setItem(CART_KEY, JSON.stringify(carrinho));
        } catch (erro) {
            /* localStorage indisponível (ex.: modo privado); segue sem persistir */
        }
        renderCart();
    }

    function formatarPreco(valor) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    /* Resolve o caminho da imagem de acordo com a página atual,
       já que as imagens são salvas de forma "raiz" (ex.: midia/imgs/foto.png). */
    function resolverCaminhoImagem(caminho) {
        if (!caminho) return "";
        var isSubpage = window.location.pathname.indexOf("/pages/") !== -1;
        return isSubpage ? "../" + caminho : caminho;
    }

    /* ---------- Ações do carrinho ---------- */
    function adicionarAoCarrinho(produto) {
        var carrinho = getCart();
        var existente = null;
        for (var i = 0; i < carrinho.length; i++) {
            if (carrinho[i].id === produto.id) {
                existente = carrinho[i];
                break;
            }
        }

        if (existente) {
            existente.quantidade += 1;
        } else {
            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: 1
            });
        }

        setCart(carrinho);
    }

    function alterarQuantidade(id, delta) {
        var carrinho = getCart();
        var novoCarrinho = [];

        carrinho.forEach(function (item) {
            if (item.id === id) {
                item.quantidade += delta;
                if (item.quantidade > 0) {
                    novoCarrinho.push(item);
                }
                // quantidade <= 0: item é removido do carrinho
            } else {
                novoCarrinho.push(item);
            }
        });

        setCart(novoCarrinho);
    }

    function removerDoCarrinho(id) {
        var carrinho = getCart().filter(function (item) {
            return item.id !== id;
        });
        setCart(carrinho);
    }

    /* ---------- Renderização ---------- */
    function renderCart() {
        var carrinho = getCart();

        // Contador do carrinho no Header (presente em todas as páginas)
        var totalItens = carrinho.reduce(function (soma, item) {
            return soma + item.quantidade;
        }, 0);

        var contadores = document.querySelectorAll(".cart-count");
        contadores.forEach(function (contador) {
            contador.textContent = totalItens;
        });

        var botoesCarrinho = document.querySelectorAll(".cart-btn");
        botoesCarrinho.forEach(function (botao) {
            botao.setAttribute("aria-label", "Carrinho, " + totalItens + " " + (totalItens === 1 ? "item" : "itens"));
        });

        // Lista de itens no offcanvas (nem toda página tem os elementos do carrinho)
        var lista = document.getElementById("carrinho-lista");
        var vazio = document.getElementById("carrinho-vazio");
        var subtotalEl = document.getElementById("carrinho-subtotal");

        if (!lista || !vazio || !subtotalEl) return;

        lista.innerHTML = "";

        if (carrinho.length === 0) {
            vazio.classList.remove("d-none");
        } else {
            vazio.classList.add("d-none");

            carrinho.forEach(function (item) {
                var linha = document.createElement("div");
                linha.className = "cart-item";
                linha.setAttribute("data-id", item.id);

                linha.innerHTML =
                    '<img src="' + resolverCaminhoImagem(item.imagem) + '" alt="' + item.nome + '" class="cart-item-img">' +
                    '<div class="cart-item-info">' +
                    '<p class="cart-item-name">' + item.nome + '</p>' +
                    '<p class="cart-item-price">' + formatarPreco(item.preco) + '</p>' +
                    '<div class="cart-item-qty">' +
                    '<button type="button" class="qty-btn" data-action="diminuir" aria-label="Diminuir quantidade">−</button>' +
                    '<span class="qty-value">' + item.quantidade + '</span>' +
                    '<button type="button" class="qty-btn" data-action="aumentar" aria-label="Aumentar quantidade">+</button>' +
                    '</div>' +
                    '</div>' +
                    '<button type="button" class="cart-item-remove" data-action="remover" aria-label="Remover ' + item.nome + ' do carrinho">' +
                    '<i class="fa-solid fa-trash" aria-hidden="true"></i>' +
                    '</button>';

                lista.appendChild(linha);
            });
        }

        var subtotal = carrinho.reduce(function (soma, item) {
            return soma + (item.preco * item.quantidade);
        }, 0);
        subtotalEl.textContent = formatarPreco(subtotal);
    }

    /* ---------- Botões "Adicionar ao carrinho" (página de Categorias) ---------- */
    var botoesAdicionar = document.querySelectorAll(".btn-add-to-cart");
    botoesAdicionar.forEach(function (botao) {
        botao.addEventListener("click", function () {
            var cartao = botao.closest("[data-product-id]");
            if (!cartao) return;

            var produto = {
                id: cartao.getAttribute("data-product-id"),
                nome: cartao.getAttribute("data-product-name") || "Produto",
                preco: parseFloat(cartao.getAttribute("data-product-price")) || 0,
                imagem: cartao.getAttribute("data-product-image") || ""
            };

            adicionarAoCarrinho(produto);

            // Abre o carrinho para o cliente ver o item adicionado
            var offcanvasEl = document.getElementById("carrinho-offcanvas");
            if (offcanvasEl && window.bootstrap) {
                var instancia = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
                instancia.show();
            }
        });
    });

    /* ---------- Ações dentro do carrinho (aumentar, diminuir, remover) ---------- */
    var listaCarrinho = document.getElementById("carrinho-lista");
    if (listaCarrinho) {
        listaCarrinho.addEventListener("click", function (event) {
            var botao = event.target.closest("[data-action]");
            if (!botao) return;

            var linha = botao.closest("[data-id]");
            if (!linha) return;

            var id = linha.getAttribute("data-id");
            var acao = botao.getAttribute("data-action");

            if (acao === "aumentar") {
                alterarQuantidade(id, 1);
            } else if (acao === "diminuir") {
                alterarQuantidade(id, -1);
            } else if (acao === "remover") {
                removerDoCarrinho(id);
            }
        });
    }

    /* ---------- Inicialização ---------- */
    renderCart();
})();
