const STORAGE_KEY = "velour_wishlist_v2";
export class Wishlist {
    constructor() {
        this.listeners = [];
        this.saved = Wishlist.loadFromStorage();
    }
    onChange(listener) {
        this.listeners.push(listener);
    }
    notify() {
        this.persist();
        this.listeners.forEach((listener) => listener());
    }
    has(id) {
        return this.saved.some((p) => p.id === id);
    }
    toggle(product) {
        const exists = this.has(product.id);
        this.saved = exists ? this.saved.filter((p) => p.id !== product.id) : [...this.saved, product];
        this.notify();
        return !exists;
    }
    remove(id) {
        this.saved = this.saved.filter((p) => p.id !== id);
        this.notify();
    }
    get items() {
        return [...this.saved];
    }
    get count() {
        return this.saved.length;
    }
    persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saved));
    }
    static loadFromStorage() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        try {
            return JSON.parse(raw);
        }
        catch {
            return [];
        }
    }
}
