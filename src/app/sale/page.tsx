"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"
import { products } from "@/lib/data"

export default function SalePage() {
  const { addToCart } = useCart()

  // Filter products that are on sale
  const saleProducts = products.filter((product) => product.onSale)

  // State for sorting
  const [sortOption, setSortOption] = useState<string>("discount")

  // Sort products based on selected option
  const sortedProducts = [...saleProducts].sort((a, b) => {
    const priceA = Number(a.price)
    const priceB = Number(b.price)
    const originalPriceA = Number(a.originalPrice)
    const originalPriceB = Number(b.originalPrice)
    switch (sortOption) {
      case "discount":
        const discountA = a.originalPrice ? (originalPriceA - priceA) / originalPriceA : 0
        const discountB = b.originalPrice ? (originalPriceB - priceB) / originalPriceB : 0
        return discountB - discountA
      case "price-low-high":
        return priceA - priceB
      case "price-high-low":
        return priceB - priceA
      default:
        return 0
    }
  })

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="bg-red-500 text-white rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">Sale</h1>
        <p className="text-lg">Discover amazing deals with up to 50% off on selected items.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-lg">{saleProducts.length} products on sale</p>

        <div className="flex items-center bg-white px-3 py-2 rounded-md shadow">
          <label htmlFor="sort-by" className="mr-2 text-black">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 border rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="discount">Biggest Discount</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/products/${product.id}`}>
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {product.originalPrice && product.price ?
                    `${Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}% OFF`
                    : null}
                </div>
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-lg line-clamp-1 hover:underline">{product.name}</h3>
              </Link>
              <div className="flex items-center mt-1">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                <span className="text-sm text-gray-500 ml-1">({product.rating.toFixed(1)})</span>
              </div>
              <div className="flex items-center mt-2">
                <p className="font-bold text-lg text-red-500">${Number(product.price).toFixed(2)}</p>
                <p className="text-sm text-gray-500 line-through ml-2">{product.originalPrice ? `$${Number(product.originalPrice).toFixed(2)}` : null}</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" onClick={() => addToCart(product, 1)}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
