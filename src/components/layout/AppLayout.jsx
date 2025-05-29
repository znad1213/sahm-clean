import React, { useState, useEffect } from 'react';
    import { useLocation } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import { Home, Briefcase, Sparkles, Zap, ShoppingBag, Star, UserCircle, LogIn, UserPlus, Shield, Users2 } from 'lucide-react';
    import ContactModal from '@/components/ContactModal';
    import Header from '@/components/layout/Header';
    import MobileMenu from '@/components/layout/MobileMenu';
    import Footer from '@/components/layout/Footer';
    import { supabase } from '@/lib/supabaseClient';

    const AppLayout = ({ children }) => {
      const currentRouteLocation = useLocation(); 
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const [isContactModalOpen, setIsContactModalOpen] = useState(false);
      const [contactModalService, setContactModalService] = useState("استفسار عام");
      const [currentUser, setCurrentUser] = useState(null);

       useEffect(() => {
        if (!supabase) {
          console.warn("Supabase client not initialized in AppLayout. User authentication features will be limited.");
          return;
        }
        const getSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          setCurrentUser(session?.user ?? null);
        }
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setCurrentUser(session?.user ?? null);
          }
        );
        return () => {
          authListener?.subscription.unsubscribe();
        };
      }, []);
      
      const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
      
      const openContactModal = (service = "استفسار عام") => {
        setContactModalService(service);
        setIsContactModalOpen(true);
        if(isMobileMenuOpen) setIsMobileMenuOpen(false);
      };
      
      const baseNavLinks = [
        { to: "/", text: "الرئيسية", icon: <Home className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> },
        { to: "/#services-detailed", text: "خدماتنا", icon: <Sparkles className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> },
        { to: "/#packages", text: "الباقات", icon: <Briefcase className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> },
        { to: "/store", text: "المتجر", icon: <ShoppingBag className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> },
        { to: "/#testimonials", text: "آراء العملاء", icon: <Star className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> },
        { to: "/#emergency", text: "الطوارئ", icon: <Zap className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> },
      ];

      const getNavLinks = () => {
        let dynamicLinks = [];
        if (currentUser) {
          dynamicLinks.push({ to: "/my-account", text: "حسابي", icon: <UserCircle className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> });
          // Placeholder for role-based links
          // const userRole = currentUser.user_metadata?.role;
          // if (userRole === 'admin') {
            dynamicLinks.push({ to: "/admin-dashboard", text: "لوحة التحكم", icon: <Shield className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> });
          // } else if (userRole === 'employee') {
            dynamicLinks.push({ to: "/employee-dashboard", text: "مهامي", icon: <Users2 className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> });
          // }
        } else {
          dynamicLinks.push({ to: "/login", text: "تسجيل الدخول", icon: <LogIn className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> });
          dynamicLinks.push({ to: "/signup", text: "إنشاء حساب", icon: <UserPlus className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> });
        }
        return [...baseNavLinks, ...dynamicLinks];
      };
      
      const navLinks = getNavLinks();

      useEffect(() => {
        const handleHashChange = () => {
          const hash = currentRouteLocation.hash; 
          if (hash) {
            const element = document.getElementById(hash.substring(1));
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        };
        
        if (currentRouteLocation.pathname === "/" && currentRouteLocation.hash) {
            const timeoutId = setTimeout(handleHashChange, 100); 
            return () => clearTimeout(timeoutId);
        } else if (!currentRouteLocation.hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, [currentRouteLocation]);


      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col" dir="rtl">
          <Toaster />
          <ContactModal isOpen={isContactModalOpen} setIsOpen={setIsContactModalOpen} serviceName={contactModalService} />
          
          <Header 
            navLinks={navLinks}
            onOpenContactModal={openContactModal}
            onToggleMobileMenu={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
            currentUser={currentUser}
          />
          
          <MobileMenu 
            isOpen={isMobileMenuOpen}
            navLinks={navLinks}
            onToggleMobileMenu={toggleMobileMenu}
            onOpenContactModal={openContactModal}
            currentUser={currentUser}
          />
          
          <main className="flex-grow">
            {children}
          </main>

          <Footer />
        </div>
      );
    };

    export default AppLayout;