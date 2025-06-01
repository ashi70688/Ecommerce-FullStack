import { API_BASE_URL } from '../config';
import type { Product } from '../types';

export type WishlistItem = {
  id: string;
  productId: string;
  product: Product;
};

export async function getWishlist() {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to fetch wishlist');
  return response.json() as Promise<WishlistItem[]>;
}

export async function addToWishlist(productId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to add item to wishlist');
  return response.json() as Promise<WishlistItem[]>;
}

export async function removeFromWishlist(itemId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlist/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to remove item from wishlist');
  return response.json() as Promise<WishlistItem[]>;
}

export async function clearWishlist() {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to clear wishlist');
  return response.json() as Promise<WishlistItem[]>;
}
