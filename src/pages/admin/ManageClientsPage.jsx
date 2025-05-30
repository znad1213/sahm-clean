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
import { Building2, Edit3, Trash2, ImagePlus, Loader2, PlusCircle, MoveUp, MoveDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientData, setClientData] = useState({
    name: '',
    logo_url: '',
    order: 0
  });
  const [logoFile, setLogoFile] = useState(null);
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
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
    fetchClients();
  }, [authLoading, isAdmin, navigate, toast, fetchClients]);

  const handleLogoUpload = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `clients/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return { url: publicUrl, path: filePath };
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let logoData = null;
      if (logoFile) {
        logoData = await handleLogoUpload(logoFile);
      }

      const clientPayload = {
        name: clientData.name,
        order: parseInt(clientData.order),
        ...(logoData && {
          logo_url: logoData.url,
          logo_storage_path: logoData.path
        })
      };

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientPayload)
          .eq('id', editingClient.id);

        if (error) throw error;
        toast({ title: 'تم تحديث العميل بنجاح' });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([clientPayload]);

        if (error) throw error;
        toast({ title: 'تم إضافة العميل بنجاح' });
      }

      setIsFormOpen(false);
      setEditingClient(null);
      setClientData({ name: '', logo_url: '', order: 0 });
      setLogoFile(null);
      fetchClients();
    } catch (error) {
      console.error('Error submitting client:', error);
      toast({ title: 'خطأ في حفظ العميل', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      toast({ title: 'تم حذف العميل بنجاح' });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ title: 'خطأ في حذف العميل', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setClientData({
      name: client.name,
      logo_url: client.logo_url || '',
      order: client.order || 0
    });
    setIsFormOpen(true);
  };

  const handleReorder = async (clientId, direction) => {
    const currentClient = clients.find(c => c.id === clientId);
    const currentIndex = clients.indexOf(currentClient);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= clients.length) return;

    const otherClient = clients[newIndex];
    
    try {
      const updates = [
        supabase
          .from('clients')
          .update({ order: otherClient.order })
          .eq('id', currentClient.id),
        supabase
          .from('clients')
          .update({ order: currentClient.order })
          .eq('id', otherClient.id)
      ];

      const results = await Promise.all(updates);
      const errors = results.map(r => r.error).filter(Boolean);
      
      if (errors.length > 0) throw errors[0];
      
      fetchClients();
    } catch (error) {
      console.error('Error reordering clients:', error);
      toast({ title: 'خطأ في إعادة الترتيب', description: error.message, variant: 'destructive' });
    }
  };

  if (loading && !clients.length) {
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
        <h1 className="text-3xl font-bold text-gradient-professional mb-4 sm:mb-0">إدارة عملائنا</h1>
        <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" /> إضافة عميل جديد
        </Button>
      </header>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'تعديل العميل' : 'إضافة عميل جديد'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'قم بتعديل بيانات العميل أدناه.' : 'أدخل بيانات العميل الجديد.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">اسم العميل</Label>
                <Input
                  id="name"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="order">الترتيب</Label>
                <Input
                  id="order"
                  type="number"
                  value={clientData.order}
                  onChange={(e) => setClientData({ ...clientData, order: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo">شعار العميل</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
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
                {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
            قائمة عملائنا
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الترتيب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, index) => (
                <TableRow key={client.id}>
                  <TableCell>{client.order}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {client.logo_url && (
                        <img src={client.logo_url} alt={client.name} className="w-10 h-10 rounded-lg object-contain bg-white" />
                      )}
                      <div className="font-medium">{client.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {index > 0 && (
                        <Button variant="ghost\" size="icon\" onClick={() => handleReorder(client.id, 'up')} className="text-primary hover:text-primary/80">
                          <MoveUp size={18} />
                        </Button>
                      )}
                      {index < clients.length - 1 && (
                        <Button variant="ghost" size="icon" onClick={() => handleReorder(client.id, 'down')} className="text-primary hover:text-primary/80">
                          <MoveDown size={18} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} className="text-blue-500 hover:text-blue-700">
                        <Edit3 size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </Button>
                    </div>
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

export default ManageClientsPage;