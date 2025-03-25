export interface Hotel {
  id: number
  name: string
  location: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviewCount: number
  image: string
  amenities: string[]
  stars: number
  isFavorite: boolean
  distance?: string
  description: string
}
export interface HotelFormData {
  id?: string;
  name: string;
  address: string;
  city: string;
  originalPrice?: number
  discount?: number
  price?: number
  reviewCount?:number
  distance?: string
  location?: string
  country: string;
  isFavorite?: boolean
  rating: string;
  description: string;
  stars: number;
  amenities: string[];
  images: string[];
  status: "active" | "maintenance" | "closed";
  ownerId?: string;
}

