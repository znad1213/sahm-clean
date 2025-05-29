import React, { useState } from 'react';
    import { Link, useNavigate, useLocation } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Eye, EyeOff, LogIn, Phone } from 'lucide-react';

    const LoginPage = () => {
      const [localPhoneNumber, setLocalPhoneNumber] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();
      const location = useLocation();
      const { login } = useAuth();
      const { toast } = useToast();
      const countryCode = "+966";

      const from = location.state?.from?.pathname || "/";

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (!/^[5]\d{8}$/.test(localPhoneNumber)) {
           toast({
              title: "رقم الجوال غير صالح",
              description: "يرجى إدخال الجزء المحلي من رقم الجوال بشكل صحيح (مثال: 5xxxxxxxx).",
              variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const fullPhoneNumber = `${countryCode}${localPhoneNumber}`;

        try {
          const { error } = await login(fullPhoneNumber, password); // Pass fullPhoneNumber to login context
          if (!error) {
            navigate(from, { replace: true });
          }
        } catch (error) {
          console.error("Login error:", error);
          toast({
            title: "خطأ غير متوقع",
            description: "حدث خطأ غير متوقع أثناء محاولة تسجيل الدخول.",
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
                <LogIn className="mx-auto h-16 w-16 text-primary mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-gradient-professional">تسجيل الدخول</CardTitle>
              <CardDescription className="text-muted-foreground">مرحباً بعودتك! أدخل بياناتك للمتابعة.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block font-medium text-foreground/90">
                    <Phone className="inline-block ml-1 h-4 w-4" /> رقم الجوال
                  </Label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-r-md border border-r-0 border-input bg-input/30 text-muted-foreground text-sm h-10">
                      {countryCode}
                    </span>
                    <Input
                      id="localPhoneNumber"
                      type="tel"
                      placeholder="5xxxxxxxx"
                      value={localPhoneNumber}
                      onChange={(e) => setLocalPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      required
                      className="bg-input/50 focus:border-primary rounded-l-md rounded-r-none h-10"
                      dir="ltr"
                      maxLength={9}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right block font-medium text-foreground/90">كلمة المرور</Label>
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
                <div className="text-sm text-left">
                  <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    هل نسيت كلمة المرور؟
                  </Link>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg shadow-md" disabled={isLoading}>
                  {isLoading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center block">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  أنشئ حساباً جديداً
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default LoginPage;