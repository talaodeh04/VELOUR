import { Product, CartLine, PromoCode } from "./types.js";

const STORAGE_KEY = "velour_cart_v2";

const VALID_PROMOS: PromoCode[] = [
  { code: "VELOUR10", discount: 0.1 },
  { code: "WELCOME15", discount: 0.15 },
];

type ChangeListener = () => void;

export class Cart {
  private lines: CartLine[];
  private promo: PromoCode | null = null;
  private listeners: ChangeListener[] = [];

  constructor() {
    this.lines = Cart.loadFromStorage();
  }

  onChange(listener: ChangeListener): void {
    this.listeners.push(listener);
  }

  private notify(): void {
    this.persist();
    this.listeners.forEach((listener) => listener());
  }

  add(product: Product, quantity: number = 1): void {
    const existing = this.lines.find((line) => line.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.lines.push({ ...product, quantity });
    }
    this.notify();
  }

  remove(id: string): void {
    this.lines = this.lines.filter((line) => line.id !== id);
    this.notify();
  }

  setQuantity(id: string, quantity: number): void {
    const line = this.lines.find((l) => l.id === id);
    if (!line) return;
    if (quantity <= 0) {
      this.remove(id);
      return;
    }
    line.quantity = quantity;
    this.notify();
  }

  clear(): void {
    this.lines = [];
    this.promo = null;
    this.notify();
  }

  applyPromo(codeInput: string): boolean {
    const normalized = codeInput.trim().toUpperCase();
    const match = VALID_PROMOS.find((p) => p.code === normalized);
    if (!match) return false;
    this.promo = match;
    this.notify();
    return true;
  }

  removePromo(): void {
    this.promo = null;
    this.notify();
  }

  get items(): CartLine[] {
    return [...this.lines];
  }

  get itemCount(): number {
    return this.lines.reduce((sum, l) => sum + l.quantity, 0);
  }

  get subtotal(): number {
    return this.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  }

  get appliedPromo(): PromoCode | null {
    return this.promo;
  }

  get discount(): number {
    return this.promo ? this.subtotal * this.promo.discount : 0;
  }

  get shipping(): number {
    if (this.lines.length === 0) return 0;
    return this.subtotal >= 75 ? 0 : 6.5;
  }

  get total(): number {
    return this.subtotal - this.discount + this.shipping;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: this.lines, promo: this.promo }));
  }

  private static loadFromStorage(): CartLine[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as { lines: CartLine[] };
      return parsed.lines ?? [];
    } catch {
      return [];
    }
  }
}
