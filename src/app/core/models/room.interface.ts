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

