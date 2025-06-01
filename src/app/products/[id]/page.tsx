"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Heart, Minus, Plus, Share2, ShoppingBag, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import * as productsApi from "@/lib/api/products"
import type { Product } from "@/lib/types"

export default function ProductPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch product and related products
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [productData, relatedData] = await Promise.all([
          productsApi.getProduct(params.id as string),
          productsApi.getRelatedProducts(params.id as string)
        ])
        setProduct(productData)
        setRelatedProducts(relatedData)
      } catch (error) {
        console.error('Failed to load product:', error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container px-4 py-8 md:py-12">
        <div className="text-center">
          <h2 className="text-xl font-medium">Loading product...</h2>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href={`/products?category=${product.category}`} className="hover:text-primary capitalize">
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-700 dark:text-gray-300 truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden relative">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-[400px] object-cover"
            />
            {product.onSale && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                Sale
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`border rounded-lg overflow-hidden cursor-pointer ${activeImage === index ? "ring-2 ring-primary" : ""}`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              <span className="text-sm text-gray-500 ml-2">({product.rating.toFixed(1)})</span>
            </div>
          </div>

          <div className="flex items-center">
            {product.onSale ? (
              <>
                <div className="text-3xl font-bold text-red-500">${Number(product.price).toFixed(2)}</div>
                <div className="text-xl text-gray-500 line-through ml-2">${product.originalPrice ? Number(product.originalPrice).toFixed(2) : ''}</div>
                <div className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
                  {Math.round(((Number(product.originalPrice!) - Number(product.price)) / Number(product.originalPrice!)) * 100)}% OFF
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold">${Number(product.price).toFixed(2)}</div>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400">{product.description}</p>

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-4">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Link href="/checkout" className="flex-1">
                <Button size="lg" variant="secondary" className="w-full">
                  Buy Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant={isInWishlist(product.id) ? "default" : "outline"}
                className="sm:flex-none"
                onClick={handleWishlist}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                <span className="sr-only sm:not-sr-only sm:ml-2">
                  {isInWishlist(product.id) ? "In Wishlist" : "Add to Wishlist"}
                </span>
              </Button>
              <Button size="lg" variant="outline" className="sm:flex-none">
                <Share2 className="h-5 w-5" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Share</span>
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {product.description}
                  <br />
                  <br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl
                  nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl
                  nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                </p>
              </TabsContent>
              <TabsContent value="specifications" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Brand</div>
                    <div>Acme</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Material</div>
                    <div>Premium Quality</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Weight</div>
                    <div>0.5 kg</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Dimensions</div>
                    <div>10 x 20 x 5 cm</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Warranty</div>
                    <div>1 Year</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="pt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                    <Button>Write a Review</Button>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-b pb-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">John Doe</h4>
                            <div className="flex items-center mt-1">
                              {Array(5)
                                .fill(0)
                                .map((_, j) => (
                                  <Star
                                    key={j}
                                    className={`h-4 w-4 ${j < 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                  />
                                ))}
                              <span className="text-sm text-gray-500 ml-2">1 month ago</span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          Great product! Exactly as described and arrived quickly.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <Card key={relatedProduct.id} className="overflow-hidden">
              <Link href={`/products/${relatedProduct.id}`}>
                <div className="relative">
                  <img
                    src={relatedProduct.image || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {relatedProduct.onSale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Sale
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/products/${relatedProduct.id}`}>
                  <h3 className="font-semibold text-lg line-clamp-1 hover:underline">{relatedProduct.name}</h3>
                </Link>
                <div className="flex items-center mt-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(relatedProduct.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  <span className="text-sm text-gray-500 ml-1">({relatedProduct.rating.toFixed(1)})</span>
                </div>
                <div className="flex items-center mt-2">
                  {relatedProduct.onSale ? (
                    <>
                      <p className="font-bold text-lg text-red-500">${Number(relatedProduct.price).toFixed(2)}</p>
                      <p className="text-sm text-gray-500 line-through ml-2">
                        ${relatedProduct.originalPrice ? Number(relatedProduct.originalPrice).toFixed(2) : ''}
                      </p>
                    </>
                  ) : (
                    <p className="font-bold text-lg">${Number(relatedProduct.price).toFixed(2)}</p>
                  )}
                </div>
                <Button className="w-full mt-3" onClick={() => addToCart(relatedProduct, 1)}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
