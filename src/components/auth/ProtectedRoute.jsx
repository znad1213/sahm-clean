import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { Loader2 } from 'lucide-react';

    const ProtectedRoute = ({ children, adminOnly = false, employeeOnly = false }) => {
      const { isAuthenticated, isAdmin, isEmployee, loading } = useAuth();
      const location = useLocation();

      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
      }

      if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      if (adminOnly && !isAdmin) {
        return <Navigate to="/" state={{ from: location, error: "unauthorized" }} replace />;
      }

      if (employeeOnly && !isEmployee && !isAdmin) { // Admins can also access employee routes
        return <Navigate to="/" state={{ from: location, error: "unauthorized" }} replace />;
      }
      
      return children;
    };

    export default ProtectedRoute;