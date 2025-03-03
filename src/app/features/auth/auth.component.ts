// auth.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  imports:[CommonModule, ReactiveFormsModule],
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

  constructor(private fb: FormBuilder) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSignIn(): void {
    if (this.signInForm.valid) {
      // Handle sign in logic
      console.log('Sign In:', this.signInForm.value);
    }
  }

  onSignUp(): void {
    if (this.signUpForm.valid) {
      // Handle sign up logic
      console.log('Sign Up:', this.signUpForm.value);
    }
  }

  togglePanel(): void {
    this.isRightPanelActive = !this.isRightPanelActive;
  }
}
