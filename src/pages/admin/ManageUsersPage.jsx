import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Users, Edit3, Trash2, Search, Loader2, UserPlus, ShieldCheck, Briefcase, User } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useNavigate } from 'react-router-dom';

    const ManageUsersPage = () => {
      const [users, setUsers] = useState([]);
      const [filteredUsers, setFilteredUsers] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [loading, setLoading] = useState(true);
      const [editingUser, setEditingUser] = useState(null);
      const [selectedRole, setSelectedRole] = useState('');
      const { toast } = useToast();
      const { isAdmin, loading: authLoading } = useAuth();
      const navigate = useNavigate();

      const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
          if (authError) throw authError;

          const userIds = authUsers.users.map(u => u.id);
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('id', userIds);
          
          if (profilesError) throw profilesError;

          const combinedUsers = authUsers.users.map(authUser => {
            const profile = profilesData.find(p => p.id === authUser.id);
            return {
              ...authUser,
              full_name: profile?.full_name || 'N/A',
              role: profile?.role || 'user', 
            };
          });

          setUsers(combinedUsers);
          setFilteredUsers(combinedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
          toast({ title: "خطأ في جلب المستخدمين", description: error.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        if (authLoading) return;
        if (!isAdmin) {
          toast({ title: "غير مصرح به", description: "يجب أن تكون مسؤولاً للوصول لهذه الصفحة.", variant: "destructive" });
          navigate('/admin-dashboard');
          return;
        }
        fetchUsers();
      }, [authLoading, isAdmin, navigate, toast, fetchUsers]);

      useEffect(() => {
        const results = users.filter(user =>
          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
      }, [searchTerm, users]);

      const handleEditUser = (user) => {
        setEditingUser(user);
        setSelectedRole(user.role);
      };

      const handleSaveUserChanges = async () => {
        if (!editingUser || !selectedRole) return;
        setLoading(true);
        try {
          // Update role in profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: selectedRole })
            .eq('id', editingUser.id);

          if (profileError) throw profileError;

          // Update role in auth.users.user_metadata (important for Supabase Auth rules)
          const { error: authError } = await supabase.auth.admin.updateUserById(
            editingUser.id,
            { user_metadata: { ...editingUser.user_metadata, role: selectedRole } }
          );

          if (authError) throw authError;
          
          toast({ title: "تم تحديث المستخدم بنجاح" });
          setEditingUser(null);
          fetchUsers(); // Re-fetch to reflect changes
        } catch (error) {
          console.error('Error updating user:', error);
          toast({ title: "خطأ في تحديث المستخدم", description: error.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };

      const handleDeleteUser = async (userId) => {
        if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        setLoading(true);
        try {
          // Deleting from auth.users will cascade delete from profiles due to DB trigger/foreign key
          const { error } = await supabase.auth.admin.deleteUser(userId);
          if (error) throw error;
          toast({ title: "تم حذف المستخدم بنجاح" });
          fetchUsers(); // Re-fetch
        } catch (error) {
          console.error('Error deleting user:', error);
          toast({ title: "خطأ في حذف المستخدم", description: error.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      
      const getRoleIcon = (role) => {
        if (role === 'admin') return <ShieldCheck className="h-5 w-5 text-red-500 mr-2 rtl:ml-2 rtl:mr-0" />;
        if (role === 'employee') return <Briefcase className="h-5 w-5 text-blue-500 mr-2 rtl:ml-2 rtl:mr-0" />;
        return <User className="h-5 w-5 text-gray-500 mr-2 rtl:ml-2 rtl:mr-0" />;
      };

      if (authLoading || (loading && users.length === 0)) {
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
            <h1 className="text-3xl font-bold text-gradient-professional mb-4 sm:mb-0">إدارة المستخدمين</h1>
            <div className="relative w-full sm:w-auto">
              <Input 
                type="search"
                placeholder="ابحث بالاسم، البريد، أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-input/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </header>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
                قائمة المستخدمين ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && users.length > 0 && <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto my-4" />}
              {!loading && filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا يوجد مستخدمون يطابقون بحثك أو لا يوجد مستخدمون بعد.</p>
              )}
              {!loading && filteredUsers.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم الكامل</TableHead>
                      <TableHead>رقم الجوال</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || user.user_metadata?.full_name || 'غير متوفر'}</TableCell>
                        <TableCell>{user.phone || 'غير متوفر'}</TableCell>
                        <TableCell>{user.email || 'غير متوفر'}</TableCell>
                        <TableCell className="flex items-center">
                          {getRoleIcon(user.role)}
                          {user.role === 'admin' ? 'مسؤول' : user.role === 'employee' ? 'موظف' : 'مستخدم'}
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} className="text-blue-500 hover:text-blue-700">
                              <Edit3 size={18} />
                            </Button>
                          </DialogTrigger>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 mr-2 rtl:ml-2 rtl:mr-0">
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

          {editingUser && (
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
              <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle>تعديل المستخدم: {editingUser.full_name || editingUser.email}</DialogTitle>
                  <DialogDescription>
                    قم بتغيير دور المستخدم. اضغط على حفظ عند الانتهاء.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right col-span-1">
                      الدور
                    </Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole} dir="rtl">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="اختر دوراً" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">مستخدم</SelectItem>
                        <SelectItem value="employee">موظف</SelectItem>
                        <SelectItem value="admin">مسؤول</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">إلغاء</Button>
                  </DialogClose>
                  <Button onClick={handleSaveUserChanges} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    حفظ التغييرات
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      );
    };

    export default ManageUsersPage;