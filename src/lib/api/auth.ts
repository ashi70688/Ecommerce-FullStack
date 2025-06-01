import { API_BASE_URL } from '../config';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = LoginCredentials & {
  name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export async function login(credentials: LoginCredentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
    console.log("server didnt say ok");
  }
  return response.json() as Promise<{ user: User; token: string }>;
}

export async function register(data: RegisterData) {
  console.log('Registering with data:', data);
  try {
    // Make sure we're sending the correct data format to the backend
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    console.log('Registration response status:', response.status);
    
    // Parse the response data
    const responseData = await response.json();
    console.log('Registration response:', responseData);

    // Check if the response indicates an error
    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed');
    }

    // Extract the token and user from the response
    const { token, user } = responseData;
    
    // Return the user and token directly from the response
    // without making an additional request to getCurrentUser
    return { user, token };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logout() {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Logout failed');
  return response.json();
}

export async function getCurrentUser() {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error('Failed to get current user');
  }
  
  return response.json() as Promise<User>;
}
