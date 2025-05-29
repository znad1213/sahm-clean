import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea'; 
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Edit, Trash2, PlusCircle, FileText, Loader2, ExternalLink, Eye } from 'lucide-react';
    import { useNavigate, Link } from 'react-router-dom';

    const ManageContentPage = () => {
      const [pages, setPages] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingPage, setEditingPage] = useState(null);
      const [pageData, setPageData] = useState({ slug: '', title: '', content: '' });
      const { isAdmin, user, loading: authLoading } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();

      const fetchPages = useCallback(async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from('content_pages').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          setPages(data);
        } catch (error) {
          toast({ title: 'فشل جلب الصفحات', description: error.message, variant: 'destructive' });
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
        fetchPages();
      }, [authLoading, isAdmin, navigate, toast, fetchPages]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'slug') {
          setPageData(prev => ({ ...prev, [name]: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
        } else {
          setPageData(prev => ({ ...prev, [name]: value }));
        }
      };
      
      const handleContentChange = (e) => {
         setPageData(prev => ({ ...prev, content: e.target.value }));
      }

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pageData.slug || !pageData.title || !pageData.content) {
          toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة.', variant: 'destructive' });
          return;
        }
        setLoading(true);
        try {
          const payload = {
            slug: pageData.slug,
            title: pageData.title,
            content: { body: pageData.content }, 
            last_modified_by: user?.id,
          };

          let response;
          if (editingPage) {
            response = await supabase.from('content_pages').update(payload).eq('id', editingPage.id);
          } else {
            response = await supabase.from('content_pages').insert(payload);
          }

          const { error } = response;
          if (error) throw error;

          toast({ title: editingPage ? 'تم تحديث الصفحة' : 'تم إنشاء الصفحة', description: 'تم حفظ التغييرات بنجاح.' });
          setIsFormOpen(false);
          setEditingPage(null);
          setPageData({ slug: '', title: '', content: '' });
          fetchPages();
        } catch (error) {
          console.error('Error submitting page:', error);
          let description = error.message;
          if (error.message?.includes('duplicate key value violates unique constraint "content_pages_slug_key"')) {
            description = 'معرف الصفحة (slug) مستخدم بالفعل. يرجى اختيار معرف فريد.';
          }
          toast({ title: 'فشل حفظ الصفحة', description, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };

      const handleEdit = (page) => {
        setEditingPage(page);
        setPageData({ slug: page.slug, title: page.title, content: page.content?.body || '' });
        setIsFormOpen(true);
      };

      const handleDelete = async (pageId) => {
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه الصفحة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        setLoading(true);
        try {
          const { error } = await supabase.from('content_pages').delete().eq('id', pageId);
          if (error) throw error;
          toast({ title: 'تم حذف الصفحة', description: 'تم حذف الصفحة بنجاح.' });
          fetchPages();
        } catch (error) {
          toast({ title: 'فشل حذف الصفحة', description: error.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };

      const openNewPageForm = () => {
        setEditingPage(null);
        setPageData({ slug: '', title: '', content: '' });
        setIsFormOpen(true);
      };
      
      if (authLoading || (loading && pages.length === 0 && !isFormOpen)) {
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
            <h1 className="text-3xl font-bold text-gradient-professional mb-4 sm:mb-0">إدارة محتوى الصفحات</h1>
            <Button onClick={openNewPageForm} className="bg-secondary hover:bg-secondary/90">
              <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" /> صفحة جديدة
            </Button>
          </header>

          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              setEditingPage(null);
              setPageData({ slug: '', title: '', content: '' });
            }
          }}>
            <DialogContent className="sm:max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingPage ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}</DialogTitle>
                <DialogDescription>
                  {editingPage ? 'قم بتعديل تفاصيل الصفحة أدناه.' : 'املأ تفاصيل الصفحة الجديدة أدناه.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title" className="text-right block font-medium text-foreground/90">عنوان الصفحة</Label>
                  <Input id="title" name="title" value={pageData.title} onChange={handleInputChange} required className="mt-1 bg-input/50 focus:border-secondary"/>
                </div>
                <div>
                  <Label htmlFor="slug" className="text-right block font-medium text-foreground/90">المعرف الفريد (Slug)</Label>
                  <Input id="slug" name="slug" value={pageData.slug} onChange={handleInputChange} required className="mt-1 bg-input/50 focus:border-secondary" placeholder="مثال: about-us"/>
                  <p className="text-xs text-muted-foreground mt-1">يستخدم في رابط الصفحة (أحرف إنجليزية صغيرة وأرقام وشرطات فقط).</p>
                </div>
                <div>
                  <Label htmlFor="content" className="text-right block font-medium text-foreground/90">محتوى الصفحة</Label>
                  <Textarea id="content" name="content" value={pageData.content} onChange={handleContentChange} rows={10} required className="mt-1 bg-input/50 focus:border-secondary" placeholder="اكتب محتوى الصفحة هنا..."/>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingPage(null); setPageData({ slug: '', title: '', content: '' }); }}>إلغاء</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading} className="bg-secondary hover:bg-secondary/90">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingPage ? 'حفظ التعديلات' : 'إنشاء الصفحة')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Card className="shadow-xl mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
                الصفحات المنشأة ({pages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && pages.length === 0 && <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto my-4" />}
              {!loading && pages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد صفحات منشأة بعد. قم بإنشاء صفحتك الأولى!</p>
              )}
              {!loading && pages.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>المعرف (Slug)</TableHead>
                      <TableHead>آخر تعديل</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>{page.title}</TableCell>
                        <TableCell dir="ltr" className="text-left">{page.slug}</TableCell>
                        <TableCell>{new Date(page.updated_at).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</TableCell>
                        <TableCell>
                          <Link to={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700" title="عرض الصفحة">
                              <Eye size={18} />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(page)} className="text-blue-500 hover:text-blue-700 mx-1" title="تعديل">
                            <Edit size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)} className="text-red-500 hover:text-red-700" title="حذف">
                            <Trash2 size={18} />
                          </Button>
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

    export default ManageContentPage;