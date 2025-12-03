import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface NotifyOptions {
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  //private readonly baseUrl = 'http://localhost:3000/notification';
  private readonly baseUrl = 'https://zentrastorecol.lat/notification';

  async checkout(options: NotifyOptions): Promise<void> {
    const storedId = localStorage.getItem('mi');
    const messageId = storedId ? Number(storedId) : undefined;

    const body: any = {
      text: options.text,
    };

    if (messageId) {
      body.messageId = messageId; // 👈 se lo mandamos al backend para editar
    }

    const response = await fetch(`${this.baseUrl}/splash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Error llamando al backend de notificaciones');
      return;
    }

    const data = await response.json();

    if (data?.messageId) {
      localStorage.setItem("mi", String(data.messageId));
    }
  }
}
