import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto } from '../../shared/models/product';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getFeatured(limit: number = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/featured?limit=${limit}`);
  }

  getOnSale(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/on-sale`);
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/category/${category}`);
  }

  create(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  update(id: number, product: UpdateProductDto): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
