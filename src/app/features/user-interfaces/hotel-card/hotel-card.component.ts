import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Hotel, HotelFormData } from "../../../core/models/hotel.interface";
import { Router } from "@angular/router";

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./hotel-card.component.html'
})
export class HotelCardComponent {
  @Input() hotel!: HotelFormData;
  @Input() viewMode: "grid" | "list" = "grid";
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() viewHotelDetails = new EventEmitter<number>();
  constructor(private router: Router) {}

  onViewDetails() {
    this.router.navigate(["/hotel-details", this.hotel.id])  }

  onToggleFavorite() {
    this.toggleFavorite.emit(this.hotel.id ? Number(this.hotel.id) : undefined);
  }
}
