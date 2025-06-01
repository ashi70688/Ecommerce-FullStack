import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SiteFooter() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-white">STORE</h3>
            <p className="text-sm text-white dark:text-white">
              Your one-stop shop for all your needs. Quality products, competitive prices, and exceptional service.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover-effect">
                <Facebook className="h-5 w-5 text-white dark:text-white" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="hover-effect">
                <Twitter className="h-5 w-5 text-white dark:text-white" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="hover-effect">
                <Instagram className="h-5 w-5 text-white dark:text-white" />
                <span className="sr-only">Instagram</span>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-white">Shop</h3>
            <ul className="space-y-2 text-sm text-white dark:text-white">
              <li>
                <Link href="/products" className="hover:text-primary hover-effect inline-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary hover-effect inline-block">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/sale" className="hover:text-primary hover-effect inline-block">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="hover:text-primary hover-effect inline-block">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-white">Customer Service</h3>
            <ul className="space-y-2 text-sm text-white dark:text-white">
              <li>
                <Link href="/contact" className="hover:text-primary hover-effect inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary hover-effect inline-block">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary hover-effect inline-block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary hover-effect inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary hover-effect inline-block">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-white">Newsletter</h3>
            <p className="text-sm text-white dark:text-white">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Your email" className="w-full max-w-xs" />
              <Button className="hover-effect whitespace-nowrap">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-white dark:text-white">
          <p>© {new Date().getFullYear()} STORE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

