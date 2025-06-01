import { API_BASE_URL } from '../config';
import type { Product } from '../types';

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
};

export async function getCart() {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to fetch cart');
  return response.json() as Promise<CartItem[]>;
}

export async function addToCart(productId: string, quantity: number) {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to add item to cart');
  return response.json() as Promise<CartItem[]>;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to update cart item');
  return response.json() as Promise<CartItem[]>;
}

export async function removeFromCart(itemId: string) {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to remove item from cart');
  return response.json() as Promise<CartItem[]>;
}

export async function clearCart() {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to clear cart');
  return response.json() as Promise<CartItem[]>;
}
