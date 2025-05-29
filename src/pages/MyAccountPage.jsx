import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
    import { User, Package, MapPin, Edit3, LogOut, ShieldCheck } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';

    const fadeIn = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const MyAccountPage = () => {
      const [user, setUser] = useState(null);
      const [orders, setOrders] = useState([]);
      const [subscriptions, setSubscriptions] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();
      const navigate = useNavigate();

      useEffect(() => {
        const fetchUserData = async () => {
          if (!supabase) {
            toast({ title: "Supabase غير متصل", description: "يرجى إكمال ربط Supabase لعرض بيانات الحساب.", variant: "destructive" });
            setLoading(false);
            return;
          }
          
          setLoading(true);
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Error fetching session:", sessionError);
            toast({ title: "خطأ", description: "لم نتمكن من جلب بيانات الجلسة.", variant: "destructive" });
            setLoading(false);
            return;
          }
          
          if (session?.user) {
            setUser(session.user);
            // Placeholder: Fetch orders and subscriptions
            // const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').eq('user_id', session.user.id);
            // const { data: subsData, error: subsError } = await supabase.from('subscriptions').select('*').eq('user_id', session.user.id);
            // if(ordersError) console.error("Error fetching orders", ordersError); else setOrders(ordersData || []);
            // if(subsError) console.error("Error fetching subscriptions", subsError); else setSubscriptions(subsData || []);
            setOrders([{id: 'ORD123', service_name: 'تنظيف شامل للمنزل', date: '2025-05-10', status: 'مكتمل', total: 250}, {id: 'ORD124', service_name: 'غسيل سيارة متنقل', date: '2025-05-15', status: 'قيد التنفيذ', total: 80}]);
            setSubscriptions([{id: 'SUB001', plan_name: "باقة 'لمع بيتك'", status: 'نشط', next_billing: '2025-06-01', price: 350}]);

          } else {
            toast({ title: "غير مسجل الدخول", description: "يرجى تسجيل الدخول لعرض صفحة حسابك.", variant: "default" });
            navigate('/login');
          }
          setLoading(false);
        };

        fetchUserData();
      }, [toast, navigate]);

      const handleLogout = async () => {
        if (!supabase) {
          toast({ title: "Supabase غير متصل", description: "لا يمكن تسجيل الخروج.", variant: "destructive" });
          return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ title: "خطأ في تسجيل الخروج", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "تم تسجيل الخروج بنجاح" });
          setUser(null);
          navigate('/');
        }
        setLoading(false);
      };

      if (loading) {
        return <div className="flex justify-center items-center h-screen"><ShieldCheck className="w-12 h-12 animate-spin text-primary" /></div>;
      }

      if (!user) {
         return (
          <div className="container mx-auto px-4 py-12 md:py-20 text-center" dir="rtl">
            <h1 className="text-3xl font-bold mb-6">يرجى تسجيل الدخول</h1>
            <p className="text-muted-foreground mb-8">تحتاج إلى تسجيل الدخول للوصول إلى صفحة حسابك.</p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
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
          <header className="mb-12 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-professional mb-2">مرحباً بك، {user.user_metadata?.full_name || user.email.split('@')[0]}!</h1>
            <p className="text-lg text-muted-foreground">هنا يمكنك إدارة معلوماتك، طلباتك، واشتراكاتك.</p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={fadeIn} className="md:col-span-1 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center"><User className="w-6 h-6 mr-2 rtl:ml-2 rtl:mr-0 text-primary" /> معلومات الحساب</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>الاسم:</strong> {user.user_metadata?.full_name || 'غير متوفر'}</p>
                  <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
                  <p><strong>رقم الهاتف:</strong> {user.phone || 'غير متوفر'}</p>
                  <Button variant="outline" className="mt-4 w-full text-primary border-primary hover:bg-primary/10">
                    <Edit3 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> تعديل المعلومات
                  </Button>
                </CardContent>
              </Card>
              <Button onClick={handleLogout} variant="destructive" className="w-full" disabled={loading}>
                <LogOut className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" /> {loading ? 'جاري...' : 'تسجيل الخروج'}
              </Button>
            </motion.div>

            <motion.div variants={fadeIn} className="md:col-span-2 space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center"><Package className="w-6 h-6 mr-2 rtl:ml-2 rtl:mr-0 text-secondary" /> طلباتك الأخيرة</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <ul className="space-y-4">
                      {orders.map(order => (
                        <li key={order.id} className="p-4 border rounded-md bg-background hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">{order.service_name}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">التاريخ: {order.date} - الإجمالي: {order.total} ريال</p>
                          <Button variant="link" className="p-0 h-auto text-primary">عرض التفاصيل</Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">لا توجد طلبات حالياً.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center"><ShieldCheck className="w-6 h-6 mr-2 rtl:ml-2 rtl:mr-0 text-accent" /> اشتراكاتك</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptions.length > 0 ? (
                    <ul className="space-y-4">
                      {subscriptions.map(sub => (
                        <li key={sub.id} className="p-4 border rounded-md bg-background hover:shadow-md transition-shadow">
                          <p className="font-semibold">{sub.plan_name} <span className={`px-2 py-1 text-xs rounded-full ${sub.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.status}</span></p>
                          <p className="text-sm text-muted-foreground">التجديد القادم: {sub.next_billing} - السعر: {sub.price} ريال/شهرياً</p>
                           <Button variant="link" className="p-0 h-auto text-primary">إدارة الاشتراك</Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">لا توجد اشتراكات حالياً.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center"><MapPin className="w-6 h-6 mr-2 rtl:ml-2 rtl:mr-0 text-primary" /> عناوينك المحفوظة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">لم تقم بإضافة أي عناوين بعد.</p>
                  <Button variant="outline" className="mt-4 text-primary border-primary hover:bg-primary/10">
                    <Edit3 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> إضافة عنوان جديد
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      );
    };

    export default MyAccountPage;