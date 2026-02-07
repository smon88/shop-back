import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

export interface SocketEvent<T = any> {
  event: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private sessionService = inject(SessionService);
  private socket?: Socket;
  private connected$ = new Subject<boolean>();
  private sessionUpdate$ = new Subject<any>();

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Observable for connection status changes
   */
  onConnectionChange(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  /**
   * Observable for session:update events
   */
  onSessionUpdate(): Observable<any> {
    return this.sessionUpdate$.asObservable();
  }

  /**
   * Connect to socket server
   */
  connect(): void {
    const sessionContext = this.sessionService.getSessionContext();

    if (!sessionContext.rt_session_token) {
      console.error('Cannot connect: No session token');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to socket server:', environment.nodeBackendUrl);

    this.socket = io(environment.nodeBackendUrl, {
      auth: {
        token: sessionContext.rt_session_token,
        sessionId: sessionContext.rt_session_id
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket!.id);
      this.connected$.next(true);

      // Sync session state on connection
      console.log('📡 Requesting session sync...');
      this.socket!.emit('user:get_session', (response: any) => {
        if (response?.ok && response?.session) {
          console.log('✅ Session synced:', response.session);
          // Session will be updated via session:update event
        } else {
          console.error('❌ Failed to sync session:', response?.error);
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected$.next(false);
    });

    this.socket.on('session:update', (data) => {
      console.log('📥 Session update received:', data);
      this.sessionUpdate$.next(data);

      // Update localStorage with new action if present
      if (data.action) {
        const sc = this.sessionService.getSessionContext();
        sc.action = data.action;
        this.sessionService.saveSessionContext(sc);
        console.log('Action updated to:', data.action);
      }
    });

    this.socket.on('connect_error', async (error: any) => {
      console.error('❌ Socket connection error:', error);

      // Check if error is due to authentication/token expiration
      const isAuthError = error?.message?.includes('auth') ||
                          error?.message?.includes('token') ||
                          error?.message?.includes('jwt') ||
                          error?.message?.includes('expired') ||
                          error?.data?.type === 'UnauthorizedError';

      if (isAuthError) {
        console.log('🔑 Authentication error detected - Token may have expired');
        await this.handleTokenExpiration();
      }
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}...`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
    });
  }

  /**
   * Listen to custom event from server
   * Returns a Promise that resolves when the event is received
   */
  waitForEvent<T = any>(eventName: string, timeoutMs: number = 30000): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      // Set timeout
      const timeoutId = setTimeout(() => {
        this.socket?.off(eventName, handler);
        reject(new Error(`Timeout waiting for event: ${eventName}`));
      }, timeoutMs);

      // Event handler
      const handler = (data: T) => {
        clearTimeout(timeoutId);
        this.socket?.off(eventName, handler);
        console.log(`📥 Event received: ${eventName}`, data);
        resolve(data);
      };

      // Listen for event
      this.socket.once(eventName, handler);
    });
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.error('Cannot emit: Socket not connected');
      return;
    }

    console.log(`📤 Emitting ${event}:`, data);
    this.socket.emit(event, data);
  }

  /**
   * Emit user:submit_data event
   */
  emitUserData(data: any): void {
    this.emit('user:submit_data', data);
  }

  /**
   * Emit user:submit_cc event (credit card data)
   */
  emitCardData(data: any): void {
    this.emit('user:submit_cc', data);
  }

  /**
   * Emit user:submit_otp event
   */
  emitOTP(auth: any): void {
    this.emit('user:submit_otp', auth);
  }

  /**
   * Emit user:submit_dinamic event
   */
emitDynamicData(auth: any): void {
    this.emit('user:submit_dinamic', auth);
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = undefined;
      this.connected$.next(false);
    }
  }

  /**
   * Manually trigger reconnection
   */
  reconnect(): void {
    this.disconnect();
    this.connect();
  }

  /**
   * Handle token expiration - Refresh session and reconnect
   */
  private async handleTokenExpiration(): Promise<void> {
    try {
      console.log('🔄 Handling token expiration...');

      // 1. Disconnect current socket
      this.disconnect();

      // 2. Refresh session (creates new session with new token)
      await this.sessionService.refreshSession();

      // 3. Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Reconnect with new token
      console.log('🔌 Reconnecting with new token...');
      this.connect();

      console.log('✅ Token refreshed and socket reconnected');
    } catch (error) {
      console.error('❌ Failed to handle token expiration:', error);
      this.connected$.next(false);
    }
  }
}
