import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import {jwtDecode} from 'jwt-decode';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  standalone: true,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit {
  userName: string | null = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('auth-token');
    console.log('Token:', token);

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Decoded token:', decodedToken); 
        this.userName = decodedToken.username || decodedToken.name || decodedToken.sub;
        console.log('Set username to:', this.userName);
      } catch (error) {
        console.error('Error decoding token:', error);
        this.userName = null;
      }
    } else {
      this.userName = null;
      console.log('No token found, userName set to null');
    }
  }

  logout(): void {
    localStorage.removeItem('auth-token');
    this.userName = null;
    this.router.navigate(['/authentication/login']);
  }
}
