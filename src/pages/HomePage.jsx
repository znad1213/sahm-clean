import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Star, Users, Shield, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContactFormModal } from '@/components/ContactFormModal';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const HomePage = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const services = [
    {
      id: 'home-cleaning',
      title: 'تنظيف المنازل',
      description: 'خدمة تنظيف شاملة للمنازل والشقق مع ضمان الجودة',
      icon: <Home className="h-8 w-8 text-primary" />,
      imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg'
    },
    {
      id: 'car-wash',
      title: 'غسيل سيارات',
      description: 'غسيل وتلميع السيارات بأحدث التقنيات والمعدات',
      icon: <Car className="h-8 w-8 text-primary" />,
      imageUrl: 'https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg'
    },
    {
      id: 'commercial-cleaning',
      title: 'تنظيف تجاري',
      description: 'خدمات تنظيف احترافية للشركات والمكاتب',
      icon: <Building2 className="h-8 w-8 text-primary" />,
      imageUrl: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "محمد أحمد",
      role: "صاحب منزل",
      content: "خدمة ممتازة وفريق عمل محترف. النتائج فاقت توقعاتي بكثير!",
      rating: 5
    },
    {
      id: 2,
      name: "سارة خالد",
      role: "مديرة مكتب",
      content: "نتعامل معهم بشكل دوري لتنظيف مكاتبنا. دائماً في الموعد وبجودة عالية.",
      rating: 5
    },
    {
      id: 3,
      name: "عبدالله محمد",
      role: "صاحب شركة",
      content: "أفضل شركة تنظيف تعاملت معها. خدمة عملاء ممتازة وأسعار معقولة.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      <ContactFormModal isOpen={isContactModalOpen} setIsOpen={setIsContactModalOpen} />
      
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background to-muted/70 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg" 
            alt="خلفية تنظيف منازل" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-7xl font-black mb-6 text-gradient-professional"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              نظافة تثق بها
              <br />
              خدمة تعتمد عليها
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              نقدم خدمات تنظيف احترافية للمنازل والشركات
              <br />
              بأيدي خبراء مدربين وأحدث المعدات
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
                onClick={() => setIsContactModalOpen(true)}
              >
                <Phone className="ml-2 h-5 w-5 rtl:mr-2 rtl:ml-0" />
                اطلب خدمة الآن
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6"
                asChild
              >
                <Link to="/services">
                  <Sparkles className="ml-2 h-5 w-5 rtl:mr-2 rtl:ml-0" />
                  تصفح خدماتنا
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeIn} className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">جودة مضمونة</h3>
              <p className="text-muted-foreground">نضمن لك أعلى مستويات الجودة في كل خدمة نقدمها</p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center p-6">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">فريق محترف</h3>
              <p className="text-muted-foreground">فريق عمل مدرب على أعلى مستوى لتقديم أفضل خدمة</p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center p-6">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">خدمة متميزة</h3>
              <p className="text-muted-foreground">نسعى دائماً لتقديم تجربة تفوق توقعات عملائنا</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-detailed" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gradient-professional mb-4">خدماتنا</h2>
            <p className="text-xl text-muted-foreground">نقدم مجموعة متكاملة من خدمات التنظيف الاحترافية</p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {services.map((service) => (
              <motion.div 
                key={service.id}
                variants={fadeIn}
                className="group"
              >
                <Link to={`/services/${service.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={service.imageUrl} 
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="relative p-6">
                      <div className="flex items-center mb-3">
                        {service.icon}
                        <h3 className="text-xl font-bold mr-2">{service.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gradient-professional mb-4">آراء عملائنا</h2>
            <p className="text-xl text-muted-foreground">نفخر بثقة عملائنا وتقييماتهم الإيجابية</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial) => (
              <motion.div 
                key={testimonial.id}
                variants={fadeIn}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-lg mb-4">{testimonial.content}</p>
                    <div className="mt-auto">
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Emergency Section */}
      <section id="emergency" className="py-20 bg-gradient-to-br from-primary/80 to-secondary/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">هل تحتاج خدمة طارئة؟</h2>
            <p className="text-xl mb-8 text-white/90">فريقنا جاهز على مدار الساعة لتلبية طلبات التنظيف الطارئة</p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-6"
              onClick={() => setIsContactModalOpen(true)}
            >
              <Phone className="ml-2 h-5 w-5 rtl:mr-2 rtl:ml-0" />
              اتصل بنا الآن
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;