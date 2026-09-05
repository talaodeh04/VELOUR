import { Product } from "./types.js";

const STORAGE_KEY = "velour_wishlist_v2";

type ChangeListener = () => void;

export class Wishlist {
  private saved: Product[];
  private listeners: ChangeListener[] = [];

  constructor() {
    this.saved = Wishlist.loadFromStorage();
  }

  onChange(listener: ChangeListener): void {
    this.listeners.push(listener);
  }

  private notify(): void {
    this.persist();
    this.listeners.forEach((listener) => listener());
  }

  has(id: string): boolean {
    return this.saved.some((p) => p.id === id);
  }

  toggle(product: Product): boolean {
    const exists = this.has(product.id);
    this.saved = exists ? this.saved.filter((p) => p.id !== product.id) : [...this.saved, product];
    this.notify();
    return !exists;
  }

  remove(id: string): void {
    this.saved = this.saved.filter((p) => p.id !== id);
    this.notify();
  }

  get items(): Product[] {
    return [...this.saved];
  }

  get count(): number {
    return this.saved.length;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saved));
  }

  private static loadFromStorage(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Product[];
    } catch {
      return [];
    }
  }
}
