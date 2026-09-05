export enum ProductCategory {
  Makeup = "Makeup",
  Accessories = "Accessories",
  Bags = "Bags",
}

export type ProductBadge = "New" | "Bestseller" | "Limited";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: ProductCategory;
  description: string;
  rating: number;
  badge?: ProductBadge;
}

export interface CartLine extends Product {
  quantity: number;
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export type ViewName = "home" | "store" | "about" | "cart" | "wishlist";

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
}

export interface PromoCode {
  code: string;
  discount: number;
}
