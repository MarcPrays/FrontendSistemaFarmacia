// Category
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// Product (para crear)
export interface ProductCreate {
  name: string;
  description?: string | null;
  category_id: number;
  presentation: string;
  concentration: string;
  image?: string | null;
}

// Product (respuesta del backend)
export interface Product {
  id: number;
  name: string;
  description?: string | null;
  category_id: number;
  presentation?: string | null;
  concentration?: string | null;
  image?: string | null;
  status: number; // 1 = activo, 0 = inactivo
  // Opcional: si quieres mantener relación localmente
  category?: Category;
  batches?: MedicineBatch[]; // solo si sigues usando batches en el frontend
}

// Para actualizar
export interface ProductUpdate {
  name?: string;
  description?: string | null;
  category_id?: number;
  presentation?: string | null;
  concentration?: string | null;
  image?: string | null;
  status?: number;
}

// Nuevo: MedicineBatchResponse
export interface MedicineBatch {
  id: number;
  product_id: number;
  expiration_date?: string; // FastAPI envía como "2025-12-31"
  stock?: number;
  purchase_price?: number;
  sale_price?: number;
  status: number;
}

// Para crear lote
export interface MedicineBatchCreate {
  product_id: number;
  expiration_date?: string;
  stock?: number;
  purchase_price?: number;
  sale_price?: number;
}
