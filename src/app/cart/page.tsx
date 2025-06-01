"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  const subtotal = getCartTotal()
  const shipping = subtotal > 0 ? 10 : 0
  const discount = promoApplied ? subtotal * 0.1 : 0
  const total = subtotal + shipping - discount

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "discount10") {
      setPromoApplied(true)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold mt-6">Your cart is empty</h1>
          <p className="text-gray-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products">
            <Button className="mt-6">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border rounded-lg overflow-hidden">
            <div className="hidden md:grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <div className="col-span-2 font-medium">Product</div>
              <div className="font-medium text-center">Price</div>
              <div className="font-medium text-center">Quantity</div>
              <div className="font-medium text-right">Total</div>
            </div>

            {cartItems.map((item) => {
              if (!item || !item.product) {
                return null;
              }
              
              return (
                <div key={item.id} className="border-t first:border-t-0">
                  <div className="grid md:grid-cols-5 gap-4 p-4 items-center">
                    <div className="md:col-span-2 flex items-center gap-4">
                      <Link href={`/products/${item.product.id}`}>
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </Link>
                      <div>
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-medium hover:underline">{item.product.name}</h3>
                        </Link>
                        <button
                          className="text-sm text-red-500 flex items-center mt-1"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="md:hidden text-sm text-gray-500">Price:</div>${item.product.price.toFixed(2)}
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="md:hidden text-sm text-gray-500 mr-2">Quantity:</div>
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="md:hidden text-sm text-gray-500">Total:</div>
                      <span className="font-medium">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-6">
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        <div>
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>

              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <Button variant="outline" onClick={handleApplyPromo} disabled={promoApplied || !promoCode}>
                  Apply
                </Button>
              </div>

              {promoApplied && <div className="text-sm text-green-600">Promo code applied successfully!</div>}

              <Link href="/checkout">
                <Button className="w-full">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

