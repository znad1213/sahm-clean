import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Home, Briefcase, Car, Sparkles, Package, Zap, Phone, ShieldCheck, SprayCan, Sun, Wind, MessageSquare, Star, ChevronRight, ChevronLeft, MapPin, AirVent, Sofa, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactModal from '@/components/ContactModal';
import ShowerHead from 'lucide-react/dist/esm/icons/shower-head';
import { supabase } from '@/lib/supabaseClient';

const WashingMachine = ShowerHead; 

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const textVariant = (delay) => ({
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", duration: 1.25, delay } }
});

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    }
  }
};

const servicesData = {
  home: [
    { id: 'home-cleaning', icon: <Sparkles className="w-6 h-6 text-primary" />, text: "تنظيف شامل للمنازل", linkTo: "/services/home-cleaning" },
    { id: 'kitchen-bathroom', icon: <SprayCan className="w-6 h-6 text-primary" />, text: "تنظيف مطابخ وحمامات", linkTo: "/services/kitchen-bathroom" },
    { id: 'floor-steam', icon: <WashingMachine className="w-6 h-6 text-primary" />, text: "غسيل أرضيات وتعقيم بالبخار", linkTo: "/services/floor-steam" },
    { id: 'window-facade', icon: <Sun className="w-6 h-6 text-primary" />, text: "تنظيف نوافذ وواجهات", linkTo: "/services/window-facade" },
    { id: 'furniture-upholstery', icon: <Sofa className="w-6 h-6 text-primary" />, text: "تنظيف أثاث ومفروشات", linkTo: "/services/furniture-upholstery" },
    { id: 'air-purification', icon: <Wind className="w-6 h-6 text-primary" />, text: "تعطير وتعقيم الهواء", linkTo: "/services/air-purification" },
    { id: 'ac-cleaning', icon: <AirVent className="w-6 h-6 text-primary" />, text: "غسيل مكيفات (داخلية وخارجية)", linkTo: "/services/ac-cleaning" },
    { id: 'odor-removal', icon: <SprayCan className="w-6 h-6 text-primary" />, text: "إزالة روائح كريهة", linkTo: "/services/odor-removal" },
    { id: 'apartment-cleaning', icon: <WashingMachine className="w-6 h-6 text-primary" />, text: "غسيل شقق", linkTo: "/services/apartment-cleaning" },
  ],
  commercial: [
    { id: 'office-cleaning', icon: <Briefcase className="w-6 h-6 text-secondary" />, text: "تنظيف مكاتب وشركات", linkTo: "/services/office-cleaning" },
    { id: 'commercial-sanitization', icon: <ShieldCheck className="w-6 h-6 text-secondary" />, text: "تعقيم دورات مياه ومداخل", linkTo: "/services/commercial-sanitization" },
    { id: 'commercial-general', icon: <Sun className="w-6 h-6 text-secondary" />, text: "تنظيف زجاج ومكاتب وأرضيات", linkTo: "/services/commercial-general" },
    { id: 'reception-cleaning', icon: <Sparkles className="w-6 h-6 text-secondary" />, text: "تنظيف وتعطير استقبال وصالات", linkTo: "/services/reception-cleaning" },
  ],
  car: [
    { id: 'car-exterior', icon: <Car className="w-6 h-6 text-accent" />, text: "غسيل خارجي (بخار/ماء)", linkTo: "/services/car-exterior" },
    { id: 'car-interior', icon: <Sparkles className="w-6 h-6 text-accent" />, text: "تنظيف داخلي شامل", linkTo: "/services/car-interior" },
    { id: 'car-polishing', icon: <Sun className="w-6 h-6 text-accent" />, text: "تلميع خارجي للسيارة", linkTo: "/services/car-polishing" },
    { id: 'car-steam-polishing', icon: <ShieldCheck className="w-6 h-6 text-accent" />, text: "تلميع سيارات بالبخار", linkTo: "/services/car-steam-polishing" },
    { id: 'car-steam-sanitization', icon: <ShieldCheck className="w-6 h-6 text-accent" />, text: "تعقيم داخل السيارة بالبخار", linkTo: "/services/car-steam-sanitization" },
    { id: 'mobile-car-wash', icon: <MapPin className="w-6 h-6 text-accent" />, text: "غسيل سيارات متنقل", linkTo: "/services/mobile-car-wash" },
    { id: 'car-wash-subscription', icon: <Package className="w-6 h-6 text-accent" />, text: "اشتراك شهري لغسيل السيارة", linkTo: "/services/car-wash-subscription" },
  ]
};

const HeroSection = ({ onOpenContactModal }) => (
  <motion.section 
    className="text-center py-20 px-4 w-full bg-cover bg-center relative"
    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?auto=format&fit=crop&q=80')"}}
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/80 backdrop-blur-sm"></div>
    <div className="relative z-10">
      <motion.h2 variants={textVariant(0.2)} className="text-5xl md:text-7xl font-black mb-6 text-white">
        <span className="text-gradient-professional">نظافة</span> تليق بك، <span className="text-gradient-accented">بخدمة</span> ترضيك
      </motion.h2>
      <motion.p variants={textVariant(0.4)} className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto">
        شركة سهم كلين تقدم لكم أرقى خدمات النظافة الشاملة للمنازل، الشركات، والسيارات. جودة عالية، أسعار منافسة، ورضاكم هو غايتنا.
      </motion.p>
      <motion.div variants={fadeIn}>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-10 py-6 shadow-lg transform hover:scale-105 transition-transform" onClick={() => onOpenContactModal('استشارة عامة')}>
          اطلب خدمة الآن <Phone className="mr-3 h-6 w-6 rtl:ml-3 rtl:mr-0" />
        </Button>
      </motion.div>
    </div>
  </motion.section>
);

const ServicesSlider = ({ services, onOpenContactModal }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const allServicesForSlider = [
    ...services.home.map(s => ({ ...s, categoryColor: 'primary'})), 
    ...services.commercial.map(s => ({ ...s, categoryColor: 'secondary'})),
    ...services.car.map(s => ({ ...s, categoryColor: 'accent'}))
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === allServicesForSlider.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? allServicesForSlider.length - 1 : prev - 1));

  const itemsPerView = 3;
  const visibleSlides = allServicesForSlider.slice(currentSlide, currentSlide + itemsPerView).concat(
    currentSlide + itemsPerView > allServicesForSlider.length ? allServicesForSlider.slice(0, (currentSlide + itemsPerView) % allServicesForSlider.length) : []
  ).slice(0, itemsPerView);

  return (
    <motion.section id="services-slider" className="w-full py-16 px-4 bg-background" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.h2 variants={fadeIn} className="text-4xl font-bold text-center mb-12 text-gradient-professional">
        خدماتنا في لمحة سريعة
      </motion.h2>
      <div className="relative max-w-5xl mx-auto">
        <div className="overflow-hidden">
          <motion.div className="flex transition-transform duration-500 ease-out">
            {visibleSlides.map((service, index) => (
              <motion.div 
                key={`slider-${service.id}-${index}`} 
                className="w-1/3 flex-shrink-0 px-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full bg-card border-${service.categoryColor}/50 hover:border-${service.categoryColor} transform hover:shadow-xl transition-all duration-300 group`}>
                  <CardHeader className="items-center text-center">
                    <div className={`mb-3 p-3 rounded-full bg-${service.categoryColor}/10 text-${service.categoryColor} group-hover:scale-110 transition-transform`}>
                      {React.cloneElement(service.icon, { className: `w-8 h-8 text-${service.categoryColor}` })}
                    </div>
                    <CardTitle className={`text-xl !text-${service.categoryColor}`}>{service.text.split('(')[0].trim()}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Link to={service.linkTo}>
                      <Button variant="link" className={`text-${service.categoryColor} hover:text-${service.categoryColor}/80`}>
                        عرض التفاصيل <ChevronLeft className="mr-1 h-4 w-4 rtl:ml-1 rtl:mr-0" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <Button onClick={prevSlide} variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 right-0 rtl:left-0 rtl:right-auto bg-card/80 hover:bg-card p-2 rounded-full shadow-md">
          <ChevronRight className="h-6 w-6" />
        </Button>
        <Button onClick={nextSlide} variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 left-0 rtl:right-0 rtl:left-auto bg-card/80 hover:bg-card p-2 rounded-full shadow-md">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
    </motion.section>
  );
};

const ServiceCategoryCard = ({ title, description, icon, services, categoryKey, onOpenContactModal, colorClass, gradientFrom, gradientTo }) => (
  <motion.div variants={fadeIn}>
    <Card className={`h-full bg-card border-${colorClass}/30 hover:border-${colorClass} hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden`}>
      <div className={`p-6 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
        <div className="flex items-center mb-3 text-white">
          {React.cloneElement(icon, {className: "w-12 h-12 mr-4 rtl:ml-4 rtl:mr-0"})}
          <CardTitle className="text-3xl">{title}</CardTitle>
        </div>
        <CardDescription className="text-white/80">{description}</CardDescription>
      </div>
      <CardContent className="pt-6">
        <ul className="space-y-3">
          {services.map((item, index) => (
            <motion.li 
              key={`${categoryKey}-${index}`} 
              variants={fadeIn} 
              className="flex items-center space-x-3 rtl:space-x-reverse py-2 px-3 rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.03 }}
              onClick={() => onOpenContactModal(item.text)}
            >
              {item.icon}
              <Link to={item.linkTo} className="text-foreground/90 hover:text-primary">{item.text}</Link>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </motion.div>
);

const DetailedServicesSection = ({ services, onOpenContactModal }) => (
  <motion.section id="services-detailed" className="py-16 px-4 w-full" initial="hidden" animate="visible" variants={staggerContainer}>
    <motion.h2 variants={fadeIn} className="text-4xl font-bold text-center mb-16 text-gradient-professional">خدماتنا المتميزة بالتفصيل</motion.h2>
    <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
      <ServiceCategoryCard 
        title="خدمات تنظيف المنازل" 
        description="نظافة متكاملة لمنزلك، لبيئة صحية ومريحة تليق بك وبعائلتك." 
        icon={<Home />} 
        services={services.home} 
        categoryKey="home"
        onOpenContactModal={onOpenContactModal}
        colorClass="primary"
        gradientFrom="from-primary/80"
        gradientTo="to-primary/60"
      />
      <ServiceCategoryCard 
        title="خدمات التنظيف التجاري" 
        description="حلول نظافة احترافية لمقر عملك، لبيئة عمل منتجة ونظيفة." 
        icon={<Briefcase />} 
        services={services.commercial} 
        categoryKey="commercial"
        onOpenContactModal={onOpenContactModal}
        colorClass="secondary"
        gradientFrom="from-secondary/80"
        gradientTo="to-secondary/60"
      />
      <ServiceCategoryCard 
        title="خدمات غسيل السيارات" 
        description="سيارتك تستحق اللمعان، نقدم خدماتنا أينما كنت وبأعلى جودة." 
        icon={<Car />} 
        services={services.car} 
        categoryKey="car"
        onOpenContactModal={onOpenContactModal}
        colorClass="accent"
        gradientFrom="from-accent/80"
        gradientTo="to-accent/60"
      />
    </div>
  </motion.section>
);

const PackagesSection = ({ onOpenContactModal }) => {
  const packages = [
    { title: "باقة 'لمع بيتك'", description: "تنظيف منزل شهري شامل", icon: <Home className="w-10 h-10" />, serviceName: "باقة لمع بيتك" },
    { title: "باقة 'نظفها بلمعة'", description: "4 غسلات سيارة بالشهر", icon: <Car className="w-10 h-10" />, serviceName: "باقة نظفها بلمعة" },
    { title: "باقة 'الرايق'", description: "تنظيف منزل + سيارتين بسعر مخفّض", icon: <Package className="w-10 h-10" />, serviceName: "باقة الرايق" },
  ];
  return (
    <motion.section id="packages" className="py-16 px-4 w-full bg-muted/30" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.h2 variants={fadeIn} className="text-4xl font-bold text-center mb-16 text-gradient-accented">باقات وعروض خاصة</motion.h2>
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {packages.map((pkg, index) => (
          <motion.div variants={fadeIn} key={index}>
            <Card className="h-full bg-card border-transparent hover:border-primary/50 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center p-6 rounded-xl">
              <CardHeader className="items-center">
                <motion.div 
                  className="mx-auto p-5 bg-gradient-to-br from-primary to-secondary rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {React.cloneElement(pkg.icon, {className: "w-12 h-12 text-white"})}
                </motion.div>
                <CardTitle className="text-2xl font-bold text-gradient-professional">{pkg.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-lg">{pkg.description}</p>
              </CardContent>
              <CardContent className="mt-auto w-full">
                 <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold text-md py-3 shadow-md" onClick={() => onOpenContactModal(pkg.serviceName)}>
                   اطلب الباقة الآن
                 </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

const ClientsSection = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('order', { ascending: true });

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <motion.section id="testimonials" className="py-20 px-4 w-full" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.h2 variants={fadeIn} className="text-4xl font-bold text-center mb-16 text-gradient-professional">نفخر بعملائنا</motion.h2>
      <div className="flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto">
        {loading ? (
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        ) : clients.length > 0 ? (
          clients.map((client) => (
            <motion.div
              key={client.id}
              variants={fadeIn}
              className="w-40 h-40 p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            >
              <img
                src={client.logo_url}
                alt={client.name}
                className="max-w-full max-h-full object-contain"
                title={client.name}
              />
            </motion.div>
          ))
        ) : (
          <p className="text-muted-foreground">لم يتم إضافة أي عملاء بعد.</p>
        )}
      </div>
    </motion.section>
  );
};

const EmergencySection = ({ onOpenContactModal }) => (
  <motion.section 
    id="emergency" 
    className="py-20 px-4 w-full bg-gradient-to-tr from-accent/90 via-orange-500 to-red-600/90 text-center text-white"
    initial="hidden"
    animate="visible"
    variants={fadeIn}
  >
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      <motion.div whileHover={{ scale: 1.2, rotate: [0, -15, 15, -15, 0] }} transition={{ duration: 0.5 }}>
         <Zap className="w-20 h-20 text-white mb-6" />
      </motion.div>
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6">خدمة الطوارئ ٢٤ ساعة</h2>
      <p className="text-xl md:text-2xl text-white/90 mb-10">
        نحن هنا لمساعدتك في أي وقت! خدمة تنظيف طارئة متاحة على مدار الساعة. لا تتردد في الاتصال بنا.
      </p>
      <Button size="xl" variant="outline" className="bg-white text-accent hover:bg-white/90 font-bold text-xl px-12 py-7 shadow-xl transform hover:scale-105 transition-transform" onClick={() => onOpenContactModal('خدمة طوارئ')}>
        اتصل بنا فوراً <Phone className="mr-3 h-7 w-7 rtl:ml-3 rtl:mr-0" />
      </Button>
    </div>
  </motion.section>
);

const WhatsAppButton = () => (
  <div className="fixed bottom-6 left-6 rtl:right-6 rtl:left-auto z-50">
    <motion.a 
      href="https://wa.me/966567978309" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageSquare className="w-8 h-8" />
    </motion.a>
  </div>
);

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState("خدمة عامة");

  const openContactModal = (serviceName) => {
    setSelectedServiceForModal(serviceName);
    setIsModalOpen(true);
  };
  
  return (
    <div className="flex flex-col items-center scroll-smooth bg-gradient-to-b from-background to-muted/50 text-foreground" dir="rtl">
      <ContactModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} serviceName={selectedServiceForModal} />
      <HeroSection onOpenContactModal={openContactModal} />
      <ServicesSlider services={servicesData} onOpenContactModal={openContactModal} />
      <DetailedServicesSection services={servicesData} onOpenContactModal={openContactModal} />
      <PackagesSection onOpenContactModal={openContactModal} />
      <ClientsSection />
      <EmergencySection onOpenContactModal={openContactModal} />
      <WhatsAppButton />
    </div>
  );
};

export default HomePage;