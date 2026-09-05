const STORAGE_KEY = "velour_cart_v2";
const VALID_PROMOS = [
    { code: "VELOUR10", discount: 0.1 },
    { code: "WELCOME15", discount: 0.15 },
];
export class Cart {
    constructor() {
        this.promo = null;
        this.listeners = [];
        this.lines = Cart.loadFromStorage();
    }
    onChange(listener) {
        this.listeners.push(listener);
    }
    notify() {
        this.persist();
        this.listeners.forEach((listener) => listener());
    }
    add(product, quantity = 1) {
        const existing = this.lines.find((line) => line.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        }
        else {
            this.lines.push({ ...product, quantity });
        }
        this.notify();
    }
    remove(id) {
        this.lines = this.lines.filter((line) => line.id !== id);
        this.notify();
    }
    setQuantity(id, quantity) {
        const line = this.lines.find((l) => l.id === id);
        if (!line)
            return;
        if (quantity <= 0) {
            this.remove(id);
            return;
        }
        line.quantity = quantity;
        this.notify();
    }
    clear() {
        this.lines = [];
        this.promo = null;
        this.notify();
    }
    applyPromo(codeInput) {
        const normalized = codeInput.trim().toUpperCase();
        const match = VALID_PROMOS.find((p) => p.code === normalized);
        if (!match)
            return false;
        this.promo = match;
        this.notify();
        return true;
    }
    removePromo() {
        this.promo = null;
        this.notify();
    }
    get items() {
        return [...this.lines];
    }
    get itemCount() {
        return this.lines.reduce((sum, l) => sum + l.quantity, 0);
    }
    get subtotal() {
        return this.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    }
    get appliedPromo() {
        return this.promo;
    }
    get discount() {
        return this.promo ? this.subtotal * this.promo.discount : 0;
    }
    get shipping() {
        if (this.lines.length === 0)
            return 0;
        return this.subtotal >= 75 ? 0 : 6.5;
    }
    get total() {
        return this.subtotal - this.discount + this.shipping;
    }
    persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: this.lines, promo: this.promo }));
    }
    static loadFromStorage() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        try {
            const parsed = JSON.parse(raw);
            return parsed.lines ?? [];
        }
        catch {
            return [];
        }
    }
}
