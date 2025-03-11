import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../core/models/auth.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('formAnimation', [
      state('signIn', style({
        transform: 'translateX(0)'
      })),
      state('signUp', style({
        transform: 'translateX(100%)'
      })),
      transition('signIn <=> signUp', [
        animate('0.6s ease-in-out')
      ])
    ]),
    trigger('overlayAnimation', [
      state('signIn', style({
        transform: 'translateX(0)'
      })),
      state('signUp', style({
        transform: 'translateX(-100%)'
      })),
      transition('signIn <=> signUp', [
        animate('0.6s ease-in-out')
      ])
    ]),
    trigger('panelAnimation', [
      state('signIn', style({
        transform: 'translateX(0)'
      })),
      state('signUp', style({
        transform: 'translateX(0)'
      })),
      transition('signIn <=> signUp', [
        animate('0.6s ease-in-out')
      ])
    ])
  ]
})
export class AuthComponent {
  isRightPanelActive = false;
  signInForm: FormGroup;
  signUpForm: FormGroup;

  constructor(private fb: FormBuilder, @Inject(AuthService) private authService: AuthService, private router: Router) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required, Validators.pattern(/^(06|07)\d{8}$/)]]
    });
  }

  onSignIn(): void {
    if (this.signInForm.valid) {
      this.authService.login(this.signInForm.value).subscribe(
        response => {
          console.log('Login successful:', response);
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        },

        error => {
          if(!this.signInForm)
          console.log('Swal.fire should be called now');
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'password or email not correct'
          });
          console.error('Login failed:', error);
        }
      );
    }
  }

  onSignUp(): void {
    if (this.signUpForm.valid) {
      const registerRequest: RegisterRequest = {
        ...this.signUpForm.value,
        role: 'CLIENT',
        isActive: true
      };
      this.authService.register(registerRequest).subscribe(
        response => {
          this.router.navigate(['/authentication/register']).then(() => {
            window.location.reload();
          });
        },
        error => {
          console.log('Swal.fire should be called now');
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'An unknown error occurred'
          });
          console.error('Registration failed:', error);
        }
      );
    }
  }

  togglePanel(): void {
    this.isRightPanelActive = !this.isRightPanelActive;
  }
}
