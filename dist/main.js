import { fetchProducts } from "./products.js";
import { Cart } from "./cart.js";
import { Wishlist } from "./wishlist.js";
const cart = new Cart();
const wishlist = new Wishlist();
let PRODUCTS = [];
function el(tag, className) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    return node;
}
function money(amount) {
    return `$${amount.toFixed(2)}`;
}
function stars(rating) {
    const full = Math.round(rating);
    return `<span class="text-gold text-xs tracking-wide" aria-label="${rating} out of 5">${"★".repeat(full)}${"☆".repeat(5 - full)}</span>`;
}
function badgeLabel(badge) {
    if (!badge)
        return "";
    return `<span class="absolute top-3 left-3 bg-wine text-cream text-[10px] tracking-[0.15em] uppercase px-2.5 py-1">${badge}</span>`;
}
function heartIcon(filled) {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20.3s-7.2-4.4-9.7-8.6C.7 8.1 2.5 4.3 6.3 4.3c2 0 3.5 1.1 4.4 2.5.9-1.4 2.4-2.5 4.4-2.5 3.8 0 5.6 3.8 3.9 7.4-2.5 4.2-9.6 8.6-9.6 8.6z"/>
  </svg>`;
}
function closeIconSvg() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>`;
}
const views = {
    home: document.getElementById("view-home"),
    store: document.getElementById("view-store"),
    about: document.getElementById("view-about"),
    cart: document.getElementById("view-cart"),
    wishlist: document.getElementById("view-wishlist"),
};
const navLinks = Array.from(document.querySelectorAll("[data-view-link]"));
function setView(name) {
    Object.keys(views).forEach((key) => {
        views[key].classList.toggle("hidden", key !== name);
    });
    navLinks.forEach((link) => {
        const isActive = link.dataset.viewLink === name;
        link.classList.toggle("text-wine", isActive);
        link.classList.toggle("text-ink/60", !isActive);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", `#${name}`);
    if (name === "cart")
        renderCartPage();
    if (name === "wishlist")
        renderWishlistPage();
    closeCart();
    closeMobileMenu();
}
const themeToggle = document.getElementById("theme-toggle");
function setTheme(theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("velour-theme", theme);
}
themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
});
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
function closeMobileMenu() {
    mobileNav.classList.add("hidden");
}
mobileMenuToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("hidden");
});
navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        setView(link.dataset.viewLink);
    });
});
document.querySelectorAll("[data-go-store]").forEach((btn) => {
    btn.addEventListener("click", () => setView("store"));
});
document.querySelectorAll("[data-go-cart]").forEach((btn) => {
    btn.addEventListener("click", () => setView("cart"));
});
document.querySelectorAll("[data-category-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.categoryJump;
        activeCategory = category;
        setView("store");
        categoryButtons.forEach((b) => {
            const active = b.dataset.category === category;
            b.classList.toggle("bg-wine", active);
            b.classList.toggle("text-cream", active);
            b.classList.toggle("border-wine", active);
            b.classList.toggle("text-ink/70", !active);
        });
        renderGrid();
    });
});
const grid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const categoryButtons = Array.from(document.querySelectorAll("[data-category]"));
const resultCount = document.getElementById("result-count");
let activeCategory = "All";
function filteredProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const sort = sortSelect.value;
    let list = PRODUCTS.filter((p) => activeCategory === "All" || p.category === activeCategory);
    if (query) {
        list = list.filter((p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }
    switch (sort) {
        case "price-asc":
            list = [...list].sort((a, b) => a.price - b.price);
            break;
        case "price-desc":
            list = [...list].sort((a, b) => b.price - a.price);
            break;
        case "name-asc":
            list = [...list].sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }
    return list;
}
function renderProductCard(product) {
    const card = el("article", "group border border-line bg-surface flex flex-col");
    const saved = wishlist.has(product.id);
    card.innerHTML = `
    <div class="relative aspect-[4/5] overflow-hidden bg-blush">
      <img src="${product.image}" alt="${product.name}" loading="lazy"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ${badgeLabel(product.badge)}
      <button type="button" data-wishlist="${product.id}" aria-label="Save to wishlist"
        class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-cream/90 text-wine">
        ${heartIcon(saved)}
      </button>
      <button type="button" data-quick-view="${product.id}"
        class="absolute inset-x-0 bottom-0 bg-ink/85 text-cream text-xs tracking-[0.15em] uppercase py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        Quick View
      </button>
    </div>
    <div class="p-5 flex flex-col flex-1">
      <p class="text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-1">${product.category}</p>
      <h3 class="font-serif text-lg text-ink leading-snug mb-1">${product.name}</h3>
      <div class="mb-3">${stars(product.rating)}</div>
      <div class="mt-auto flex items-center justify-between pt-2">
        <span class="font-serif text-base text-wine">${money(product.price)}</span>
        <button type="button" data-add="${product.id}"
          class="text-xs tracking-wide border border-line px-3 py-2 hover:bg-wine hover:text-cream hover:border-wine transition-colors">
          + Add to Bag
        </button>
      </div>
    </div>
  `;
    return card;
}
function renderGrid() {
    const list = filteredProducts();
    grid.innerHTML = "";
    if (list.length === 0) {
        const empty = el("p", "col-span-full text-center text-ink/50 py-20 font-serif text-lg");
        empty.textContent = "No pieces match your search — try another term or category.";
        grid.appendChild(empty);
    }
    else {
        list.forEach((p) => grid.appendChild(renderProductCard(p)));
    }
    resultCount.textContent = `${list.length} ${list.length === 1 ? "piece" : "pieces"}`;
}
categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        activeCategory = btn.dataset.category ?? "All";
        categoryButtons.forEach((b) => {
            const active = b === btn;
            b.classList.toggle("bg-wine", active);
            b.classList.toggle("text-cream", active);
            b.classList.toggle("border-wine", active);
            b.classList.toggle("text-ink/70", !active);
        });
        renderGrid();
    });
});
searchInput.addEventListener("input", renderGrid);
sortSelect.addEventListener("change", renderGrid);
document.addEventListener("click", (e) => {
    const target = e.target;
    const addBtn = target.closest("[data-add]");
    if (addBtn) {
        const product = PRODUCTS.find((p) => p.id === addBtn.dataset.add);
        if (product) {
            cart.add(product, 1);
            showToast(`${product.name} added to your bag`);
        }
        return;
    }
    const wishBtn = target.closest("[data-wishlist]");
    if (wishBtn) {
        const product = PRODUCTS.find((p) => p.id === wishBtn.dataset.wishlist);
        if (product) {
            const saved = wishlist.toggle(product);
            showToast(saved ? "Saved to your wishlist" : "Removed from wishlist");
        }
        return;
    }
    const wishRemoveBtn = target.closest("[data-wishlist-remove]");
    if (wishRemoveBtn) {
        wishlist.remove(wishRemoveBtn.dataset.wishlistRemove);
        return;
    }
    const quickViewBtn = target.closest("[data-quick-view]");
    if (quickViewBtn) {
        const product = PRODUCTS.find((p) => p.id === quickViewBtn.dataset.quickView);
        if (product)
            openQuickView(product);
        return;
    }
});
const quickViewModal = document.getElementById("quick-view-modal");
const quickViewContent = document.getElementById("quick-view-content");
const quickViewClose = document.getElementById("quick-view-close");
function openQuickView(product) {
    quickViewContent.innerHTML = `
    <div class="aspect-square bg-blush">
      <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
    </div>
    <div class="p-8 flex flex-col">
      <p class="text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-2">${product.category}</p>
      <h2 class="font-serif text-2xl text-ink leading-snug mb-2">${product.name}</h2>
      <div class="mb-4">${stars(product.rating)}</div>
      <p class="text-sm text-ink/60 leading-relaxed mb-6">${product.description}</p>
      <p class="font-serif text-xl text-wine mb-6">${money(product.price)}</p>
      <button type="button" data-add="${product.id}" data-close-quick-view
        class="bg-wine text-cream py-3 text-sm tracking-wide hover:bg-ink transition-colors">
        + Add to Bag
      </button>
    </div>
  `;
    quickViewModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}
function closeQuickView() {
    quickViewModal.classList.add("hidden");
    document.body.style.overflow = "";
}
quickViewClose.addEventListener("click", closeQuickView);
quickViewModal.addEventListener("click", (e) => {
    if (e.target === quickViewModal)
        closeQuickView();
    if (e.target.closest("[data-close-quick-view]"))
        closeQuickView();
});
const cartToggle = document.getElementById("cart-toggle");
const cartBadge = document.getElementById("cart-badge");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");
const cartLines = document.getElementById("cart-lines");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartEmptyMsg = document.getElementById("cart-empty");
const wishlistBadge = document.getElementById("wishlist-badge");
function openCart() {
    cartDrawer.classList.remove("translate-x-full");
    cartOverlay.classList.remove("hidden");
}
function closeCart() {
    cartDrawer.classList.add("translate-x-full");
    cartOverlay.classList.add("hidden");
}
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
function lineControls(id, quantity) {
    return `
    <div class="flex items-center gap-2">
      <button class="w-6 h-6 border border-line text-ink/70 hover:border-wine" data-dec="${id}">−</button>
      <span class="w-6 text-center text-sm">${quantity}</span>
      <button class="w-6 h-6 border border-line text-ink/70 hover:border-wine" data-inc="${id}">+</button>
      <button class="ml-auto text-xs text-ink/40 hover:text-wine underline" data-remove="${id}">Remove</button>
    </div>`;
}
function renderCartLine(line) {
    const row = el("div", "flex gap-4 py-4 border-b border-line");
    row.innerHTML = `
    <img src="${line.image}" alt="${line.name}" class="w-16 h-16 shrink-0 object-cover bg-blush" />
    <div class="flex-1 min-w-0">
      <p class="font-serif text-sm text-ink truncate">${line.name}</p>
      <p class="text-xs text-ink/50 mb-2">${money(line.price)} each</p>
      ${lineControls(line.id, line.quantity)}
    </div>
  `;
    return row;
}
function wireCartRowEvents(container) {
    container.querySelectorAll("[data-dec]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.dec;
            const line = cart.items.find((l) => l.id === id);
            if (line)
                cart.setQuantity(id, line.quantity - 1);
        });
    });
    container.querySelectorAll("[data-inc]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.inc;
            const line = cart.items.find((l) => l.id === id);
            if (line)
                cart.setQuantity(id, line.quantity + 1);
        });
    });
    container.querySelectorAll("[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => cart.remove(btn.dataset.remove));
    });
}
function renderCart() {
    cartLines.innerHTML = "";
    const items = cart.items;
    cartEmptyMsg.classList.toggle("hidden", items.length > 0);
    items.forEach((line) => cartLines.appendChild(renderCartLine(line)));
    wireCartRowEvents(cartLines);
    cartSubtotal.textContent = money(cart.subtotal);
    cartBadge.textContent = String(cart.itemCount);
    cartBadge.classList.toggle("hidden", cart.itemCount === 0);
    wishlistBadge.textContent = String(wishlist.count);
    wishlistBadge.classList.toggle("hidden", wishlist.count === 0);
    renderGrid();
    if (!views.cart.classList.contains("hidden"))
        renderCartPage();
}
const cartPageLines = document.getElementById("cart-page-lines");
const cartPageEmpty = document.getElementById("cart-page-empty");
const cartPageSummary = document.getElementById("cart-page-summary");
const cartPageSubtotal = document.getElementById("cart-page-subtotal");
const cartPageDiscountRow = document.getElementById("cart-page-discount-row");
const cartPageDiscount = document.getElementById("cart-page-discount");
const cartPageShipping = document.getElementById("cart-page-shipping");
const cartPageTotal = document.getElementById("cart-page-total");
const promoForm = document.getElementById("promo-form");
const promoInput = document.getElementById("promo-input");
const promoMessage = document.getElementById("promo-message");
const checkoutBtn = document.getElementById("checkout-button");
function renderCartPage() {
    const items = cart.items;
    cartPageLines.innerHTML = "";
    if (items.length === 0) {
        cartPageEmpty.classList.remove("hidden");
        cartPageSummary.classList.add("hidden");
        return;
    }
    cartPageEmpty.classList.add("hidden");
    cartPageSummary.classList.remove("hidden");
    items.forEach((line) => {
        const row = el("div", "flex gap-5 py-6 border-b border-line");
        row.innerHTML = `
      <img src="${line.image}" alt="${line.name}" class="w-24 h-24 object-cover bg-blush" />
      <div class="flex-1 flex flex-col justify-between">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-serif text-base text-ink">${line.name}</p>
            <p class="text-xs text-ink/50 mt-1">${line.category}</p>
          </div>
          <button class="text-xs text-ink/40 hover:text-wine underline" data-remove="${line.id}">Remove</button>
        </div>
        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center gap-2">
            <button class="w-7 h-7 border border-line text-ink/70 hover:border-wine" data-dec="${line.id}">−</button>
            <span class="w-7 text-center text-sm">${line.quantity}</span>
            <button class="w-7 h-7 border border-line text-ink/70 hover:border-wine" data-inc="${line.id}">+</button>
          </div>
          <span class="font-serif text-sm text-ink">${money(line.price * line.quantity)}</span>
        </div>
      </div>
    `;
        cartPageLines.appendChild(row);
    });
    wireCartRowEvents(cartPageLines);
    cartPageSubtotal.textContent = money(cart.subtotal);
    cartPageShipping.textContent = cart.shipping === 0 ? "Free" : money(cart.shipping);
    cartPageTotal.textContent = money(cart.total);
    if (cart.discount > 0) {
        cartPageDiscountRow.classList.remove("hidden");
        cartPageDiscount.textContent = `−${money(cart.discount)}`;
    }
    else {
        cartPageDiscountRow.classList.add("hidden");
    }
}
promoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!promoInput.value.trim()) {
        promoMessage.textContent = "Enter a code first.";
        promoMessage.className = "text-xs text-wine mt-2";
        return;
    }
    const ok = cart.applyPromo(promoInput.value);
    promoMessage.textContent = ok
        ? `Code ${cart.appliedPromo?.code} applied — enjoy the discount.`
        : "That code isn't valid.";
    promoMessage.className = ok ? "text-xs text-wine mt-2" : "text-xs text-ink/50 mt-2";
});
checkoutBtn.addEventListener("click", () => {
    if (cart.items.length === 0)
        return;
    showToast("Order placed — thank you for shopping with VELOUR");
    cart.clear();
    promoInput.value = "";
    promoMessage.textContent = "";
    setView("home");
});
cart.onChange(renderCart);
const wishlistGrid = document.getElementById("wishlist-grid");
const wishlistEmpty = document.getElementById("wishlist-empty");
function renderWishlistCard(product) {
    const card = el("article", "group border border-line bg-surface flex flex-col");
    card.innerHTML = `
    <div class="relative aspect-[4/5] overflow-hidden bg-blush">
      <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
      <button type="button" data-wishlist-remove="${product.id}" aria-label="Remove from wishlist"
        class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-cream/90 text-wine">${closeIconSvg()}</button>
    </div>
    <div class="p-5 flex flex-col flex-1">
      <p class="text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-1">${product.category}</p>
      <h3 class="font-serif text-lg text-ink leading-snug mb-3">${product.name}</h3>
      <div class="mt-auto flex items-center justify-between pt-2">
        <span class="font-serif text-base text-wine">${money(product.price)}</span>
        <button type="button" data-add="${product.id}"
          class="text-xs tracking-wide border border-line px-3 py-2 hover:bg-wine hover:text-cream hover:border-wine transition-colors">
          + Add to Bag
        </button>
      </div>
    </div>
  `;
    return card;
}
function renderWishlistPage() {
    const items = wishlist.items;
    wishlistGrid.innerHTML = "";
    wishlistEmpty.classList.toggle("hidden", items.length > 0);
    items.forEach((p) => wishlistGrid.appendChild(renderWishlistCard(p)));
}
wishlist.onChange(() => {
    renderGrid();
    wishlistBadge.textContent = String(wishlist.count);
    wishlistBadge.classList.toggle("hidden", wishlist.count === 0);
    if (!views.wishlist.classList.contains("hidden"))
        renderWishlistPage();
});
function renderBestsellers() {
    const container = document.getElementById("bestsellers-strip");
    if (!container)
        return;
    const bestsellers = PRODUCTS.filter((p) => p.badge === "Bestseller").slice(0, 4);
    container.innerHTML = "";
    bestsellers.forEach((p) => {
        const card = el("div", "snap-start shrink-0 w-60 border border-line bg-surface");
        card.innerHTML = `
      <div class="aspect-square bg-blush overflow-hidden">
        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" />
      </div>
      <div class="p-4">
        <p class="font-serif text-base text-ink leading-snug mb-1">${p.name}</p>
        <p class="text-sm text-ink/50">${money(p.price)}</p>
      </div>
    `;
        card.addEventListener("click", () => {
            const product = PRODUCTS.find((prod) => prod.id === p.id);
            if (product)
                openQuickView(product);
        });
        container.appendChild(card);
    });
}
let toastTimer;
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("opacity-0", "translate-y-2");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-2");
    }, 2200);
}
function initFaq() {
    document.querySelectorAll("[data-faq-trigger]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const panel = trigger.nextElementSibling;
            const icon = trigger.querySelector("[data-faq-icon]");
            if (!panel)
                return;
            const isOpen = !panel.classList.contains("hidden");
            panel.classList.toggle("hidden", isOpen);
            icon?.classList.toggle("rotate-45", !isOpen);
        });
    });
}
function initNewsletter() {
    const form = document.getElementById("newsletter-form");
    if (!form)
        return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input[type=email]");
        if (input && input.value.trim()) {
            showToast("You're on the list — welcome to VELOUR");
            form.reset();
        }
    });
}
async function init() {
    const response = await fetchProducts();
    if (response.success) {
        PRODUCTS = response.data;
    }
    const initialView = window.location.hash.replace("#", "") || "home";
    setView(views[initialView] ? initialView : "home");
    renderGrid();
    renderCart();
    renderBestsellers();
    initFaq();
    initNewsletter();
}
init();
