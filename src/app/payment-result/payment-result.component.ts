import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../core/services/session.service';
import { SocketService } from '../core/services/socket.service';

@Component({
  selector: 'app-payment-result',
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-result.component.html',
  styleUrl: './payment-result.component.css'
})
export class PaymentResultComponent implements OnInit, OnDestroy {
  sessionService = inject(SessionService);
  socketService = inject(SocketService);
  router = inject(Router);

  isSuccess = false;
  transactionStatus = 'PROCESSING';
  message = 'Procesando transacción...';
  countdown = 15;
  private redirectTimer?: ReturnType<typeof setTimeout>;
  private countdownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const sessionContext = this.sessionService.getSessionContext();

    // Check if we have a valid session
    if (!sessionContext.rt_session_id) {
      localStorage.clear();
      this.router.navigate(['/']);
      return;
    }

    // Determine status based on current action
    const action = sessionContext.action;

    if (action === 'FINISH') {
      this.isSuccess = true;
      this.transactionStatus = 'PROCESSING';
      this.message = 'Tu transacción está siendo verificada...';
    } /* else if (action?.includes('ERROR')) {
      this.isSuccess = false;
      this.transactionStatus = 'ERROR';
      this.message = 'Hubo un error procesando tu transacción.';
    } else {
      this.transactionStatus = 'PROCESSING';
      this.message = 'Tu transacción está siendo verificada...';
    } */

    // Start countdown for ALL states (success, error, processing)
    this.startRedirectCountdown();

    // Listen for session updates
    this.socketService.onSessionUpdate().subscribe((data) => {
      if (data.action === 'FINISH') {
        this.isSuccess = true;
        this.transactionStatus = 'PROCESSING';
        this.message = 'Tu transacción está siendo verificada...';
      }
    });

    console.log('Payment result page loaded. Status:', this.transactionStatus);
  }

  private startRedirectCountdown(): void {
    // Clear any existing timers
    this.clearTimers();

    console.log('🎉 Starting 15 second countdown to redirect home');

    // Update countdown every second
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      console.log(`⏰ Redirecting in ${this.countdown} seconds...`);

      if (this.countdown <= 0) {
        this.clearTimers();
      }
    }, 1000);

    // Redirect after 15 seconds
    this.redirectTimer = setTimeout(() => {
      this.redirectToHome();
    }, 15000);
  }

  private redirectToHome(): void {
    console.log('🏠 Redirecting to home and cleaning up...');

    // Clear all localStorage data
    console.log('🧹 Clearing all localStorage...');
    localStorage.clear();
    console.log('✅ localStorage cleared');

    // Disconnect socket
    console.log('🔌 Disconnecting socket...');
    this.socketService.disconnect();
    console.log('✅ Socket disconnected');

    // Redirect to home
    this.router.navigate(['/']);
  }

  private clearTimers(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = undefined;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    // Clean up timers when component is destroyed
    this.clearTimers();
  }
}
