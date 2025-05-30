import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, ListOrdered, Briefcase, BarChart2, Settings, ShieldAlert, Loader2, FileText, Package, Sparkles, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const AdminDashboardPage = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0); 
  const [pagesCount, setPagesCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      toast({ title: "غير مصرح به", description: "يجب تسجيل الدخول كمسؤول للوصول لهذه الصفحة.", variant: "destructive" });
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [authLoading, isAdmin, navigate, toast]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const { count: usersDataCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      if (usersError) throw usersError;
      setUsersCount(usersDataCount || 0);

      const { count: employeesDataCount, error: employeesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'employee');
      
      if (employeesError) throw employeesError;
      setEmployeesCount(employeesDataCount || 0);

      const { count: pagesDataCount, error: pagesError } = await supabase
        .from('content_pages')
        .select('*', { count: 'exact', head: true });

      if (pagesError) throw pagesError;
      setPagesCount(pagesDataCount || 0);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({ title: "خطأ في جلب البيانات", description: error.message, variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading || loadingData) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }


  return (
    <motion.div 
      className="container mx-auto px-4 py-12 md:py-20"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      dir="rtl"
    >
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-professional">لوحة تحكم المسؤول</h1>
        {profile && <p className="text-muted-foreground mt-2">مرحباً بك، {profile.full_name || 'المسؤول'}</p>}
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المستخدمين</CardTitle>
            <Users className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
            <p className="text-xs text-muted-foreground">عدد العملاء المسجلين</p>
          </CardContent>
        </Card>
         <Card className="shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الموظفين النشطين</CardTitle>
            <Briefcase className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeesCount}</div>
            <p className="text-xs text-muted-foreground">عدد الموظفين الحاليين</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الصفحات المنشأة</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagesCount}</div>
            <p className="text-xs text-muted-foreground">إجمالي صفحات المحتوى</p>
          </CardContent>
        </Card>
         <Card className="shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إحصائيات عامة</CardTitle>
            <BarChart2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto text-sm" disabled>عرض التقارير (قريباً)</Button>
            <p className="text-xs text-muted-foreground">نظرة عامة على الأداء</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-xl bg-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl">الوصول السريع</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admin/manage-users">
              <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 text-base"><Users className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5"/> إدارة المستخدمين</Button>
            </Link>
            <Link to="/admin/manage-employees">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base"><Briefcase className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5"/> إدارة الموظفين</Button>
            </Link>
            <Link to="/admin/manage-content">
              <Button size="lg" className="w-full bg-primary/80 hover:bg-primary/70 text-primary-foreground py-6 text-base"><FileText className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5"/> إدارة المحتوى</Button>
            </Link>
            <Link to="/admin/manage-products">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base"><Package className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5"/> إدارة المنتجات</Button>
            </Link>
            <Link to="/admin/manage-services">
              <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 text-base"><Sparkles className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5"/> إدارة الخدمات</Button>
            </Link>
            <Link to="/admin/manage-clients">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base"><Building2 className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5"/> إدارة عملائنا</Button>
            </Link>
             <Link to="/admin/site-settings">
              <Button size="lg" className="w-full bg-gray-500 hover:bg-gray-600 text-white py-6 text-base"><Settings className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5"/> إعدادات الموقع</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl bg-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl">الطلبات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">لا توجد طلبات حالياً. سيتم عرض الطلبات هنا عند إضافتها.</p>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  );
};

export default AdminDashboardPage;