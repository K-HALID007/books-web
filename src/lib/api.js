const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API utility functions
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = sessionStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('API Error - Non-JSON response:', text);
      throw new Error(`Server error: Expected JSON but received ${contentType || 'unknown content type'}. Make sure the backend server is running on ${API_BASE_URL}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    // If it's a network error (server not running)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please make sure the backend server is running.`);
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Books API functions
export const booksAPI = {
  getAllBooks: async () => {
    return apiRequest('/books');
  },

  getBooks: async () => {
    return apiRequest('/books');
  },

  getUserBooks: async () => {
    return apiRequest('/books/my-books');
  },

  createBook: async (bookData) => {
    return apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  updateBook: async (bookId, bookData) => {
    return apiRequest(`/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  },

  deleteBook: async (bookId) => {
    return apiRequest(`/books/${bookId}`, {
      method: 'DELETE',
    });
  },
};

// PDF Books API functions
export const pdfBooksAPI = {
  getAllPDFBooks: async () => {
    return apiRequest('/pdf-books');
  },

  uploadPDFBook: async (formData) => {
    const token = sessionStorage.getItem('token');
    const url = `${API_BASE_URL}/pdf-books/upload`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  downloadPDFBook: async (bookId) => {
    const token = sessionStorage.getItem('token');
    const url = `${API_BASE_URL}/pdf-books/${bookId}/download`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  incrementDownload: async (bookId) => {
    return apiRequest(`/pdf-books/${bookId}/download-count`, {
      method: 'POST',
    });
  },

  getUserPDFBooks: async () => {
    return apiRequest('/pdf-books/my-books');
  },

  deletePDFBook: async (bookId) => {
    return apiRequest(`/pdf-books/${bookId}`, {
      method: 'DELETE',
    });
  },

  downloadLibraryPoster: async () => {
    const token = sessionStorage.getItem('token');
    const url = `${API_BASE_URL}/pdf-books/library-poster`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate library poster');
    }

    return response.blob();
  },
};

export default apiRequest;