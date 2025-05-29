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
    import { Switch } from '@/components/ui/switch';
    import { Settings, Loader2, Save, Info } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';

    const SiteSettingsPage = () => {
      const [settings, setSettings] = useState({
        site_name: '',
        site_description: '',
        maintenance_mode_enabled: false,
        maintenance_mode_message: '',
      });
      const [loading, setLoading] = useState(true);
      const [saving, setSaving] = useState(false);
      const { isAdmin, loading: authLoading } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();

      const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from('site_settings').select('*');
          if (error) throw error;

          const formattedSettings = data.reduce((acc, curr) => {
            if (curr.setting_key === 'site_name') {
              acc.site_name = curr.setting_value?.value || '';
            } else if (curr.setting_key === 'site_description') {
              acc.site_description = curr.setting_value?.value || '';
            } else if (curr.setting_key === 'maintenance_mode') {
              acc.maintenance_mode_enabled = curr.setting_value?.enabled || false;
              acc.maintenance_mode_message = curr.setting_value?.message || '';
            }
            return acc;
          }, { site_name: '', site_description: '', maintenance_mode_enabled: false, maintenance_mode_message: '' });
          
          setSettings(formattedSettings);
        } catch (error) {
          toast({ title: 'فشل جلب الإعدادات', description: error.message, variant: 'destructive' });
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
        fetchSettings();
      }, [authLoading, isAdmin, navigate, toast, fetchSettings]);

      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        }));
      };
      
      const handleSwitchChange = (checked) => {
        setSettings(prev => ({
          ...prev,
          maintenance_mode_enabled: checked,
        }));
      };


      const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          const updates = [
            supabase.from('site_settings').upsert({ setting_key: 'site_name', setting_value: { value: settings.site_name } }, { onConflict: 'setting_key' }),
            supabase.from('site_settings').upsert({ setting_key: 'site_description', setting_value: { value: settings.site_description } }, { onConflict: 'setting_key' }),
            supabase.from('site_settings').upsert({ setting_key: 'maintenance_mode', setting_value: { enabled: settings.maintenance_mode_enabled, message: settings.maintenance_mode_message } }, { onConflict: 'setting_key' }),
          ];
          
          const results = await Promise.all(updates);
          results.forEach(result => {
            if (result.error) throw result.error;
          });

          toast({ title: 'تم حفظ الإعدادات', description: 'تم تحديث إعدادات الموقع بنجاح.' });
          fetchSettings(); 
        } catch (error) {
          toast({ title: 'فشل حفظ الإعدادات', description: error.message, variant: 'destructive' });
        } finally {
          setSaving(false);
        }
      };
      
      if (loading || authLoading) {
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
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gradient-professional">إعدادات الموقع العامة</h1>
            <p className="text-muted-foreground mt-1">قم بإدارة الإعدادات الأساسية لموقعك من هنا.</p>
          </header>

          <Card className="shadow-xl max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
                  تكوين الإعدادات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="site_name" className="text-right block font-medium text-foreground/90">اسم الموقع</Label>
                  <Input 
                    id="site_name" 
                    name="site_name" 
                    value={settings.site_name} 
                    onChange={handleInputChange} 
                    className="bg-input/50 focus:border-secondary"
                    placeholder="مثال: شركة زناد للخدمات"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description" className="text-right block font-medium text-foreground/90">وصف الموقع</Label>
                  <Textarea 
                    id="site_description" 
                    name="site_description" 
                    value={settings.site_description} 
                    onChange={handleInputChange} 
                    rows={3} 
                    className="bg-input/50 focus:border-secondary"
                    placeholder="وصف موجز يظهر في محركات البحث وعلامات تبويب المتصفح."
                  />
                </div>

                <div className="space-y-3 p-4 border rounded-md bg-background/70">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance_mode_enabled" className="text-right font-medium text-foreground/90">وضع الصيانة</Label>
                    <Switch
                      id="maintenance_mode_enabled"
                      name="maintenance_mode_enabled"
                      checked={settings.maintenance_mode_enabled}
                      onCheckedChange={handleSwitchChange}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">عند التفعيل، سيتم عرض رسالة الصيانة لجميع الزوار بدلاً من محتوى الموقع.</p>
                  {settings.maintenance_mode_enabled && (
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="maintenance_mode_message" className="text-right block font-medium text-foreground/90">رسالة وضع الصيانة</Label>
                      <Textarea 
                        id="maintenance_mode_message" 
                        name="maintenance_mode_message" 
                        value={settings.maintenance_mode_message} 
                        onChange={handleInputChange} 
                        rows={3} 
                        className="bg-input/50 focus:border-secondary"
                        placeholder="مثال: الموقع تحت الصيانة حاليًا، سنعود قريبًا."
                      />
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="ml-3 rtl:mr-3 rtl:ml-0">
                            <p className="text-sm text-primary/90">
                                <strong>ملاحظة:</strong> بيانات دخول حساب المدير (اسم المستخدم وكلمة المرور) تتم إدارتها عبر نظام المصادقة الرئيسي في Supabase أو من خلال صفحة "حسابي" الخاصة بالمدير. هذه الصفحة لا تتحكم ببيانات الاعتماد.
                            </p>
                        </div>
                    </div>
                </div>

              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" disabled={saving || loading} className="bg-secondary hover:bg-secondary/90 text-lg px-8 py-6">
                  {saving ? <Loader2 className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5 animate-spin" /> : <Save className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />}
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      );
    };

    export default SiteSettingsPage;