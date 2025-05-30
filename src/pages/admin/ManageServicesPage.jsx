import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Edit, Trash, PlusCircle, ImagePlus, CheckCircle, AlertCircle, ListChecks, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const serviceCategories = [
  { id: 'home', name: 'خدمات المنازل', color: 'primary' },
  { id: 'commercial', name: 'خدمات تجارية', color: 'secondary' },
  { id: 'car', name: 'خدمات السيارات', color: 'accent' }
];

const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceData, setServiceData] = useState({
    id: '',
    category: serviceCategories[0].id,
    name: '',
    slug: '',
    description: '',
    features: ['', '', ''],
    image_url: '',
    icon: 'Sparkles'
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { isAdmin, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast({ title: 'فشل جلب الخدمات', description: error.message, variant: 'destructive' });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      setServiceData(prev => ({ ...prev, [name]: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    } else {
      setServiceData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (value) => {
    setServiceData(prev => ({ ...prev, category: value }));
  };

  const handleFeatureChange = (index, value) => {
    setServiceData(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const addFeatureField = () => {
    setServiceData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeatureField = (index) => {
    setServiceData(prev => {
      const newFeatures = [...prev.features];
      newFeatures.splice(index, 1);
      return { ...prev, features: newFeatures };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!fileTypes.includes(file.type)) {
      toast({ title: 'نوع ملف غير مدعوم', description: 'الرجاء تحميل صورة بصيغة JPG, PNG أو WebP', variant: 'destructive' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'الملف كبير جداً', description: 'الحد الأقصى لحجم الصورة هو 2 ميجابايت', variant: 'destructive' });
      return;
    }

    setUploadedImage(file);
  };

  const uploadImageToStorage = async (file) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'فشل تحميل الصورة', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceData.name || !serviceData.category || !serviceData.slug) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة.', variant: 'destructive' });
      return;
    }

    // Filter out empty features
    const filteredFeatures = serviceData.features.filter(feature => feature.trim() !== '');
    if (filteredFeatures.length === 0) {
      toast({ title: 'خطأ', description: 'يجب إضافة ميزة واحدة على الأقل.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = serviceData.image_url;

      if (uploadedImage) {
        imageUrl = await uploadImageToStorage(uploadedImage);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      const payload = {
        category: serviceData.category,
        name: serviceData.name,
        slug: serviceData.slug,
        description: serviceData.description,
        features: filteredFeatures,
        image_url: imageUrl,
        icon: serviceData.icon || 'Sparkles',
        last_updated_by: user?.id
      };

      let response;
      if (editingService) {
        response = await supabase.from('services').update(payload).eq('id', editingService.id);
      } else {
        response = await supabase.from('services').insert([payload]);
      }

      const { error } = response;
      if (error) throw error;

      toast({ 
        title: editingService ? 'تم تحديث الخدمة' : 'تمت إضافة الخدمة', 
        description: 'تم حفظ التغييرات بنجاح.',
        variant: 'default'
      });
      
      setIsFormOpen(false);
      setEditingService(null);
      setServiceData({
        id: '',
        category: serviceCategories[0].id,
        name: '',
        slug: '',
        description: '',
        features: ['', '', ''],
        image_url: '',
        icon: 'Sparkles'
      });
      setUploadedImage(null);
      fetchServices();
    } catch (error) {
      console.error('Error submitting service:', error);
      let description = error.message;
      if (error.message?.includes('duplicate key value violates unique constraint "services_slug_key"')) {
        description = 'المعرّف (slug) مستخدم بالفعل. يرجى اختيار معرّف فريد.';
      }
      toast({ title: 'فشل حفظ الخدمة', description, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceData({
      id: service.id,
      category: service.category,
      name: service.name,
      slug: service.slug,
      description: service.description,
      features: service.features || ['', '', ''],
      image_url: service.image_url || '',
      icon: service.icon || 'Sparkles'
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (error) throw error;
      toast({ title: 'تم حذف الخدمة', description: 'تم حذف الخدمة بنجاح.' });
      fetchServices();
    } catch (error) {
      toast({ title: 'فشل حذف الخدمة', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openNewServiceForm = () => {
    setEditingService(null);
    setServiceData({
      id: '',
      category: serviceCategories[0].id,
      name: '',
      slug: '',
      description: '',
      features: ['', '', ''],
      image_url: '',
      icon: 'Sparkles'
    });
    setUploadedImage(null);
    setIsFormOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const category = serviceCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير معروفة';
  };

  const getCategoryColor = (categoryId) => {
    const category = serviceCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'primary';
  };
  
  if (authLoading || (loading && services.length === 0 && !isFormOpen)) {
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
        <Button onClick={openNewServiceForm} className="bg-secondary hover:bg-secondary/90">
          <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" /> إضافة خدمة جديدة
        </Button>
      </header>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingService(null);
          setServiceData({
            id: '',
            category: serviceCategories[0].id,
            name: '',
            slug: '',
            description: '',
            features: ['', '', ''],
            image_url: '',
            icon: 'Sparkles'
          });
          setUploadedImage(null);
        }
      }}>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'قم بتعديل تفاصيل الخدمة أدناه.' : 'املأ تفاصيل الخدمة الجديدة أدناه.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-right block font-medium text-foreground/90">اسم الخدمة</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={serviceData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="mt-1 bg-input/50 focus:border-secondary"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-right block font-medium text-foreground/90">التصنيف</Label>
                <Select 
                  value={serviceData.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="mt-1 bg-input/50">
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="slug" className="text-right block font-medium text-foreground/90">المعرف الفريد (Slug)</Label>
              <Input 
                id="slug" 
                name="slug" 
                value={serviceData.slug} 
                onChange={handleInputChange} 
                required 
                className="mt-1 bg-input/50 focus:border-secondary" 
                placeholder="مثال: home-cleaning"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">يستخدم في رابط الخدمة (أحرف إنجليزية صغيرة وأرقام وشرطات فقط).</p>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-right block font-medium text-foreground/90">وصف الخدمة</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={serviceData.description} 
                onChange={handleInputChange} 
                rows={3} 
                required 
                className="mt-1 bg-input/50 focus:border-secondary" 
                placeholder="اكتب وصفاً مفصلاً للخدمة هنا..."
              />
            </div>

            <div>
              <Label className="text-right block font-medium text-foreground/90 mb-2">مميزات الخدمة</Label>
              <div className="space-y-3">
                {serviceData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`ميزة ${index + 1}`}
                      className="bg-input/50 focus:border-secondary"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFeatureField(index)}
                      disabled={serviceData.features.length <= 1}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addFeatureField}
                  className="mt-2"
                >
                  إضافة ميزة جديدة
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-right block font-medium text-foreground/90 mb-2">صورة الخدمة</Label>
              <div className="border-2 border-dashed border-input rounded-lg p-4 mt-1">
                <div className="flex flex-col items-center justify-center py-4">
                  <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">اسحب الصورة هنا أو انقر لتحميل صورة</p>
                  <p className="text-xs text-muted-foreground mb-4">PNG, JPG أو WebP (بحد أقصى 2 ميجابايت)</p>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full max-w-xs"
                  />
                  {(uploadedImage || serviceData.image_url) && (
                    <div className="mt-4">
                      <p className="text-sm font-medium flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {uploadedImage ? 'تم اختيار الصورة' : 'صورة موجودة بالفعل'}
                      </p>
                      {uploadedImage ? (
                        <div className="w-40 h-40 overflow-hidden rounded-md bg-slate-100 relative">
                          <img
                            src={URL.createObjectURL(uploadedImage)}
                            alt="معاينة الصورة"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : serviceData.image_url ? (
                        <div className="w-40 h-40 overflow-hidden rounded-md bg-slate-100 relative">
                          <img
                            src={serviceData.image_url}
                            alt="الصورة الحالية"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={loading || uploadingImage} 
                className={`bg-${getCategoryColor(serviceData.category)} hover:bg-${getCategoryColor(serviceData.category)}/90`}
              >
                {(loading || uploadingImage) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingService ? 'حفظ التغييرات' : 'إضافة الخدمة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Card className="shadow-xl mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
            الخدمات المتاحة ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && services.length === 0 && <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto my-4" />}
          {!loading && services.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد خدمات بعد. قم بإضافة خدمتك الأولى!</p>
              <Button onClick={openNewServiceForm} className="mt-4">
                إضافة خدمة جديدة
              </Button>
            </div>
          )}
          {!loading && services.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>المعرّف (Slug)</TableHead>
                  <TableHead>الصورة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getCategoryColor(service.category)}/10 text-${getCategoryColor(service.category)}`}>
                        {getCategoryName(service.category)}
                      </span>
                    </TableCell>
                    <TableCell dir="ltr" className="text-left">{service.slug}</TableCell>
                    <TableCell>
                      {service.image_url ? (
                        <div className="h-10 w-10 rounded overflow-hidden">
                          <img 
                            src={service.image_url} 
                            alt={service.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">بدون صورة</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                          <Edit size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash size={18} />
                        </Button>
                        <Link to={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700 hover:bg-green-50">
                            <Eye size={18} />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ManageServicesPage;