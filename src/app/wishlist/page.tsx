"use client"

import Link from "next/link"
import { Heart, ShoppingBag, Star, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useWishlist } from "@/components/wishlist-provider"
import { useCart } from "@/components/cart-provider"

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, getWishlistItemId } = useWishlist()
  const { addToCart } = useCart()

  // Add debug to see what's in the wishlist
  console.log("Wishlist items:", wishlistItems)

  if (wishlistItems.length === 0) {
    return (
      <div className="container px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold mt-6">Your wishlist is empty</h1>
          <p className="text-gray-500 mt-2">Save items you love to your wishlist and review them anytime.</p>
          <Link href="/products">
            <Button className="mt-6">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <Button variant="outline" onClick={clearWishlist}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          // Skip items without valid product data
          if (!item || !item.product) return null;
          
          const product = item.product;
          
          return (
            <Card key={item.id} className="overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {product.onSale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Sale
                    </div>
                  )}
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
                        className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  <span className="text-sm text-gray-500 ml-1">({(product.rating || 0).toFixed(1)})</span>
                </div>
                <div className="flex items-center mt-2">
                  {product.onSale ? (
                    <>
                      <p className="font-bold text-lg text-red-500">${(product.price || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-500 line-through ml-2">${(product.originalPrice || 0).toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="font-bold text-lg">${(product.price || 0).toFixed(2)}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button className="flex-1" onClick={() => addToCart(product, 1)}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon" onClick={() => removeFromWishlist(item.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  )
}

