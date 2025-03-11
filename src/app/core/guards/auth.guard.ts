import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Decoded token:', decodedToken);

        if (decodedToken.role === 'ADMIN') {
          return true;
        } else {
          console.warn('User is not an admin');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    this.router.navigate(['/authentication/login']);
    return false;
  }
}
