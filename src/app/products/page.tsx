"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Filter, ShoppingBag, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/components/cart-provider"
import * as productsApi from "@/lib/api/products"
import type { Product } from "@/lib/types"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { addToCart, cartItems, isLoading: isCartLoading } = useCart()

  // Get initial category from URL if present
  const initialCategory = searchParams.get("category") || ""

  // State for all products
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [minRating, setMinRating] = useState<number>(0)
  const [sortOption, setSortOption] = useState<string>("price-low-high")
  const [isLoading, setIsLoading] = useState(true)

  // Compute unique categories from all products
  const categories = Array.from(new Set(allProducts.map((p) => p.category)))

  // Fetch all products once on mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true)
      try {
        // Use getProducts with no filters if getAllProducts does not exist
        const { products } = await productsApi.getProducts({})
        setAllProducts(products || [])
      } catch (error) {
        setAllProducts([])
        console.error('Failed to load products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllProducts()
  }, [])

  // --- Frontend filtering and sorting ---
  const filteredProducts = allProducts
    .filter((product) =>
      (!selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase()) &&
      product.rating >= minRating
    )
    .sort((a, b) => {
      if (sortOption === "price-low-high") return Number(a.price) - Number(b.price)
      if (sortOption === "price-high-low") return Number(b.price) - Number(a.price)
      if (sortOption === "rating") return Number(b.rating) - Number(a.rating)
      return 0
    })

  // Check if product is in cart
  const isInCart = (productId: string) => {
    return cartItems.some(item => item.productId === productId)
  }

  // Get cart item quantity
  const getCartItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden w-full">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="font-medium mb-4">Category</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="all-categories-mobile"
                          checked={selectedCategory === ""}
                          onCheckedChange={() => setSelectedCategory("")}
                        />
                        <Label htmlFor="all-categories-mobile">All Categories</Label>
                      </div>
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}-mobile`}
                            checked={selectedCategory === category}
                            onCheckedChange={() => setSelectedCategory(category)}
                          />
                          <Label htmlFor={`category-${category}-mobile`} className="capitalize">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Rating Filter */}
                  <div>
                    <h3 className="font-medium mb-4">Rating</h3>
                    <RadioGroup value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="rating-any-mobile" />
                        <Label htmlFor="rating-any-mobile">Any Rating</Label>
                      </div>
                      {[4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <RadioGroupItem value={rating.toString()} id={`rating-${rating}-mobile`} />
                          <Label htmlFor={`rating-${rating}-mobile`} className="flex items-center">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                />
                              ))}
                            <span className="ml-2">& Up</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 space-y-6">
          <div>
            <h3 className="font-medium mb-4">Category</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-categories"
                  checked={selectedCategory === ""}
                  onCheckedChange={() => setSelectedCategory("")}
                />
                <Label htmlFor="all-categories">All Categories</Label>
              </div>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategory === category}
                    onCheckedChange={() => setSelectedCategory(category)}
                  />
                  <Label htmlFor={`category-${category}`} className="capitalize">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-4">Rating</h3>
            <RadioGroup value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="rating-any" />
                <Label htmlFor="rating-any">Any Rating</Label>
              </div>
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="flex items-center">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    <span className="ml-2">& Up</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 sm:mb-0">
              {selectedCategory
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
                : "All Products"}
              <span className="text-gray-500 text-lg font-normal ml-2">({filteredProducts.length} products)</span>
            </h1>

            <div className="flex items-center">
              <Label htmlFor="sort-by" className="mr-2 text-black">
                Sort by:
              </Label>
              <select
                id="sort-by"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="p-2 border rounded-md bg-transparent text-black"
              >
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {isLoading || isCartLoading ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium">Loading products...</h2>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium">No products found</h2>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <Link href={`/products/${product.id}`}>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
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
                    <p className="font-bold text-lg mt-2">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {isInCart(product.id) ? (
                      <Button variant="outline" className="w-full bg-green-50 text-green-600 border-green-200">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        In Cart ({getCartItemQuantity(product.id)})
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => addToCart(product, 1)}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
