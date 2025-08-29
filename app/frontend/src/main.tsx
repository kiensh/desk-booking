import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './contexts/UserContext';
import { DesksProvider } from './contexts/DesksContext';
import { ToastProvider } from './contexts/ToastContext';
import App from './App';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <DesksProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DesksProvider>
    </UserProvider>
  </QueryClientProvider>,
);
