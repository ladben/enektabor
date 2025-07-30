import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import './index.css';
import 'swiper/css';

import App from './App.jsx'

import { ItemProvider } from './context/ItemContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { ProfileDisplayProvider } from './context/ProfileDisplayContext.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,
      cacheTime: 1000 * 60 * 60,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const localStoragePersister = {
  persistClient: (client) => {
    localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
  },
  restoreClient: () => {
    const cache = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
    return cache ? JSON.parse(cache) : undefined;
  },
  removeClient: () => {
    localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
  },
};

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ItemProvider>
        <ThemeProvider>
          <UserProvider>
            <ProfileDisplayProvider>
              <App />
            </ProfileDisplayProvider>
          </UserProvider>
        </ThemeProvider>
      </ItemProvider>
    </QueryClientProvider>
  </StrictMode>,
)
