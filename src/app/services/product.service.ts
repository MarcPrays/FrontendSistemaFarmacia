import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface ProductCreate {
  name: string;
  description?: string;
  category_id: number;
  presentation: string;
  concentration: string;
  image?: string | File;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  presentation?: string;
  concentration?: string;
  image?: string | File;
  status?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/all`);
  }

  /**
   * Obtiene un producto por su ID
   * Usa query parameter: GET /products/?product_id={id}
   */
  getProductById(id: number): Observable<Product> {
    const params = new HttpParams().set('product_id', id.toString());
    return this.http.get<Product>(`${this.API_URL}/`, { params });
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(product: ProductCreate): Observable<Product> {
    // Validar que los campos requeridos no estén vacíos
    const name = String(product.name || '').trim();
    const categoryId = Number(product.category_id);
    const presentation = String(product.presentation || '').trim();
    const concentration = String(product.concentration || '').trim();
    
    if (!name || !categoryId || !presentation || !concentration) {
      console.error('❌ Datos inválidos para crear producto:', product);
      throw new Error('Todos los campos requeridos deben tener valores');
    }
    
    // Si hay imagen (File o base64), usar FormData
    const hasImage = product.image && (
      product.image instanceof File || 
      (typeof product.image === 'string' && product.image.startsWith('data:image'))
    );
    
    if (hasImage) {
      // Usar FormData para multipart/form-data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category_id', categoryId.toString());
      formData.append('presentation', presentation);
      formData.append('concentration', concentration);
      
      if (product.description && product.description.trim()) {
        formData.append('description', product.description.trim());
      }
      
      // Si es un File, agregarlo directamente
      if (product.image instanceof File) {
        formData.append('image', product.image);
      } else if (typeof product.image === 'string' && product.image.startsWith('data:image')) {
        // Convertir base64 a File
        const base64Data = product.image.split(',')[1];
        const mimeType = product.image.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${mimeType}` });
        const file = new File([blob], `image.${mimeType}`, { type: `image/${mimeType}` });
        formData.append('image', file);
      }
      
      console.log('🔵 POST Request (FormData):', {
        url: `${this.API_URL}/`,
        hasImage: true,
        formDataKeys: Array.from(formData.keys())
      });
      
      // No establecer Content-Type manualmente, el navegador lo hará automáticamente con el boundary
      return this.http.post<Product>(`${this.API_URL}/`, formData);
    } else {
      // Sin imagen, usar JSON
      const payload: any = {
        name: name,
        category_id: categoryId,
        presentation: presentation,
        concentration: concentration
      };
      
      if (product.description && product.description.trim()) {
        payload.description = product.description.trim();
      }
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      
      console.log('🔵 POST Request (JSON):', {
        url: `${this.API_URL}/`,
        payload: payload
      });
      
      return this.http.post<Product>(`${this.API_URL}/`, payload, { headers });
    }
  }

  /**
   * Actualiza un producto existente
   * Usa query parameter: PUT /products/?product_id={id}
   */
  updateProduct(id: number, product: ProductUpdate): Observable<Product> {
    const params = new HttpParams().set('product_id', id.toString());
    
    // IMPORTANTE: El backend SIEMPRE espera FormData (multipart/form-data)
    // porque todos los parámetros están definidos como Form(...)
    // Por lo tanto, SIEMPRE usamos FormData, incluso sin imagen
    
    const formData = new FormData();
    
    // SIEMPRE incluir campos requeridos
    // El backend espera Form(...) para todos, así que enviamos strings
    if (product.name !== undefined && product.name !== null) {
      formData.append('name', String(product.name).trim());
    }
    if (product.category_id !== undefined && product.category_id !== null) {
      formData.append('category_id', String(product.category_id));
    }
    if (product.presentation !== undefined && product.presentation !== null) {
      formData.append('presentation', String(product.presentation).trim());
    }
    if (product.concentration !== undefined && product.concentration !== null) {
      formData.append('concentration', String(product.concentration).trim());
    }
    
    // Campos opcionales
    // El backend espera Form(None), así que si es null/undefined, no lo enviamos
    // Si tiene valor (incluso string vacío), lo enviamos como string
    if (product.description !== undefined && product.description !== null) {
      const descValue = String(product.description).trim();
      // Enviar incluso si está vacío (el backend lo procesará)
      formData.append('description', descValue);
    }
    // Si es undefined o null, no lo incluimos (el backend usará None por defecto)
    if (product.status !== undefined && product.status !== null) {
      formData.append('status', String(product.status));
    }
    
    // Manejar imagen solo si existe
    const hasImage = product.image && (
      product.image instanceof File || 
      (typeof product.image === 'string' && product.image.startsWith('data:image'))
    );
    
    if (hasImage) {
      if (product.image instanceof File) {
        formData.append('image', product.image);
      } else if (typeof product.image === 'string' && product.image.startsWith('data:image')) {
        // Convertir base64 a File
        const base64Data = product.image.split(',')[1];
        const mimeType = product.image.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${mimeType}` });
        const file = new File([blob], `image.${mimeType}`, { type: `image/${mimeType}` });
        formData.append('image', file);
      }
    }
    // Si no hay imagen, no la incluimos (el backend mantendrá la existente)
    
    console.log('🟡 PUT Request (FormData - SIEMPRE):', {
      url: `${this.API_URL}/?product_id=${id}`,
      hasImage: hasImage,
      formDataKeys: Array.from(formData.keys()),
      params: params.toString()
    });
    
    return this.http.put<Product>(`${this.API_URL}/`, formData, { params });
  }

  /**
   * Elimina lógicamente un producto (cambia su status a 0)
   * Usa query parameter: DELETE /products/?product_id={id}
   */
  deleteProduct(id: number): Observable<any> {
    const params = new HttpParams().set('product_id', id.toString());
    console.log('🗑️ DELETE Request:', {
      url: `${this.API_URL}/?product_id=${id}`
    });
    return this.http.delete(`${this.API_URL}/`, { params });
  }
}

