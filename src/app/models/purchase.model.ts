import { Supplier } from './supplier.model';
import { User } from './user.model';
import { MedicineBatch } from './product.model';

export interface PurchaseDetail {
  id: number;
  purchase_id: number;
  batch_id: number;
  batch?: MedicineBatch;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Purchase {
  id: number;
  user_id: number;
  user?: User;
  supplier_id: number;
  supplier?: Supplier;
  purchase_date: string;
  payment_method: string;
  total: number;
  details?: PurchaseDetail[];
}


