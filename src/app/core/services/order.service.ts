import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  contactEmail: string;
  billingFirstName: string;
  billingLastName: string;
  billingDocument: string;
  billingPhone: string;
  billingCountry: string;
  billingCity: string;
  billingAddress: string;
  billingEmail: string;
  shipToDifferentAddress?: boolean;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingDocument?: string;
  shippingPhone?: string;
  shippingCountry?: string;
  shippingCity?: string;
  shippingAddress?: string;
  shippingEmail?: string;
  items: OrderItem[];
}

export interface Order {
  id: number;
  total: number;
  status: string;
  contactEmail: string;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      productId: number;
      name: string;
      urlImg: string;
    };
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  create(orderDto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, orderDto);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  getByEmail(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/by-email?email=${email}`);
  }

  cancel(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
