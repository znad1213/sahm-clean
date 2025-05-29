import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { KeyRound, Eye, EyeOff } from 'lucide-react';

    const UpdatePasswordPage = () => {
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();
      const { updateUserPassword } = useAuth();
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
          toast({
            title: "خطأ",
            description: "كلمتا المرور غير متطابقتين.",
            variant: "destructive",
          });
          return;
        }
        setIsLoading(true);
        try {
          const { error } = await updateUserPassword(password);
          if (!error) {
            // Toast is handled by AuthContext
            navigate('/login');
          } else {
            // Toast is handled by AuthContext
          }
        } catch (error) {
          console.error("Update password error:", error);
           toast({
            title: "خطأ غير متوقع",
            description: "حدث خطأ غير متوقع أثناء محاولة تحديث كلمة المرور.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/70 p-4"
          dir="rtl"
        >
          <Card className="w-full max-w-md shadow-2xl border-primary/20">
            <CardHeader className="text-center">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}>
                <KeyRound className="mx-auto h-16 w-16 text-primary mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-gradient-professional">تحديث كلمة المرور</CardTitle>
              <CardDescription className="text-muted-foreground">أدخل كلمة المرور الجديدة لحسابك.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right block font-medium text-foreground/90">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input/50 focus:border-primary pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-right block font-medium text-foreground/90">تأكيد كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-input/50 focus:border-primary pr-10"
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg shadow-md" disabled={isLoading}>
                  {isLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default UpdatePasswordPage;