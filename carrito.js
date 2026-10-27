(() => {
    const storageKey = "zonaGamerCart";
    const legacyStorageKey = "products";

    function normalizeItem(item) {
        if (!item || typeof item !== "object") return null;

        const id = String(item.id ?? "").trim();
        const name = String(item.name ?? item.title ?? "").trim();
        const price = Number(item.price);
        const quantity = Math.floor(Number(item.quantity));

        if (!id || !name || !Number.isFinite(price) || price < 0) return null;

        return {
            id,
            name,
            price,
            image: String(item.image ?? item.img ?? ""),
            quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1
        };
    }

    function readCart() {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved !== null) {
                const items = JSON.parse(saved);
                return Array.isArray(items) ? items.map(normalizeItem).filter(Boolean) : [];
            }

            // Import carts created by the previous store script once.
            const legacy = JSON.parse(localStorage.getItem(legacyStorageKey) || "[]");
            return Array.isArray(legacy) ? legacy.map(normalizeItem).filter(Boolean) : [];
        } catch {
            return [];
        }
    }

    function saveCart(items) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(items));
        } catch (error) {
            console.error("No se pudo guardar el carrito:", error);
        }
        updateCartCount(items);
        renderSalePage(items);
    }

    function updateCartCount(items) {
        const badge = document.getElementById("cartCount");
        if (badge) {
            badge.textContent = items.reduce((sum, item) => sum + item.quantity, 0);
        }
    }

    function renderSalePage(items) {
        const list = document.getElementById("saleItems");
        if (!list) return;

        const emptyMessage = document.getElementById("saleEmpty");
        const totalElement = document.getElementById("saleTotal");
        const clearButton = document.getElementById("clearCart");
        let total = 0;
        list.replaceChildren();

        items.forEach((item) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const article = document.createElement("article");
            article.className = "sale-item";

            const image = document.createElement("img");
            image.src = item.image || "img/logo2.png";
            image.alt = item.name;
            image.onerror = () => {
                image.onerror = null;
                image.src = "img/logo2.png";
            };

            const details = document.createElement("div");
            details.className = "sale-item-details";
            const name = document.createElement("h2");
            name.textContent = item.name;
            const unitPrice = document.createElement("p");
            unitPrice.textContent = `Precio: S/ ${item.price.toFixed(2)}`;
            const quantityText = document.createElement("p");
            quantityText.textContent = `Cantidad: ${item.quantity}`;
            details.append(name, unitPrice, quantityText);

            const actions = document.createElement("div");
            actions.className = "sale-item-actions";
            const subtotalText = document.createElement("strong");
            subtotalText.textContent = `S/ ${subtotal.toFixed(2)}`;
            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Eliminar";
            removeButton.addEventListener("click", () => {
                saveCart(readCart().filter((cartItem) => cartItem.id !== item.id));
            });
            actions.append(subtotalText, removeButton);
            article.append(image, details, actions);
            list.appendChild(article);
        });

        if (totalElement) totalElement.textContent = `S/ ${total.toFixed(2)}`;
        if (emptyMessage) emptyMessage.hidden = items.length > 0;
        if (clearButton) clearButton.hidden = items.length === 0;
    }

    function productFromCard(button) {
        const card = button.closest(".card");
        if (!card) return null;

        const name = card.querySelector("h3")?.textContent.trim();
        const priceText = card.querySelector(".precio")?.textContent ?? "";
        const price = Number(priceText.replace("S/", "").trim());
        const image = card.querySelector("img")?.getAttribute("src") ?? "";
        const id = button.dataset.id;

        if (!id || !name || !Number.isFinite(price)) return null;
        return { id: String(id), name, price, image, quantity: 1 };
    }

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        if (target.closest("#clearCart")) {
            saveCart([]);
            return;
        }

        const storeButton = target.closest(".boton-mas");
        const dataButton = target.closest("[data-add-to-cart]");
        const button = storeButton || dataButton;
        if (!button) return;

        const item = storeButton
            ? productFromCard(storeButton)
            : normalizeItem({
                id: button.dataset.id,
                name: button.dataset.name,
                price: button.dataset.price,
                image: button.dataset.image,
                quantity: 1
            });
        if (!item) return;

        const items = readCart();
        const existing = items.find((cartItem) => cartItem.id === item.id);
        if (existing) existing.quantity += 1;
        else items.push(item);
        saveCart(items);
    });

    function initializeCart() {
        saveCart(readCart());
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeCart, { once: true });
    } else {
        initializeCart();
    }
})();
