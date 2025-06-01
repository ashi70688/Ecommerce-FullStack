"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import * as productsApi from "@/lib/api/products"
import type { Product } from "@/lib/types"
import { useEffect, useState } from "react"

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { products: fetchedProducts } = await productsApi.getProducts({})
        setProducts(fetchedProducts || [])
      } catch (err) {
        setError("Failed to load products.")
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Get unique categories
  const categories = [...new Set(products.map((product) => product.category))]

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">Loading categories...</h2>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-red-600">{error}</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            // Get count of products in this category
            const count = products.filter((p) => p.category === category).length

            // Get a sample product image from this category
            const sampleProduct = products.find((p) => p.category === category)

            return (
              <div
                key={category}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
                <img
                  src={sampleProduct?.image || `/placeholder.svg?height=400&width=600&text=${category}`}
                  alt={category}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                  <h3 className="font-bold text-2xl capitalize mb-2">{category}</h3>
                  <p className="mb-4">{count} Products</p>
                  <Link href={`/products?category=${category}`}>
                    <Button className="group/btn">
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
