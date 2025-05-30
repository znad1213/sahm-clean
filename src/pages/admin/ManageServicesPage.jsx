import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Edit3, Trash2, ImagePlus, Loader2, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    status: 'active',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'خطأ في جلب البيانات', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast({ title: 'غير مصرح به', description: 'يجب أن تكون مسؤولاً للوصول لهذه الصفحة.', variant: 'destructive' });
      navigate('/admin-dashboard');
      return;
    }
    fetchServices();
  }, [authLoading, isAdmin, navigate, toast, fetchServices]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return { url: publicUrl, path: filePath };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageData = null;
      if (imageFile) {
        imageData = await handleImageUpload(imageFile);
      }

      const servicePayload = {
        name: serviceData.name,
        description: serviceData.description,
        price: parseFloat(serviceData.price),
        category_id: serviceData.category_id || null,
        status: serviceData.status,
        ...(imageData && {
          image_url: imageData.url,
          image_storage_path: imageData.path
        })
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(servicePayload)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: 'تم تحديث الخدمة بنجاح' });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([servicePayload]);

        if (error) throw error;
        toast({ title: 'تم إضافة الخدمة بنجاح' });
      }

      setIsFormOpen(false);
      setEditingService(null);
      setServiceData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        status: 'active',
        image_url: ''
      });
      setImageFile(null);
      fetchServices();
    } catch (error) {
      console.error('Error submitting service:', error);
      toast({ title: 'خطأ في حفظ الخدمة', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      toast({ title: 'تم حذف الخدمة بنجاح' });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({ title: 'خطأ في حذف الخدمة', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      category_id: service.category_id || '',
      status: service.status || 'active',
      image_url: service.image_url || ''
    });
    setIsFormOpen(true);
  };

  if (loading && !services.length) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
      dir="rtl"
    >
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gradient-professional mb-4 sm:mb-0">إدارة الخدمات</h1>
        <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" /> إضافة خدمة جديدة
        </Button>
      </header>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'قم بتعديل بيانات الخدمة أدناه.' : 'أدخل بيانات الخدمة الجديدة.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">اسم الخدمة</Label>
                <Input
                  id="name"
                  value={serviceData.name}
                  onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">وصف الخدمة</Label>
                <Textarea
                  id="description"
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={serviceData.price}
                  onChange={(e) => setServiceData({ ...serviceData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Select
                  value={serviceData.category_id}
                  onValueChange={(value) => setServiceData({ ...serviceData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={serviceData.status}
                  onValueChange={(value) => setServiceData({ ...serviceData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">متوفرة</SelectItem>
                    <SelectItem value="inactive">غير متوفرة</SelectItem>
                    <SelectItem value="seasonal">موسمية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="image">صورة الخدمة</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="cursor-pointer"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">إلغاء</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
            قائمة الخدمات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخدمة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {service.image_url && (
                        <img src={service.image_url} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">{service.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{service.price.toFixed(2)} ريال</TableCell>
                  <TableCell>{service.service_categories?.name || 'بدون تصنيف'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      service.status === 'active' ? 'bg-green-100 text-green-700' :
                      service.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {service.status === 'active' ? 'متوفرة' :
                       service.status === 'inactive' ? 'غير متوفرة' :
                       'موسمية'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="text-blue-500 hover:text-blue-700">
                      <Edit3 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ManageServicesPage;