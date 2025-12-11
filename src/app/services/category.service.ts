import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las categorías
   */
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}/all`);
  }

  /**
   * Obtiene una categoría por su ID
   */
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/${id}`);
  }
}

