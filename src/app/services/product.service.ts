import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product,
  ProductCreate,
  ProductUpdate
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://127.0.0.1:8000/products';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/all`);
  }

  create(product: ProductCreate): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/create`, product);
  }


  // Si el endpoint espera el ID en la URL (como /delete/5), ajusta así:
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  createProductWithImage(
    name: string,
    description: string | null,
    category_id: number,
    presentation: string | null,
    concentration: string | null,
    imageFile: File | null
  ): Observable<Product> {
    const formData = new FormData();

    // Campos obligatorios
    formData.append('name', name.trim());
    formData.append('category_id', category_id.toString());

    // Campos opcionales
    if (description && description.trim()) {
      formData.append('description', description.trim());
    }
    if (presentation && presentation.trim()) {
      formData.append('presentation', presentation.trim());
    }
    if (concentration && concentration.trim()) {
      formData.append('concentration', concentration.trim());
    }

    // Imagen
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post<Product>(`${this.baseUrl}/create`, formData);
  }


  // Dentro de ProductService

  updateProductWithImage(
    id: number,
    name: string,
    description: string | null,
    category_id: number,
    presentation: string | null,
    concentration: string | null,
    imageFile: File | null
  ): Observable<Product> {
    const formData = new FormData();

    formData.append('product_id', id.toString()); //  ¡Importante!
    formData.append('name', name.trim());
    formData.append('category_id', category_id.toString());

    if (description && description.trim()) {
      formData.append('description', description.trim());
    }
    if (presentation && presentation.trim()) {
      formData.append('presentation', presentation.trim());
    }
    if (concentration && concentration.trim()) {
      formData.append('concentration', concentration.trim());
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.put<Product>(`${this.baseUrl}/update`, formData);
  }

  // Alternativa: si delete recibe el ID en el body (menos común), usar POST/PUT.
  // Pero según tu descripción, parece que va en la URL.
}