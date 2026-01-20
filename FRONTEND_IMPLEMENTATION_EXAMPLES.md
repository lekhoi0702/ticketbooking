# 🎨 FRONTEND REFACTORING IMPLEMENTATION GUIDE

## 📂 NEW FILE STRUCTURE

```
src/
├── api/                    # ❌ NEW - Centralized API layer
│   ├── client.js          # ApiClient with interceptors
│   ├── config.js          # API configuration
│   └── modules/
│       ├── auth.js
│       ├── events.js
│       ├── orders.js
│       └── payments.js
│
├── utils/
│   ├── storage.js         # ❌ NEW - Storage abstraction
│   ├── validators.js      # ❌ NEW - Validation utilities
│   └── errorHandler.js    # ❌ NEW - Error handling utilities
│
└── components/
    └── common/
        └── ErrorBoundary.jsx  # ❌ NEW
```

---

## 1️⃣ API CLIENT WITH INTERCEPTORS

### File: `src/api/config.js`
```javascript
/**
 * API Configuration
 */

export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
};

export const ENDPOINTS = {
    // Auth
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_CHANGE_PASSWORD: '/auth/change-password',
    
    // Events
    EVENTS: '/events',
    EVENT_DETAIL: (id) => `/events/${id}`,
    EVENT_SEARCH: '/events/search',
    EVENT_FEATURED: '/events/featured',
    
    // Orders
    ORDERS_CREATE: '/orders/create',
    ORDERS_USER: (userId) => `/orders/user/${userId}`,
    ORDER_DETAIL: (orderId) => `/orders/${orderId}`,
    ORDER_CANCEL: (orderId) => `/orders/${orderId}/cancel`,
    
    // Payments
    PAYMENT_CREATE: '/payments/create',
    PAYMENT_VNPAY_URL: '/payments/vnpay/create-url',
    PAYMENT_VNPAY_RETURN: '/payments/vnpay/return',
};
```

### File: `src/api/client.js`
```javascript
/**
 * API Client with Interceptors
 * Provides centralized HTTP request handling with:
 * - Automatic token injection
 * - Response/Error interceptors
 * - Request/Response logging
 * - Retry logic
 */

import { API_CONFIG } from './config';
import { storage } from '@/utils/storage';

class ApiClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || API_CONFIG.baseURL;
        this.timeout = config.timeout || API_CONFIG.timeout;
        this.defaultHeaders = config.headers || API_CONFIG.headers;
        
        // Interceptor queues
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.errorInterceptors = [];
    }
    
    /**
     * Add request interceptor
     * @param {Function} fn - Interceptor function (config) => config
     */
    addRequestInterceptor(fn) {
        this.requestInterceptors.push(fn);
        return this;
    }
    
    /**
     * Add response interceptor
     * @param {Function} fn - Interceptor function (response) => response
     */
    addResponseInterceptor(fn) {
        this.responseInterceptors.push(fn);
        return this;
    }
    
    /**
     * Add error interceptor
     * @param {Function} fn - Interceptor function (error) => error | Promise.reject(error)
     */
    addErrorInterceptor(fn) {
        this.errorInterceptors.push(fn);
        return this;
    }
    
    /**
     * Main request method
     */
    async request(endpoint, options = {}) {
        try {
            // Build URL
            const url = endpoint.startsWith('http') 
                ? endpoint 
                : `${this.baseURL}${endpoint}`;
            
            // Build config
            let config = {
                ...options,
                headers: {
                    ...this.defaultHeaders,
                    ...options.headers,
                },
            };
            
            // Apply request interceptors
            for (const interceptor of this.requestInterceptors) {
                config = await interceptor(config);
            }
            
            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            config.signal = controller.signal;
            
            // Make request
            let response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            // Apply response interceptors
            for (const interceptor of this.responseInterceptors) {
                response = await interceptor(response.clone());
            }
            
            return response;
            
        } catch (error) {
            // Apply error interceptors
            for (const interceptor of this.errorInterceptors) {
                error = await interceptor(error);
            }
            throw error;
        }
    }
    
    /**
     * Convenience methods
     */
    async get(endpoint, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET',
            ...options,
        });
    }
    
    async post(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        });
    }
    
    async put(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    }
    
    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options,
        });
    }
    
    async upload(endpoint, formData, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type, let browser set it with boundary
                ...options.headers,
            },
            ...options,
        });
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

// ============================================
// SETUP INTERCEPTORS
// ============================================

/**
 * Request Interceptor: Inject Auth Token
 */
apiClient.addRequestInterceptor((config) => {
    const token = storage.get('token');
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
        console.log('🚀 API Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
        });
    }
    
    return config;
});

/**
 * Response Interceptor: Parse JSON and Handle Errors
 */
apiClient.addResponseInterceptor(async (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
        console.log('✅ API Response:', {
            url: response.url,
            status: response.status,
        });
    }
    
    // Parse JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }
    
    // Check if response is OK
    if (!response.ok) {
        const error = new Error(data.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.response = data;
        throw error;
    }
    
    return data;
});

/**
 * Error Interceptor: Handle Network Errors and Auth
 */
apiClient.addErrorInterceptor(async (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
        console.error('❌ API Error:', error);
    }
    
    // Handle timeout
    if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
    }
    
    // Handle network errors
    if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.');
    }
    
    // Handle auth errors
    if (error.status === 401) {
        // Clear auth data
        storage.remove('token');
        storage.remove('user');
        
        // Redirect to login
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
            window.location.href = '/login';
        }
        
        throw new Error('Session expired. Please login again.');
    }
    
    // Handle forbidden
    if (error.status === 403) {
        throw new Error('You do not have permission to perform this action.');
    }
    
    // Handle server errors
    if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
    }
    
    // Re-throw original error
    throw error;
});

export default apiClient;
```

---

## 2️⃣ REFACTORED API MODULES

### File: `src/api/modules/auth.js`
```javascript
/**
 * Auth API Module
 */
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const authApi = {
    /**
     * Login user
     * @param {Object} credentials - { email, password, required_role }
     * @returns {Promise<Object>} { success, token, user }
     */
    async login(credentials) {
        return apiClient.post(ENDPOINTS.AUTH_LOGIN, credentials);
    },
    
    /**
     * Register new user
     * @param {Object} userData - { email, password, full_name, phone }
     * @returns {Promise<Object>} { success, message }
     */
    async register(userData) {
        return apiClient.post(ENDPOINTS.AUTH_REGISTER, userData);
    },
    
    /**
     * Change password
     * @param {Object} data - { user_id, old_password, new_password }
     * @returns {Promise<Object>} { success, message }
     */
    async changePassword(data) {
        return apiClient.post(ENDPOINTS.AUTH_CHANGE_PASSWORD, data);
    },
};
```

### File: `src/api/modules/events.js`
```javascript
/**
 * Events API Module
 */
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const eventsApi = {
    /**
     * Get events list with filters
     * @param {Object} filters - { category_id, status, is_featured, sort, limit, offset }
     * @returns {Promise<Object>} { success, data, total }
     */
    async getEvents(filters = {}) {
        return apiClient.get(ENDPOINTS.EVENTS, filters);
    },
    
    /**
     * Get event details
     * @param {number} eventId
     * @returns {Promise<Object>} { success, data }
     */
    async getEventDetail(eventId) {
        return apiClient.get(ENDPOINTS.EVENT_DETAIL(eventId));
    },
    
    /**
     * Search events
     * @param {string} query - Search term
     * @param {number} limit - Max results
     * @returns {Promise<Object>} { success, data }
     */
    async searchEvents(query, limit = 20) {
        return apiClient.get(ENDPOINTS.EVENT_SEARCH, { q: query, limit });
    },
    
    /**
     * Get featured events
     * @param {number} limit
     * @returns {Promise<Object>} { success, data }
     */
    async getFeaturedEvents(limit = 10) {
        return apiClient.get(ENDPOINTS.EVENT_FEATURED, { limit });
    },
    
    /**
     * Toggle favorite event
     * @param {number} userId
     * @param {number} eventId
     * @returns {Promise<Object>} { success, is_favorite, message }
     */
    async toggleFavorite(userId, eventId) {
        return apiClient.post('/events/favorites/toggle', {
            user_id: userId,
            event_id: eventId,
        });
    },
};
```

### File: `src/api/modules/orders.js`
```javascript
/**
 * Orders API Module
 */
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const ordersApi = {
    /**
     * Create new order
     * @param {Object} orderData - Order details
     * @returns {Promise<Object>} { success, data }
     */
    async createOrder(orderData) {
        return apiClient.post(ENDPOINTS.ORDERS_CREATE, orderData);
    },
    
    /**
     * Get user orders
     * @param {number} userId
     * @returns {Promise<Object>} { success, data }
     */
    async getUserOrders(userId) {
        return apiClient.get(ENDPOINTS.ORDERS_USER(userId));
    },
    
    /**
     * Get order details
     * @param {number} orderId
     * @returns {Promise<Object>} { success, data }
     */
    async getOrderDetail(orderId) {
        return apiClient.get(ENDPOINTS.ORDER_DETAIL(orderId));
    },
    
    /**
     * Cancel order
     * @param {number} orderId
     * @returns {Promise<Object>} { success, cancelled_immediately, message }
     */
    async cancelOrder(orderId) {
        return apiClient.post(ENDPOINTS.ORDER_CANCEL(orderId));
    },
    
    /**
     * Validate discount code
     * @param {string} code
     * @param {Array} items
     * @returns {Promise<Object>} { success, discount_amount, message }
     */
    async validateDiscount(code, items) {
        return apiClient.post('/orders/validate-discount', { code, items });
    },
};
```

---

## 3️⃣ STORAGE UTILITY

### File: `src/utils/storage.js`
```javascript
/**
 * Storage utility with type safety and error handling
 */

class StorageService {
    constructor(storage = localStorage) {
        this.storage = storage;
    }
    
    /**
     * Get item from storage
     * @param {string} key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*}
     */
    get(key, defaultValue = null) {
        try {
            const item = this.storage.getItem(key);
            
            if (item === null) {
                return defaultValue;
            }
            
            // Try to parse JSON
            try {
                return JSON.parse(item);
            } catch {
                // Return as string if not JSON
                return item;
            }
        } catch (error) {
            console.error(`Error getting ${key} from storage:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Set item in storage
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        try {
            const item = typeof value === 'string' 
                ? value 
                : JSON.stringify(value);
            
            this.storage.setItem(key, item);
        } catch (error) {
            console.error(`Error setting ${key} in storage:`, error);
        }
    }
    
    /**
     * Remove item from storage
     * @param {string} key
     */
    remove(key) {
        try {
            this.storage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key} from storage:`, error);
        }
    }
    
    /**
     * Clear all storage
     */
    clear() {
        try {
            this.storage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
    
    /**
     * Check if key exists
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this.storage.getItem(key) !== null;
    }
    
    /**
     * Get all keys
     * @returns {string[]}
     */
    keys() {
        return Object.keys(this.storage);
    }
}

// Create singleton instances
export const storage = new StorageService(localStorage);
export const sessionStorage = new StorageService(window.sessionStorage);

// Convenience methods for common operations
export const authStorage = {
    getToken() {
        return storage.get('token');
    },
    
    setToken(token) {
        storage.set('token', token);
    },
    
    getUser() {
        return storage.get('user');
    },
    
    setUser(user) {
        storage.set('user', user);
    },
    
    clearAuth() {
        storage.remove('token');
        storage.remove('user');
    },
    
    isAuthenticated() {
        return storage.has('token');
    },
};

export default storage;
```

---

## 4️⃣ ERROR BOUNDARY

### File: `src/components/common/ErrorBoundary.jsx`
```javascript
/**
 * Error Boundary Component
 * Catches JavaScript errors in child components
 */
import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }
    
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    
    componentDidCatch(error, errorInfo) {
        // Log error to error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
        
        this.setState({
            errorInfo,
        });
        
        // Log to external service (e.g., Sentry)
        if (import.meta.env.PROD) {
            // logErrorToService(error, errorInfo);
        }
    }
    
    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        
        // Reload page or navigate to home
        window.location.reload();
    };
    
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                }}>
                    <Result
                        status="error"
                        title="Oops! Something went wrong"
                        subTitle="We're sorry for the inconvenience. Please try refreshing the page."
                        extra={[
                            <Button 
                                type="primary" 
                                key="reload"
                                onClick={this.handleReset}
                            >
                                Reload Page
                            </Button>,
                            <Button 
                                key="home"
                                onClick={() => window.location.href = '/'}
                            >
                                Go Home
                            </Button>,
                        ]}
                    >
                        {import.meta.env.DEV && (
                            <div style={{
                                textAlign: 'left',
                                marginTop: '20px',
                                padding: '16px',
                                background: '#f5f5f5',
                                borderRadius: '4px',
                            }}>
                                <details>
                                    <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                                        Error Details (Dev Only)
                                    </summary>
                                    <pre style={{
                                        fontSize: '12px',
                                        overflow: 'auto',
                                        maxHeight: '300px',
                                    }}>
                                        {this.state.error && this.state.error.toString()}
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </Result>
                </div>
            );
        }
        
        return this.props.children;
    }
}

export default ErrorBoundary;
```

### Usage in `App.jsx`:
```javascript
import ErrorBoundary from '@/components/common/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <ConfigProvider theme={AntdThemeConfig}>
                <AuthProvider>
                    <Router>
                        {/* Your routes */}
                    </Router>
                </AuthProvider>
            </ConfigProvider>
        </ErrorBoundary>
    );
}
```

---

## 5️⃣ CUSTOM HOOKS

### File: `src/hooks/useApi.js`
```javascript
/**
 * Generic API hook with loading, error states
 */
import { useState, useCallback } from 'react';

export const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await apiFunction(...args);
            
            setData(response.data || response);
            return response;
            
        } catch (err) {
            setError(err.message || 'An error occurred');
            throw err;
            
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);
    
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);
    
    return { data, loading, error, execute, reset };
};

// Usage example:
// const { data, loading, error, execute } = useApi(eventsApi.getEvents);
// 
// useEffect(() => {
//     execute({ category_id: 1, limit: 10 });
// }, []);
```

### File: `src/hooks/useDebounce.js`
```javascript
/**
 * Debounce hook for search inputs
 */
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

// Usage example:
// const [searchTerm, setSearchTerm] = useState('');
// const debouncedSearch = useDebounce(searchTerm, 500);
// 
// useEffect(() => {
//     if (debouncedSearch) {
//         searchEvents(debouncedSearch);
//     }
// }, [debouncedSearch]);
```

---

## 6️⃣ REFACTORED CONTEXT

### File: `src/context/AuthContext.jsx` (REFACTORED)
```javascript
/**
 * Authentication Context with API integration
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/modules/auth';
import { authStorage } from '@/utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    
    // Initialize auth state from storage
    useEffect(() => {
        const savedToken = authStorage.getToken();
        const savedUser = authStorage.getUser();
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
        }
        
        setLoading(false);
    }, []);
    
    /**
     * Login user
     */
    const login = useCallback(async (credentials) => {
        try {
            const response = await authApi.login(credentials);
            
            if (response.success) {
                const { token, user } = response;
                
                setUser(user);
                setToken(token);
                
                authStorage.setToken(token);
                authStorage.setUser(user);
                setShowLoginModal(false);
                
                return { success: true };
            }
            
            return { success: false, message: response.message };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }, []);
    
    /**
     * Logout user
     */
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        authStorage.clearAuth();
    }, []);
    
    /**
     * Register user
     */
    const register = useCallback(async (userData) => {
        try {
            const response = await authApi.register(userData);
            return { success: response.success, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }, []);
    
    /**
     * Trigger login modal
     */
    const triggerLogin = useCallback(() => {
        setShowLoginModal(true);
    }, []);
    
    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        showLoginModal,
        setShowLoginModal,
        login,
        logout,
        register,
        triggerLogin,
    };
    
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    
    return context;
};
```

---

## 7️⃣ PERFORMANCE OPTIMIZATION

### File: `src/components/common/LazyLoad.jsx`
```javascript
/**
 * Lazy load wrapper for components
 */
import React, { Suspense } from 'react';
import { Spin } from 'antd';

const LazyLoad = ({ children, fallback = <Spin size="large" /> }) => {
    return (
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    );
};

export default LazyLoad;

// Usage:
// const EventDetail = lazy(() => import('@/features/user/pages/EventDetail'));
// 
// <LazyLoad>
//     <EventDetail />
// </LazyLoad>
```

### Memoized EventCard:
```javascript
/**
 * Optimized EventCard with React.memo
 */
import React, { useMemo } from 'react';

const EventCard = React.memo(({ event }) => {
    // Memoize expensive computations
    const formattedPrice = useMemo(() => {
        return formatCurrency(event.price);
    }, [event.price]);
    
    const formattedDate = useMemo(() => {
        return formatDate(event.start_datetime);
    }, [event.start_datetime]);
    
    return (
        <Card>
            {/* Card content */}
        </Card>
    );
}, (prevProps, nextProps) => {
    // Custom comparison
    return (
        prevProps.event.id === nextProps.event.id &&
        prevProps.event.updated_at === nextProps.event.updated_at
    );
});

export default EventCard;
```

---

## ✅ MIGRATION CHECKLIST

### Step 1: Setup API Layer
- [ ] Create `src/api/` directory structure
- [ ] Implement ApiClient with interceptors
- [ ] Create API modules (auth, events, orders)
- [ ] Update imports in existing components

### Step 2: Storage Abstraction
- [ ] Create storage utility
- [ ] Replace all `localStorage` direct access
- [ ] Update AuthContext to use storage utility

### Step 3: Error Handling
- [ ] Create ErrorBoundary component
- [ ] Wrap App with ErrorBoundary
- [ ] Add try-catch in async operations

### Step 4: Performance
- [ ] Add React.memo to expensive components
- [ ] Implement lazy loading for routes
- [ ] Add useMemo/useCallback where needed

### Step 5: Testing
- [ ] Test all API calls work with new client
- [ ] Test auth flow (login/logout)
- [ ] Test error scenarios
- [ ] Test in production build

---

## 🧪 TESTING

### Test API Client:
```javascript
// src/api/__tests__/client.test.js
import { apiClient } from '../client';

describe('ApiClient', () => {
    it('should add authorization header', async () => {
        localStorage.setItem('token', 'test-token');
        
        const mockFetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            })
        );
        
        global.fetch = mockFetch;
        
        await apiClient.get('/test');
        
        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-token',
                }),
            })
        );
    });
});
```

---

**Next Steps**: 
1. Implement ApiClient
2. Migrate one API module at a time
3. Test thoroughly before proceeding
4. Document any issues encountered
