import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true,
})
export class ImageUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    if (!url) return '';

    // Si ya es una URL completa, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si es una ruta relativa de la API, construir la URL completa
    if (url.startsWith('/api/')) {
      return `${environment.apiUrl.replace('/api', '')}${url}`;
    }

    return url;
  }
}
