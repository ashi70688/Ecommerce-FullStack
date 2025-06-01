export type Product = {
  id: string
  name: string
  description: string
  price: number | string  // Handle both number and string representations of price
  category: string
  image: string
  rating: number
  onSale?: boolean,
  stock?: number,
  active?: boolean,
  originalPrice?: number | string  // Handle both number and string representations of price
}

export type User = {
  id: string
  name: string
  email: string
  password: string
  isAdmin: boolean
}

