import React from 'react';
    import { BrowserRouter as Router } from 'react-router-dom';
    import AppRoutes from '@/AppRoutes';
    import AppLayout from '@/components/layout/AppLayout';
    import { Toaster } from '@/components/ui/toaster';
    import { TooltipProvider } from '@/components/ui/tooltip';
    import { AuthProvider } from '@/contexts/AuthContext';

    const AppProviders = ({ children }) => (
      <React.StrictMode>
        <Router>
          <AuthProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthProvider>
        </Router>
      </React.StrictMode>
    );

    const App = () => (
      <AppProviders>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
        <Toaster />
      </AppProviders>
    );

    export default App;