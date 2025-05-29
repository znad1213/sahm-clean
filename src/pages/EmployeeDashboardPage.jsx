import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
    import { ListChecks, Clock, CheckCircle, UserCircle, ShieldX } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';

    const fadeIn = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const EmployeeDashboardPage = () => {
      const [assignedTasks, setAssignedTasks] = useState([]);
      const [employeeName, setEmployeeName] = useState("الموظف");
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();
      const navigate = useNavigate();

      useEffect(() => {
        const checkEmployee = async () => {
          if (!supabase) {
            toast({ title: "Supabase غير متصل", description: "يرجى إكمال ربط Supabase للوصول للوحة التحكم.", variant: "destructive" });
            setLoading(false);
            navigate('/login');
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            toast({ title: "غير مصرح به", description: "يجب تسجيل الدخول كموظف.", variant: "destructive" });
            navigate('/login');
            return;
          }
          // In a real app, you'd check if user has 'employee' role and fetch their name
          // For now, we assume any logged-in user can see this for demo purposes.
          // setEmployeeName(session.user.user_metadata?.full_name || "الموظف");
          fetchAssignedTasks(session.user.id);
        };

        const fetchAssignedTasks = async (employeeId) => {
          setLoading(true);
          // Placeholder: Fetch tasks assigned to this employee
          // const { data, error } = await supabase.from('service_tasks').select('*, service_requests(*)').eq('assigned_to_employee_id', employeeId).order('due_date', { ascending: true });
          // if(error) console.error(error); else setAssignedTasks(data || []);
          setAssignedTasks([
            {id: 'TASK001', service_request: { name: 'علي حسن', service_name: 'تنظيف مطبخ وحمام', phone: '0512345678', address: 'شارع الملك فهد، الرياض' }, due_date: '2025-05-20', status: 'pending'},
            {id: 'TASK002', service_request: { name: 'نورة عبدالله', service_name: 'غسيل سيارة بالبخار', phone: '0598765432', address: 'حي الياسمين، جدة - الموقع: https://maps.google.com/?q=...' }, due_date: '2025-05-22', status: 'in_progress'},
          ]);
          setLoading(false);
        };
        
        checkEmployee();
      }, [toast, navigate]);

      const updateTaskStatus = async (taskId, newStatus) => {
        if (!supabase) {
          toast({ title: "Supabase غير متصل", description: "لا يمكن تحديث حالة المهمة.", variant: "destructive" });
          return;
        }
        // Placeholder: Update task status in Supabase
        // const { error } = await supabase.from('service_tasks').update({ status: newStatus }).eq('id', taskId);
        // if (error) {
        //   toast({ title: "خطأ", description: "لم نتمكن من تحديث حالة المهمة.", variant: "destructive" });
        // } else {
        //   toast({ title: "تم التحديث بنجاح!" });
        //   fetchAssignedTasks(supabase.auth.user()?.id); // Re-fetch tasks
        // }
        setAssignedTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {...task, status: newStatus} : task));
        toast({ title: "تم تحديث الحالة (محلياً)" });
      };

      if (loading) {
        return <div className="flex justify-center items-center h-screen"><UserCircle className="w-12 h-12 animate-pulse text-primary" /></div>;
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-professional">لوحة تحكم الموظف: {employeeName}</h1>
            <p className="text-lg text-muted-foreground">مرحباً بك! هنا يمكنك متابعة المهام المسندة إليك.</p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">المهام المعلقة</CardTitle>
                <ListChecks className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedTasks.filter(t => t.status === 'pending').length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">مهام قيد التنفيذ</CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedTasks.filter(t => t.status === 'in_progress').length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">المهام المكتملة (اليوم)</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedTasks.filter(t => t.status === 'completed' && new Date(t.due_date).toDateString() === new Date().toDateString()).length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">قائمة المهام</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedTasks.length > 0 ? (
                <div className="space-y-6">
                  {assignedTasks.map(task => (
                    <Card key={task.id} className={`border-r-4 ${task.status === 'pending' ? 'border-primary' : task.status === 'in_progress' ? 'border-yellow-500' : 'border-green-500'}`}>
                      <CardHeader>
                        <CardTitle>{task.service_request.service_name}</CardTitle>
                        <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
                          <p><strong>العميل:</strong> {task.service_request.name} ({task.service_request.phone})</p>
                          <p><strong>العنوان:</strong> {task.service_request.address}</p>
                          <p><strong>تاريخ الاستحقاق:</strong> {new Date(task.due_date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </CardContent>
                      </CardHeader>
                      <CardContent className="flex flex-col sm:flex-row gap-2 pt-2">
                        {task.status === 'pending' && (
                          <Button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="bg-yellow-500 hover:bg-yellow-600 text-white">بدء التنفيذ</Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button onClick={() => updateTaskStatus(task.id, 'completed')} className="bg-green-500 hover:bg-green-600 text-white">إكمال المهمة</Button>
                        )}
                        {task.status === 'completed' && (
                           <p className="text-green-600 font-semibold flex items-center"><CheckCircle className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0"/> مكتمل</p>
                        )}
                        <Button variant="outline">عرض تفاصيل الطلب</Button>
                         {task.service_request.address.includes('https://maps.google.com') && 
                            <a href={task.service_request.address.substring(task.service_request.address.indexOf('https://maps.google.com'))} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">عرض الموقع على الخريطة</Button>
                            </a>
                        }
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">لا توجد مهام مسندة إليك حالياً.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default EmployeeDashboardPage;