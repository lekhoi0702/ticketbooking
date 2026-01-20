# 📦 Install React Query

## Installation Command

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Setup in main.jsx

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Import ErrorBoundary
import ErrorBoundary from './components/ErrorBoundary';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* Show React Query DevTools in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

## Benefits

✅ Automatic caching  
✅ Background refetching  
✅ Loading/error states  
✅ Optimistic updates  
✅ DevTools for debugging  
✅ Reduced re-renders  

## Next Steps

After installation, use the query hooks in `src/hooks/queries/`
