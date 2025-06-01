import { API_BASE_URL } from '../config';
import type { Product } from '../types';

export async function getProducts(params?: {
  category?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.minRating) searchParams.set('minRating', params.minRating.toString());
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.page !== undefined) searchParams.set('page', params.page.toString());
  if (params?.size !== undefined) searchParams.set('size', params.size.toString());

  try {
    console.log('Fetching products with URL:', `${API_BASE_URL}/products?${searchParams}`);
    const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Response error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const pageData = await response.json();
    console.log('Raw response data:', pageData);
    
    if (!pageData || !Array.isArray(pageData.content)) {
      console.error('Invalid response format:', pageData);
      throw new Error('Invalid response format from server');
    }

    return {
      products: pageData.content || [],
      total: pageData.totalElements,
      totalPages: pageData.totalPages,
      currentPage: pageData.number
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getAllProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch all products');
  
  // The backend returns a Page<Product> object with pagination info
  const pageData = await response.json();
  return {
    products: pageData.content || [],
    total: pageData.totalElements,
    totalPages: pageData.totalPages,
    currentPage: pageData.number
  };
}

export async function getProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json() as Promise<Product>;
}

export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/products/allcategories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json() as Promise<string[]>;
}

export async function getFeaturedProducts() {
  const response = await fetch(`${API_BASE_URL}/products/featured`);
  if (!response.ok) throw new Error('Failed to fetch featured products');
  return response.json() as Promise<Product[]>;
}

export async function getRelatedProducts(productId: string) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/related`);
  if (!response.ok) throw new Error('Failed to fetch related products');
  return response.json() as Promise<Product[]>;
}
