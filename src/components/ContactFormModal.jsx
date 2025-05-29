import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
      DialogClose
    } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { Phone, User, Send, Building, Car, Home as HomeIcon } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';

    const servicesList = [
      { id: 'home_cleaning', name: 'تنظيف المنازل', icon: <HomeIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> },
      { id: 'commercial_cleaning', name: 'التنظيف التجاري', icon: <Building className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> },
      { id: 'car_wash', name: 'غسيل السيارات', icon: <Car className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> },
      { id: 'steam_polishing', name: 'تلميع السيارات بالبخار', icon: <Car className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> },
      { id: 'apartment_cleaning', name: 'غسيل الشقق', icon: <HomeIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> },
    ];

    export function ContactFormModal({ triggerButton }) {
      const [name, setName] = useState('');
      const [phone, setPhone] = useState('');
      const [selectedService, setSelectedService] = useState(servicesList[0].id);
      const [isOpen, setIsOpen] = useState(false);
      const [loading, setLoading] = useState(false);
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !phone || !selectedService) {
          toast({
            title: "خطأ في الإدخال",
            description: "يرجى ملء جميع الحقول المطلوبة.",
            variant: "destructive",
          });
          return;
        }
        
        setLoading(true);
        const serviceName = servicesList.find(s => s.id === selectedService)?.name || "خدمة غير محددة";

        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('service_requests')
              .insert([{ name, phone, service_name: serviceName, status: 'new' }]);

            if (error) throw error;

            toast({
              title: "تم إرسال طلبك بنجاح!",
              description: `شكراً لك ${name}. سنتواصل معك قريباً على الرقم ${phone} بخصوص خدمة ${serviceName}.`,
              className: "bg-green-500 text-white",
            });
            setName('');
            setPhone('');
            setSelectedService(servicesList[0].id);
            setIsOpen(false);
          } catch (error) {
            console.error('Error submitting to Supabase:', error);
            toast({
              title: "حدث خطأ",
              description: "لم نتمكن من إرسال طلبك. يرجى المحاولة مرة أخرى. تأكد من إكمال ربط Supabase.",
              variant: "destructive",
            });
          }
        } else {
          console.log("Supabase not initialized. Logging to console instead:", { name, phone, selectedService: serviceName });
          toast({
            title: "تم التسجيل (محلياً)",
            description: `شكراً ${name}. طلبك لـ ${serviceName} تم تسجيله مؤقتاً. يرجى إكمال ربط Supabase لإرسال الطلبات بشكل دائم.`,
            variant: "default",
            duration: 7000,
          });
          setName('');
          setPhone('');
          setSelectedService(servicesList[0].id);
          setIsOpen(false);
        }
        setLoading(false);
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            {triggerButton ? React.cloneElement(triggerButton, { onClick: () => setIsOpen(true) }) : <Button variant="outline">اطلب خدمة الآن</Button>}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-primary">طلب خدمة سريعة</DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                املأ النموذج وسنتواصل معك في أقرب وقت ممكن.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="service" className="text-right font-semibold">
                  اختر الخدمة المطلوبة
                </Label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="col-span-3 w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
                  disabled={loading}
                >
                  {servicesList.map(service => (
                    <option key={service.id} value={service.id}>
                       {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="name" className="text-right font-semibold">
                  <User className="inline-block w-4 h-4 ml-1 rtl:mr-1 rtl:ml-0" />
                  الاسم الكامل
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمد عبدالله"
                  className="col-span-3"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="phone" className="text-right font-semibold">
                  <Phone className="inline-block w-4 h-4 ml-1 rtl:mr-1 rtl:ml-0" />
                  رقم الجوال
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 05xxxxxxxx"
                  className="col-span-3"
                  required
                  disabled={loading}
                />
              </div>
              <DialogFooter className="mt-4">
                 <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={loading}>إلغاء</Button>
                 </DialogClose>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                  {loading ? 'جاري الإرسال...' : <><Send className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> إرسال الطلب</>}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }