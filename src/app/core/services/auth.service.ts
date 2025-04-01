import {jwtDecode} from 'jwt-decode';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

login(loginRequest: LoginRequest): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/login`,
    loginRequest,
    { responseType: 'text' }
  ).pipe(
    tap(response => {
      localStorage.setItem('auth-token', response);
    }),
    catchError(this.handleError)
  );
}


  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, data).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      catchError(error => {
        console.error('Logout failed:', error);
        return throwError(() => error);
      }),
      tap(() => {
        this.clearAuthAndRedirect();
      })
    ).subscribe({
      error: () => {
        this.clearAuthAndRedirect();
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  getUserInfoFromToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  private clearAuthAndRedirect(): void {
    localStorage.removeItem('auth-token');
    this.router.navigate(['/authentication/login']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('An error occurred:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
