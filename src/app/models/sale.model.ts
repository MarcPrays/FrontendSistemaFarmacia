import { Client } from './client.model';
import { User } from './user.model';
import { MedicineBatch } from './product.model';

export interface SalesDetail {
  id: number;
  sale_id: number;
  batch_id: number;
  batch?: MedicineBatch;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  client_id: number;
  client?: Client;
  user_id: number;
  user?: User;
  sale_date: string;
  total: number;
  payment_method: string;
  details?: SalesDetail[];
}


