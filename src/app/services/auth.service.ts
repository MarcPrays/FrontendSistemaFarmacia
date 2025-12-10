import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role_id: number;
  };
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_data';
  
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Inicia sesión con email y contraseña
   * Modo demo: Si no hay conexión con backend, usa credenciales de prueba
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Credenciales de prueba para modo demo
    const DEMO_CREDENTIALS = {
      email: 'admin@farmaciamariarios.com',
      password: 'admin123'
    };

    // Verificar si es modo demo (sin backend)
    if (credentials.email === DEMO_CREDENTIALS.email && 
        credentials.password === DEMO_CREDENTIALS.password) {
      // Simular respuesta del backend
      const mockResponse: LoginResponse = {
        access_token: 'demo_token_' + Date.now(),
        token_type: 'bearer',
        user: {
          id: 1,
          email: DEMO_CREDENTIALS.email,
          first_name: 'Admin',
          last_name: 'Farmacia Maria Rios',
          role_id: 1
        }
      };

      // Simular delay de red
      return new Observable(observer => {
        setTimeout(() => {
          this.setToken(mockResponse.access_token);
          if (mockResponse.user) {
            this.setUser(mockResponse.user);
          }
          observer.next(mockResponse);
          observer.complete();
        }, 500);
      });
    }

    // Intentar conectar con el backend real
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.access_token);
        if (response.user) {
          this.setUser(response.user);
        }
      }),
      catchError(error => {
        // Si falla la conexión, verificar si son credenciales demo
        if (error.status === 0 || error.status === 404) {
          if (credentials.email === DEMO_CREDENTIALS.email && 
              credentials.password === DEMO_CREDENTIALS.password) {
            const mockResponse: LoginResponse = {
              access_token: 'demo_token_' + Date.now(),
              token_type: 'bearer',
              user: {
                id: 1,
                email: DEMO_CREDENTIALS.email,
                first_name: 'Admin',
                last_name: 'Farmacia Maria Rios',
                role_id: 1
              }
            };
            this.setToken(mockResponse.access_token);
            if (mockResponse.user) {
              this.setUser(mockResponse.user);
            }
            return of(mockResponse);
          }
        }
        console.error('Error en login:', error);
        throw error;
      })
    );
  }

  /**
   * Cierra sesión y elimina los datos del usuario
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Si es un token demo, siempre es válido
    if (token.startsWith('demo_token_')) {
      return true;
    }

    // Verificar si el token ha expirado
    try {
      const payload = this.decodeToken(token);
      const expirationDate = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() < expirationDate;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el token de acceso
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Guarda el token en localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Elimina el token del localStorage
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Guarda los datos del usuario
   */
  private setUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error al cargar usuario desde storage:', error);
        this.removeUser();
      }
    }
  }

  /**
   * Elimina los datos del usuario
   */
  private removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Decodifica el token JWT (sin verificación de firma, solo para leer datos)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtiene información del token (payload)
   */
  getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(roleId: number): boolean {
    const user = this.getCurrentUser();
    return user?.role_id === roleId;
  }
}

