"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import * as wishlistApi from "@/lib/api/wishlist"
import { useAuth } from "./auth-provider"

type WishlistContextType = {
  wishlistItems: wishlistApi.WishlistItem[]
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (itemId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  getWishlistItemId: (productId: string) => string | null
  clearWishlist: () => Promise<void>
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<wishlistApi.WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const { user } = useAuth()

  // Load wishlist from API when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const items = await wishlistApi.getWishlist()
          setWishlistItems(items)
          setIsOffline(false)
        } catch (error) {
          console.error("Failed to load wishlist:", error)
          // Switch to offline mode if API is unreachable
          setIsOffline(true)
          // Try to load from localStorage
          const savedWishlist = localStorage.getItem('wishlist')
          if (savedWishlist) {
            try {
              setWishlistItems(JSON.parse(savedWishlist))
            } catch (e) {
              console.error("Failed to parse saved wishlist:", e)
            }
          }
        }
      } else {
        setWishlistItems([])
      }
      setIsLoading(false)
    }

    loadWishlist()
  }, [user])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlistItems.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems))
    }
  }, [wishlistItems])

  const addToWishlist = async (product: Product) => {
    try {
      if (!user) {
        alert("Please log in to add items to your wishlist")
        return
      }
      
      if (isOffline) {
        // Check if product already exists in wishlist
        if (isInWishlist(product.id)) {
          return
        }
        
        // Offline mode: update local state only
        const newItem: wishlistApi.WishlistItem = {
          id: `local-${Date.now()}`,
          productId: product.id,
          product
        }
        setWishlistItems([...wishlistItems, newItem])
        return
      }
      
      // Online mode: use the API
      const updatedWishlist = await wishlistApi.addToWishlist(product.id)
      setWishlistItems(updatedWishlist)
    } catch (error) {
      console.error("Failed to add item to wishlist:", error)
      alert("Could not connect to the server. Working in offline mode.")
      setIsOffline(true)
      
      // Check if product already exists in wishlist
      if (isInWishlist(product.id)) {
        return
      }
      
      // Fall back to offline mode
      const newItem: wishlistApi.WishlistItem = {
        id: `local-${Date.now()}`,
        productId: product.id,
        product
      }
      setWishlistItems([...wishlistItems, newItem])
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    try {
      if (!user) {
        alert("Please log in to manage your wishlist")
        return
      }
      
      if (isOffline) {
        // Offline mode: update local state only
        setWishlistItems(wishlistItems.filter(item => item.id !== itemId))
        return
      }
      
      // Online mode: use the API
      const updatedWishlist = await wishlistApi.removeFromWishlist(itemId)
      setWishlistItems(updatedWishlist)
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error)
      alert("Could not connect to the server. Working in offline mode.")
      setIsOffline(true)
      
      // Fall back to offline mode
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId))
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.productId === productId)
  }

  const getWishlistItemId = (productId: string) => {
    const item = wishlistItems.find((item) => item.productId === productId)
    return item ? item.id : null
  }

  const clearWishlist = async () => {
    try {
      if (isOffline) {
        // Offline mode: clear local state only
        setWishlistItems([])
        localStorage.removeItem('wishlist')
        return
      }
      
      // Online mode: use the API
      await wishlistApi.clearWishlist()
      setWishlistItems([])
    } catch (error) {
      console.error("Failed to clear wishlist:", error)
      alert("Could not connect to the server. Working in offline mode.")
      setIsOffline(true)
      
      // Fall back to offline mode
      setWishlistItems([])
      localStorage.removeItem('wishlist')
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistItemId,
        clearWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}

