"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import * as authApi from "@/lib/api/auth"

type AuthContextType = {
  user: authApi.User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<authApi.User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Initialize token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  // Check for current user session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authApi.getCurrentUser()
        if (user) {
          console.log('Current user found:', user)
          setUser(user)
        } else {
          console.log('No current user found')
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to get current user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, token } = await authApi.login({ email, password })
      setUser(user)
      setToken(token)
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token)
      
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Auth provider register called with:', { name, email, password });
      // Call the API register function with the user data
      const result = await authApi.register({ name, email, password });
      console.log('Register API result:', result);
      
      // For registration, we don't need to set the user state or token
      // since we're redirecting to the login page
      // This prevents the unnecessary call to /auth/me
      
      // Just return true to indicate successful registration
      if (result) {
        return true;
      } else {
        console.error('Registration returned invalid data:', result);
        return false;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Rethrow so the page component can handle specific errors
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
      setToken(null)
      
      // Remove token from localStorage
      localStorage.removeItem('auth_token')
      
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

