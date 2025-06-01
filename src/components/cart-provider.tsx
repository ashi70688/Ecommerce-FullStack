"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import * as cartApi from "@/lib/api/cart"
import { useAuth } from "./auth-provider"

type CartContextType = {
  cartItems: cartApi.CartItem[]
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<cartApi.CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const { user } = useAuth()

  // Load cart from API when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const items = await cartApi.getCart()
          setCartItems(items)
          setIsOffline(false)
        } catch (error) {
          console.error("Failed to load cart:", error)
          // Switch to offline mode if API is unreachable
          setIsOffline(true)
          // Try to load from localStorage
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart))
            } catch (e) {
              console.error("Failed to parse saved cart:", e)
            }
          }
        }
      } else {
        setCartItems([])
      }
      setIsLoading(false)
    }

    loadCart()
  }, [user])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems])

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      if (!user) {
        alert("Please log in to add items to your cart")
        return
      }
      
      if (isOffline) {
        // Offline mode: update local state only
        const existingItem = cartItems.find(item => item.productId === product.id)
        
        if (existingItem) {
          // Update existing item
          const updatedItems = cartItems.map(item => 
            item.productId === product.id 
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          )
          setCartItems(updatedItems)
        } else {
          // Add new item with a temporary ID
          const newItem: cartApi.CartItem = {
            id: `local-${Date.now()}`,
            productId: product.id,
            quantity,
            product
          }
          setCartItems([...cartItems, newItem])
        }
        return
      }
      
      // Online mode: use the API
      const updatedCart = await cartApi.addToCart(product.id, quantity)
      setCartItems(updatedCart)
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      alert("Could not connect to the server. Working in offline mode.")
      setIsOffline(true)
      
      // Fall back to offline mode
      const existingItem = cartItems.find(item => item.productId === product.id)
      
      if (existingItem) {
        // Update existing item
        const updatedItems = cartItems.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        )
        setCartItems(updatedItems)
      } else {
        // Add new item with a temporary ID
        const newItem: cartApi.CartItem = {
          id: `local-${Date.now()}`,
          productId: product.id,
          quantity,
          product
        }
        setCartItems([...cartItems, newItem])
      }
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      if (!user) {
        alert("Please log in to manage your cart")
        return
      }
      
      if (isOffline) {
        // Offline mode: update local state only
        setCartItems(cartItems.filter(item => item.id !== itemId))
        return
      }
      
      // Online mode: use the API
      const updatedCart = await cartApi.removeFromCart(itemId)
      setCartItems(updatedCart)
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
      alert("Could not connect to the server. Working in offline mode.")
      setIsOffline(true)
      
      // Fall back to offline mode
      setCartItems(cartItems.filter(item => item.id !== itemId))
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    try {
      if (isOffline) {
        // Offline mode: update local state only
        const updatedItems = cartItems.map(item => 
          item.id === itemId
            ? { ...item, quantity: quantity }
            : item
        )
        setCartItems(updatedItems)
        return
      }
      
      // Online mode: use the API
      const updatedCart = await cartApi.updateCartItem(itemId, quantity)
      setCartItems(updatedCart)
    } catch (error) {
      console.error("Failed to update cart item:", error)
      alert("Could not connect to the server. Working in offline mode.")
      setIsOffline(true)
      
      // Fall back to offline mode
      const updatedItems = cartItems.map(item => 
        item.id === itemId
          ? { ...item, quantity: quantity }
          : item
      )
      setCartItems(updatedItems)
    }
  }

  const clearCart = async () => {
    try {
      if (isOffline) {
        // Offline mode: clear local state only
        setCartItems([])
        localStorage.removeItem('cart')
        return
      }
      
      // Online mode: use the API
      await cartApi.clearCart()
      setCartItems([])
    } catch (error) {
      console.error("Failed to clear cart:", error)
      alert("Could not connect to the server. Working in offline mode.")
      setIsOffline(true)
      
      // Fall back to offline mode
      setCartItems([])
      localStorage.removeItem('cart')
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Check if product exists before accessing its price
      if (!item || !item.product) {
        return total;
      }
      return total + (Number(item.product.price) * item.quantity)
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

