import React from 'react';
    import { Link } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Phone, LogOut } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const MobileMenu = ({ isOpen, navLinks, onToggleMobileMenu, onOpenContactModal, currentUser }) => {
      const { toast } = useToast();
      const handleLogout = async () => {
        if (!supabase) {
          toast({ title: "Supabase غير متصل", description: "لا يمكن تسجيل الخروج.", variant: "destructive" });
          return;
        }
        onToggleMobileMenu(); // Close menu first
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ title: "خطأ في تسجيل الخروج", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "تم تسجيل الخروج بنجاح" });
        }
      };
      return (
        <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-card shadow-lg absolute top-full left-0 right-0 z-40 border-b border-border/50"
          >
            <nav className="flex flex-col space-y-3 p-4">
              {navLinks.map(link => (
                 <Link 
                    key={link.to} 
                    to={link.to} 
                    className="text-foreground/90 hover:bg-muted hover:text-primary p-3 rounded-md transition-colors flex items-center text-lg" 
                    onClick={onToggleMobileMenu}
                  >
                   {link.icon} {link.text}
                 </Link>
              ))}
              {currentUser ? (
                 <Button className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-3 py-3 text-lg" onClick={handleLogout}>
                    <LogOut className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" /> تسجيل الخروج
                  </Button>
              ) : (
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-3 py-3 text-lg" onClick={() => { onToggleMobileMenu(); onOpenContactModal("طلب خدمة من القائمة الجانبية");}}>
                  اطلب خدمة الآن <Phone className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
                </Button>
              )}
            </nav>
          </motion.div>
        )}
        </AnimatePresence>
      );
    };

    export default MobileMenu;