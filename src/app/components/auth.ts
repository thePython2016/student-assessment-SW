import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private baseUrl = 'http://127.0.0.1:8000';
  private watcherId: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router) {
    this.startTokenWatcher();
  }

  /**
   * Periodically checks (every 5s) whether a valid access token still
   * exists in sessionStorage. Catches cases where the token is deleted
   * or expires WHILE the user is already sitting on a page — the guard
   * alone only runs on navigation, so this covers the gap.
   */
  private startTokenWatcher(): void {
    this.watcherId = setInterval(() => {
      const token = sessionStorage.getItem('loginToken');

      // Only act if the user currently appears logged in (has a token)
      // but that token is now missing/invalid — avoids logging out
      // someone who's simply sitting on the public /login page.
      if (token !== null && !this.isTokenValid()) {
        this.logout();
      } else if (token === null && this.router.url !== '/') {
        // token was deleted entirely while on a protected page
        this.logout();
      }
    }, 5000);
  }

  isTokenValid(): boolean {
    const token = sessionStorage.getItem('loginToken');
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      sessionStorage.setItem('loginToken', data.access);
      return data.access;
    } catch {
      this.logout();
      return null;
    }
  }

  async authFetch(url: string, options: RequestInit = {}): Promise<Response | null> {
    let token = sessionStorage.getItem('loginToken');

    const doFetch = (accessToken: string | null) =>
      fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          'Authorization': `Bearer ${accessToken}`,
        },
      });

    try {
      let response = await doFetch(token);

      if (response.status === 401) {
        token = await this.refreshAccessToken();
        if (token) {
          response = await doFetch(token);
        } else {
          this.logout();
          return null;
        }
      }

      return response;
    } catch (error) {
      // Network error, CORS failure, backend unreachable, etc.
      // Without this catch, the error propagates silently and the
      // page just hangs with no data and no redirect.
      console.error('authFetch failed:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Clears stored tokens WITHOUT navigating. Use this when the caller
   * (e.g. a route guard) is going to handle the redirect itself —
   * calling router.navigate() from a guard mid-resolution can stall
   * the router instead of redirecting.
   */
  clearSession(): void {
    if (this.watcherId !== null) {
      clearInterval(this.watcherId);
      this.watcherId = null;
    }
    sessionStorage.removeItem('loginToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('email');
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['']);
  }
}