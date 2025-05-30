import React from 'react';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Phone, Menu, X, AlignJustify, LogOut } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';


    const Header = ({ navLinks, onOpenContactModal, onToggleMobileMenu, isMobileMenuOpen, currentUser }) => {
      const { toast } = useToast();
      const handleLogout = async () => {
        if (!supabase) {
          toast({ title: "Supabase غير متصل", description: "لا يمكن تسجيل الخروج.", variant: "destructive" });
          return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ title: "خطأ في تسجيل الخروج", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "تم تسجيل الخروج بنجاح" });
          // Navigation to home or login will be handled by App.jsx state change
        }
      };

      return (
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}
          className="w-full py-4 px-4 md:px-8 shadow-lg sticky top-0 z-50 glassmorphism-light dark:glassmorphism-dark border-b border-border/50"
        >
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <motion.div whileHover={{ rotate: [0, 10, -10, 0], scale:1.1}}>
                 <img  className="h-12 w-12" alt="شعار شركة سهم كلين" src="https://images.unsplash.com/photo-1628592739641-5354300d8208" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-black text-gradient-professional whitespace-nowrap">
                سهم النقاء
              </h1>
            </Link>

            <nav className="hidden md:flex space-x-4 rtl:space-x-reverse items-center">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="text-foreground/80 hover:text-primary font-medium transition-colors flex items-center text-sm"
                  onClick={() => { if (link.to.includes("#") && isMobileMenuOpen) onToggleMobileMenu(); }}
                >
                  {link.icon} {link.text}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
              {currentUser ? (
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors duration-300 items-center" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> تسجيل الخروج
                </Button>
              ) : (
                <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-300 items-center" onClick={() => onOpenContactModal("طلب خدمة من الهيدر")}>
                  اطلب خدمة
                  <Phone className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
                </Button>
              )}
            </div>


            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={onToggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <AlignJustify className="h-7 w-7" />}
              </Button>
            </div>
          </div>
        </motion.header>
      );
    };

    export default Header;