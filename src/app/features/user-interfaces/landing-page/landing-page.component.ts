import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent,RouterLink],
  animations: [
    trigger('fadeInUp', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      transition(':enter', [
        animate('0.6s ease-out')
      ])
    ]),
    trigger('fadeIn', [
      state('void', style({
        opacity: 0
      })),
      transition(':enter', [
        animate('0.8s ease-out')
      ])
    ]),
    trigger('slideInRight', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(-20px)'
      })),
      transition(':enter', [
        animate('0.6s ease-out')
      ])
    ]),
    trigger('pulse', [
      transition(':enter', [
        animate('1.5s ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    trigger('bounce', [
      transition(':enter', [
        animate('1s ease', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY(-15px)', offset: 0.5 }),
          style({ transform: 'translateY(0)', offset: 1 })
        ]))
      ])
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1s ease-in-out', keyframes([
          style({ transform: 'rotate(0deg)', offset: 0 }),
          style({ transform: 'rotate(360deg)', offset: 1 })
        ]))
      ])
    ]),
    trigger('flipIn', [
      state('void', style({
        opacity: 0,
        transform: 'rotateY(-90deg)'
      })),
      transition(':enter', [
        animate('0.8s ease-out')
      ])
    ])
  ],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent implements OnInit {
  searchForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      destination: [''],
      checkIn: [''],
      checkOut: [''],
      guests: ['2']
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.searchForm.valid) {
      const searchCriteria = this.searchForm.value;

      // Navigate to the search results page with query parameters
      this.router.navigate(['/search-results'], {
        queryParams: {
          destination: searchCriteria.destination,
          checkIn: searchCriteria.checkIn,
          checkOut: searchCriteria.checkOut,
          guests: searchCriteria.guests
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}