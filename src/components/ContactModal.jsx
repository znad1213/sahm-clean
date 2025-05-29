import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { Smartphone, User, Send } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';

    const ContactModal = ({ isOpen, setIsOpen, serviceName = "خدمة عامة" }) => {
      const [name, setName] = useState('');
      const [phone, setPhone] = useState('');
      const [loading, setLoading] = useState(false);
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !phone) {
          toast({
            title: "خطأ في الإدخال",
            description: "يرجى تعبئة الاسم ورقم الجوال.",
            variant: "destructive",
          });
          return;
        }

        setLoading(true);

        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('service_requests') 
              .insert([{ name, phone, service_name: serviceName, status: 'new' }]);

            if (error) throw error;

            toast({
              title: "تم إرسال طلبك بنجاح!",
              description: `شكراً ${name}، سنتواصل معك قريباً بخصوص ${serviceName}.`,
            });
            setName('');
            setPhone('');
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
          console.log("Supabase not initialized. Logging to console instead:", { name, phone, service: serviceName });
           toast({
            title: "تم التسجيل (محلياً)",
            description: `شكراً ${name}. طلبك لـ ${serviceName} تم تسجيله مؤقتاً. يرجى إكمال ربط Supabase لإرسال الطلبات بشكل دائم.`,
            variant: "default",
            duration: 7000,
          });
          setName('');
          setPhone('');
          setIsOpen(false);
        }
        setLoading(false);
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl text-gradient-professional">طلب خدمة: {serviceName}</DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                يرجى ملء النموذج أدناه وسنتواصل معك في أقرب وقت ممكن.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right rtl:text-left col-span-1">
                  <User className="inline ml-1 rtl:mr-1 h-4 w-4 text-primary" />
                  الاسم
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3 bg-background border-input"
                  placeholder="اسمك الكامل"
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right rtl:text-left col-span-1">
                  <Smartphone className="inline ml-1 rtl:mr-1 h-4 w-4 text-primary" />
                  الجوال
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="col-span-3 bg-background border-input"
                  placeholder="05XXXXXXXX"
                  disabled={loading}
                />
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={loading}>إلغاء</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                  {loading ? 'جاري الإرسال...' : <>إرسال الطلب <Send className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /></>}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default ContactModal;