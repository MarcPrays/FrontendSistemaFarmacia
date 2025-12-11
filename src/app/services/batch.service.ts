import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicineBatch, MedicineBatchCreate } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private baseUrl = 'http://127.0.0.1:8000/batches';

  constructor(private http: HttpClient) { }

  getAll(): Observable<MedicineBatch[]> {
    return this.http.get<MedicineBatch[]>(`${this.baseUrl}/all`);
  }

  create(batch: MedicineBatchCreate): Observable<MedicineBatch> {
    return this.http.post<MedicineBatch>(`${this.baseUrl}/create`, batch);
  }

  update(id: number, batch: Partial<MedicineBatch>): Observable<MedicineBatch> {
    return this.http.put<MedicineBatch>(`${this.baseUrl}/update/`, { id, ...batch });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}