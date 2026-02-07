import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/uploads`;

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<UploadResponse>(`${this.baseUrl}/image`, formData);
  }

  getImageUrl(filename: string): string {
    return `${environment.apiUrl}/uploads/products/${filename}`;
  }
}
