import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, Instagram, MessageSquare, BrandX, BrandTiktok, BrandSnapchat } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer 
      className="w-full py-10 px-4 md:px-8 text-center bg-card border-t border-border/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <div className="container mx-auto grid md:grid-cols-3 gap-8 items-center">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
             <img className="h-10 w-10" alt="شعار شركة سهم كلين المصغر" src="https://images.unsplash.com/photo-1485531865381-286666aa80a9" />
            <h3 className="text-xl font-bold text-gradient-professional">سهم كلين</h3>
          </div>
          <p className="text-muted-foreground text-sm">نظافة تثق بها، خدمة تعتمد عليها.</p>
        </div>
        
        <div className="text-center">
           <p className="text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()} شركة سهم كلين.
          </p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            تصميم وتطوير بواسطة زناد الزهراني
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <h4 className="font-semibold text-foreground mb-2">تواصل معنا</h4>
          <a href="tel:+966570500666" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
            <Phone className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" /> 0570500666
          </a>
          <a href="mailto:sahmclean1@gmail.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center mt-1">
            <Mail className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" /> sahmclean1@gmail.com
          </a>
          <div className="flex items-center space-x-3 rtl:space-x-reverse mt-3">
            <motion.a 
              href="https://instagram.com/sahmclean1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#E4405F] transition-all p-2 transform"
              whileHover={{ scale: 1.2, rotate: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Instagram className="w-6 h-6" />
            </motion.a>
            <motion.a 
              href="https://x.com/sahmclean1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-black transition-all p-2 transform"
              whileHover={{ scale: 1.2, rotate: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BrandX className="w-6 h-6" />
            </motion.a>
            <motion.a 
              href="https://tiktok.com/@sahmclean1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#000000] transition-all p-2 transform"
              whileHover={{ scale: 1.2, rotate: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BrandTiktok className="w-6 h-6" />
            </motion.a>
            <motion.a 
              href="https://snapchat.com/add/sahmclean1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#FFFC00] transition-all p-2 transform"
              whileHover={{ scale: 1.2, rotate: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BrandSnapchat className="w-6 h-6" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;