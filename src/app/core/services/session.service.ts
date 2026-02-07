import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionContext, SessionResponse } from '../models/session-context';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.nodeBackendUrl}/api/sessions`;
  private readonly storageKey = 'rt_session';

  /**
   * Get session context from localStorage or return default
   */
  getSessionContext(): SessionContext {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          projectId: parsed.projectId || environment.projectId,
          url: parsed.url || environment.appUrl
        };
      }
    } catch (error) {
      console.error('Error reading session from localStorage:', error);
    }

    // Return default context
    return {
      projectId: environment.projectId,
      url: environment.appUrl,
      action: 'DATA'
    };
  }

  /**
   * Save session context to localStorage
   */
  saveSessionContext(context: SessionContext): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(context));
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  }

  /**
   * Main method: Create or resume RT session
   * - If sessionId exists → sync token and action
   * - If no sessionId → create new session
   */
  async ensureSession(): Promise<void> {
    const sc = this.getSessionContext();

    // 1. Already has sessionId → sync token/action only
    if (sc.rt_session_id) {
      await this.syncSessionToken(sc);
      await this.syncSessionAction(sc);
      return;
    }

    // 2. No sessionId → create new session
    await this.createSession();
  }

  /**
   * Create new RT session
   */
  private async createSession(): Promise<void> {
    try {
      const sc = this.getSessionContext();

      const payload = {
        projectId: sc.projectId,
        url: sc.url,
        action: sc.action || 'DATA'
      };

      const response = await firstValueFrom(
        this.http.post<SessionResponse>(this.baseUrl, payload).pipe(
          timeout(8000)
        )
      );

      // Update session context with response data
      sc.rt_session_id = response.sessionId;
      sc.rt_session_token = response.sessionToken;

      // Get action from response (check both locations)
      const nodeAction = response.session?.action || response.action;
      if (nodeAction) {
        sc.action = nodeAction;
      }

      this.saveSessionContext(sc);
      console.log('RT session created:', sc.rt_session_id);
    } catch (error) {
      console.error('Error creating RT session:', error);
      throw error;
    }
  }

  /**
   * Get token if missing
   */
  private async syncSessionToken(sc: SessionContext): Promise<void> {
    // If token already exists, no need to sync
    if (sc.rt_session_token) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<SessionResponse>(this.baseUrl, {}).pipe(
          timeout(8000)
        )
      );

      if (response.sessionToken) {
        sc.rt_session_token = response.sessionToken;
        this.saveSessionContext(sc);
        console.log('RT session token synced');
      }
    } catch (error) {
      console.error('Error syncing session token:', error);
      // Non-critical error, continue execution
    }
  }

  /**
   * Sync action from server
   */
  private async syncSessionAction(sc: SessionContext): Promise<void> {
    if (!sc.rt_session_id || !sc.rt_session_token) {
      return;
    }

    try {
      const url = `${this.baseUrl}/${sc.rt_session_id}`;

      const response = await firstValueFrom(
        this.http.get<any>(url, {
          headers: {
            'Authorization': `Bearer ${sc.rt_session_token}`
          }
        }).pipe(
          timeout(8000)
        )
      );

      // Get action from response (check both locations)
      const nodeAction = response.session?.action || response.action;
      if (nodeAction) {
        sc.action = nodeAction;
        this.saveSessionContext(sc);
        console.log('RT session action synced:', nodeAction);
      }
    } catch (error) {
      console.error('Error syncing session action:', error);
      // Non-critical error, continue execution
    }
  }

  /**
   * Refresh session - Create new session even if one exists
   * Used when token has expired
   */
  async refreshSession(): Promise<void> {
    console.log('🔄 Refreshing session due to token expiration...');

    // Clear old session
    this.clearSession();

    // Create new session
    await this.createSession();

    console.log('✅ Session refreshed successfully');
  }

  /**
   * Clear session from localStorage
   */
  clearSession(): void {
    localStorage.removeItem(this.storageKey);
  }
}
