import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HomePage from '@/pages/HomePage';
import ServicePage from '@/pages/ServicePage';
import StorePage from '@/pages/StorePage'; 
import MyAccountPage from '@/pages/MyAccountPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import EmployeeDashboardPage from '@/pages/EmployeeDashboardPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ManageUsersPage from '@/pages/admin/ManageUsersPage.jsx';
import ManageContentPage from '@/pages/admin/ManageContentPage.jsx'; 
import ManageServicesPage from '@/pages/admin/ManageServicesPage.jsx'; 
import DynamicContentPage from '@/pages/DynamicContentPage.jsx';
import SiteSettingsPage from '@/pages/admin/SiteSettingsPage.jsx';

const pageVariants = {
  initial: { opacity: 0, x: "-100vw" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "100vw" }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};
    
const AnimatedPageContent = ({ children }) => {
  const currentRouteLocation = useLocation();
  return (
    <motion.div
      key={currentRouteLocation.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPageContent><HomePage /></AnimatedPageContent>} />
        <Route path="/services/:serviceId" element={<AnimatedPageContent><ServicePage /></AnimatedPageContent>} />
        <Route path="/store" element={<AnimatedPageContent><StorePage /></AnimatedPageContent>} /> 
        <Route path="/login" element={<AnimatedPageContent><LoginPage /></AnimatedPageContent>} />
        <Route path="/signup" element={<AnimatedPageContent><SignupPage /></AnimatedPageContent>} />
        <Route path="/forgot-password" element={<AnimatedPageContent><ForgotPasswordPage /></AnimatedPageContent>} /> 
        <Route path="/update-password" element={<AnimatedPageContent><UpdatePasswordPage /></AnimatedPageContent>} />
        <Route path="/page/:slug" element={<AnimatedPageContent><DynamicContentPage /></AnimatedPageContent>} />
        
        <Route 
          path="/my-account" 
          element={
            <ProtectedRoute>
              <AnimatedPageContent><MyAccountPage /></AnimatedPageContent>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AnimatedPageContent><AdminDashboardPage /></AnimatedPageContent>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-users" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AnimatedPageContent><ManageUsersPage /></AnimatedPageContent>
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/admin/manage-content"
          element={
            <ProtectedRoute adminOnly={true}>
              <AnimatedPageContent><ManageContentPage /></AnimatedPageContent>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-services"
          element={
            <ProtectedRoute adminOnly={true}>
              <AnimatedPageContent><ManageServicesPage /></AnimatedPageContent>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/site-settings"
          element={
            <ProtectedRoute adminOnly={true}>
              <AnimatedPageContent><SiteSettingsPage /></AnimatedPageContent>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/employee-dashboard" 
          element={
            <ProtectedRoute employeeOnly={true}>
              <AnimatedPageContent><EmployeeDashboardPage /></AnimatedPageContent>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;