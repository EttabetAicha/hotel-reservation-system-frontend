export interface Room {
  id: number
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  capacity: number
  features: string[]
  description: string
}
export enum RoomType {
  SINGLE,
  DOUBLE,
  TWIN,
  SUITE,
  DELUXE,
  EXECUTIVE,
  FAMILY,
  PRESIDENTIAL,
  STUDIO
}

export enum RoomStatus {
  AVAILABLE,
  OCCUPIED,
  MAINTENANCE,
  RESERVED
}

export interface RoomFormData {
  id?: string;
  name: string;
  hotel: string ;
  roomNumber: string;
  type: RoomType;
  price: number;
  isAvailable: boolean;
  description: string;
  imageUrl: string;
  capacity?:number
  status: RoomStatus;
  originalPrice?: number
  features?: string[]
  discount?: number
  hotelName?:string
}
