import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, CheckCircle, Sparkles, Phone, Home, Loader2 } from 'lucide-react';
import ContactModal from '@/components/ContactModal';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Fallback service data in case database fetch fails
const serviceDetailsData = {
  'home-cleaning': {
    title: 'تنظيف شامل للمنازل',
    description: 'نقدم خدمة تنظيف شاملة وعميقة لمنزلك، تشمل جميع الغرف والمرافق. نستخدم مواد تنظيف آمنة وفعالة لضمان بيئة صحية ونظيفة لك ولعائلتك. فريقنا مدرب على أعلى مستوى للتعامل مع كافة أنواع الأوساخ والبقع.',
    features: ['تنظيف غرف النوم والمعيشة', 'مسح الأرضيات وتلميع الأسطح', 'تنظيف النوافذ والأبواب', 'إزالة الغبار من جميع الأثاث والديكورات', 'تنظيم وترتيب الأغراض بشكل احترافي'],
    images: [
      { alt: "غرفة معيشة نظيفة ومشرقة", query: "bright clean living room after professional cleaning" },
      { alt: "عامل ينظف نافذة كبيرة", query: "professional cleaner wiping large window" }
    ],
    relatedServices: [
        { name: "تنظيف مطابخ وحمامات", link: "/services/kitchen-bathroom"},
        { name: "غسيل مكيفات", link: "/services/ac-cleaning"}
    ]
  }
};

const ServiceHeader = ({ title, description }) => (
  <motion.header variants={fadeIn} className="mb-12 text-center md:text-right">
    <h1 className="text-4xl md:text-6xl font-extrabold text-gradient-professional mb-4">{title}</h1>
    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto md:mx-0">{description}</p>
  </motion.header>
);

const ServiceFeatures = ({ features }) => (
  <Card className="shadow-xl border-primary/20">
    <CardHeader>
      <CardTitle className="text-2xl text-primary flex items-center">
        <Sparkles className="w-7 h-7 mr-3 rtl:ml-3 rtl:mr-0 text-accent" />
        مميزات الخدمة
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <motion.li 
            key={index} 
            className="flex items-start space-x-3 rtl:space-x-reverse py-2 px-3 rounded-lg hover:bg-muted transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <span className="text-foreground/90">{feature}</span>
          </motion.li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const CallToAction = ({ serviceTitle, onOpenContactModal }) => (
  <motion.div 
    variants={fadeIn} 
    className="mt-12 p-8 bg-gradient-to-br from-secondary to-primary rounded-xl text-primary-foreground shadow-2xl text-center"
  >
    <h3 className="text-3xl font-bold mb-4">هل أنت جاهز لتجربة خدمة مميزة؟</h3>
    <p className="text-lg mb-6">
      دع فريقنا المحترف يعتني بنظافة منزلك، شركتك، أو سيارتك. الجودة شعارنا والرضا هدفنا.
    </p>
    <Button 
      size="lg" 
      className="bg-white text-primary hover:bg-slate-100 font-semibold text-lg px-10 py-4 shadow-lg transform hover:scale-105 transition-transform"
      onClick={onOpenContactModal}
    >
      اطلب {serviceTitle} الآن <Phone className="mr-3 h-6 w-6 rtl:ml-3 rtl:mr-0" />
    </Button>
  </motion.div>
);

const ServiceImages = ({ images }) => (
  <Card className="shadow-lg border-secondary/20">
    <CardHeader>
      <CardTitle className="text-xl text-secondary">صور من أعمالنا</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 gap-4">
      {images && images.map((image, index) => (
         <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 + 0.5 }}
            className="overflow-hidden rounded-lg shadow-md aspect-video"
         >
            <img 
              src={image.url || "https://images.unsplash.com/photo-1697256200022-f61abccad430"} 
              alt={image.alt || "صورة الخدمة"} 
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110" 
            />
         </motion.div>
      ))}
    </CardContent>
  </Card>
);

const RelatedServices = ({ services }) => (
  <Card className="shadow-lg border-accent/20">
    <CardHeader>
      <CardTitle className="text-xl text-accent">خدمات ذات صلة</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {services.map((related, index) => (
          <li key={index}>
            <Link to={related.link} className="flex items-center text-foreground/80 hover:text-accent transition-colors group">
               <Sparkles className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-accent/70 group-hover:text-accent transition-colors" />
              {related.name}
              <ChevronLeft className="h-4 w-4 mr-auto rtl:ml-auto rtl:mr-0 opacity-0 group-hover:opacity-100 transition-opacity transform rtl:rotate-180" />
            </Link>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const ServicePage = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        // Try to get from database first
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('slug', serviceId)
          .single();

        if (error) {
          console.warn('Error fetching from database:', error);
          // Fallback to hardcoded data if not found in DB
          if (serviceDetailsData[serviceId]) {
            setService(serviceDetailsData[serviceId]);
          } else {
            toast({ 
              title: 'خدمة غير موجودة', 
              description: 'لم نتمكن من العثور على الخدمة المطلوبة.', 
              variant: 'destructive'
            });
            setService(null);
          }
        } else {
          // Transform database data to match expected format
          const formattedService = {
            title: data.name,
            description: data.description,
            features: data.features || [],
            images: data.image_url ? [
              { url: data.image_url, alt: data.name }
            ] : [],
            relatedServices: [
              // You can fetch related services here or use the fallback
              { name: "الرجوع للخدمات", link: "/" }
            ]
          };
          setService(formattedService);
        }
      } catch (err) {
        console.error('Error in service fetch:', err);
        // Fallback to hardcoded data in case of error
        if (serviceDetailsData[serviceId]) {
          setService(serviceDetailsData[serviceId]);
        } else {
          toast({ 
            title: 'خطأ في التحميل', 
            description: 'حدث خطأ أثناء تحميل بيانات الخدمة.', 
            variant: 'destructive' 
          });
          setService(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId, toast]);
  
  const openContactModalHandler = () => {
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-destructive mb-4">الخدمة غير موجودة</h1>
        <p className="text-muted-foreground mb-8">عفواً، الخدمة التي تبحث عنها غير متوفرة حالياً.</p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Home className="ml-2 h-5 w-5" /> العودة للرئيسية
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-12 md:py-20"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      dir="rtl"
    >
      <ContactModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} serviceName={service.title} />
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
          <ChevronLeft className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0 transform rtl:rotate-180" />
          العودة إلى جميع الخدمات
        </Link>
      </div>

      <ServiceHeader title={service.title} description={service.description} />

      <div className="grid md:grid-cols-5 gap-10">
        <motion.main variants={fadeIn} className="md:col-span-3">
          <ServiceFeatures features={service.features} />
          <CallToAction serviceTitle={service.title} onOpenContactModal={openContactModalHandler} />
        </motion.main>

        <motion.aside variants={fadeIn} className="md:col-span-2 space-y-8">
          {service.images && service.images.length > 0 && <ServiceImages images={service.images} />}
          {service.relatedServices && service.relatedServices.length > 0 && <RelatedServices services={service.relatedServices} />}
        </motion.aside>
      </div>
    </motion.div>
  );
};

export default ServicePage;