export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  category?: Category;
  presentation: string;
  concentration: string;
  image?: string;
  status: number;
  batches?: MedicineBatch[];
}

export interface MedicineBatch {
  id: number;
  product_id: number;
  product?: Product;
  expiration_date: string;
  stock: number;
  purchase_price: number;
  sale_price: number;
  status: number;
}

