import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Edit3, Trash2, ImagePlus, Loader2, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    status: 'active',
    image_url: '',
    stock_quantity: '0'
  });
  const [imageFile, setImageFile] = useState(null);
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
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
    fetchProducts();
  }, [authLoading, isAdmin, navigate, toast, fetchProducts]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

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

      const productPayload = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category_id: productData.category_id || null,
        status: productData.status,
        stock_quantity: parseInt(productData.stock_quantity),
        ...(imageData && {
          image_url: imageData.url,
          image_storage_path: imageData.path
        })
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'تم تحديث المنتج بنجاح' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productPayload]);

        if (error) throw error;
        toast({ title: 'تم إضافة المنتج بنجاح' });
      }

      setIsFormOpen(false);
      setEditingProduct(null);
      setProductData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        status: 'active',
        image_url: '',
        stock_quantity: '0'
      });
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({ title: 'خطأ في حفظ المنتج', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast({ title: 'تم حذف المنتج بنجاح' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: 'خطأ في حذف المنتج', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      status: product.status || 'active',
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity?.toString() || '0'
    });
    setIsFormOpen(true);
  };

  if (loading && !products.length) {
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
        <h1 className="text-3xl font-bold text-gradient-professional mb-4 sm:mb-0">إدارة المنتجات</h1>
        <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" /> إضافة منتج جديد
        </Button>
      </header>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'قم بتعديل بيانات المنتج أدناه.' : 'أدخل بيانات المنتج الجديد.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">وصف المنتج</Label>
                <Input
                  id="description"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity">الكمية المتوفرة</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={productData.stock_quantity}
                  onChange={(e) => setProductData({ ...productData, stock_quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Select
                  value={productData.category_id}
                  onValueChange={(value) => setProductData({ ...productData, category_id: value })}
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
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={productData.status}
                  onValueChange={(value) => setProductData({ ...productData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">متوفر</SelectItem>
                    <SelectItem value="inactive">غير متوفر</SelectItem>
                    <SelectItem value="out_of_stock">نفذت الكمية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="image">صورة المنتج</Label>
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
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
            قائمة المنتجات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {product.image_url && (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.price.toFixed(2)} ريال</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{product.product_categories?.name || 'بدون تصنيف'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status === 'active' ? 'متوفر' :
                       product.status === 'inactive' ? 'غير متوفر' :
                       'نفذت الكمية'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700">
                      <Edit3 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700">
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

export default ManageProductsPage;