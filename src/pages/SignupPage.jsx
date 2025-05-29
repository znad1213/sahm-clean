import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { UserPlus, Eye, EyeOff, Phone, Mail } from 'lucide-react';

    const SignupPage = () => {
      const [email, setEmail] = useState('');
      const [localPhoneNumber, setLocalPhoneNumber] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();
      const { signup } = useAuth();
      const { toast } = useToast();
      const countryCode = "+966";

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
          toast({
            title: "خطأ في كلمة المرور",
            description: "كلمتا المرور غير متطابقتين.",
            variant: "destructive",
          });
          return;
        }

        const fullPhoneNumber = `${countryCode}${localPhoneNumber}`;

        if (!/^[5]\d{8}$/.test(localPhoneNumber)) {
            toast({
                title: "رقم الجوال غير صالح",
                description: "يرجى إدخال الجزء المحلي من رقم الجوال بشكل صحيح (مثال: 5xxxxxxxx).",
                variant: "destructive",
            });
            return;
        }
        
        if (!email) {
            toast({
                title: "البريد الإلكتروني مطلوب",
                description: "يرجى إدخال عنوان بريد إلكتروني صالح.",
                variant: "destructive",
            });
            return;
        }


        setIsLoading(true);
        try {
          let fullName = `مستخدم ${localPhoneNumber}`;
          let role = 'user';

          if (fullPhoneNumber === "+966567978309" && password === "Znad.1213") {
            fullName = "المدير العام";
            role = "admin";
          }
          
          const { error, data } = await signup(email, fullPhoneNumber, password, fullName, role);
          
          if (!error && data?.user) {
            toast({
              title: "تم إنشاء الحساب بنجاح!",
              description: "يمكنك الآن تسجيل الدخول إلى حسابك.",
              variant: "default",
              duration: 5000, 
            });
            navigate('/login');
          } else if (error) {
          }
        } catch (error) {
          console.error("Signup error:", error);
          toast({
            title: "خطأ غير متوقع",
            description: "حدث خطأ غير متوقع أثناء محاولة إنشاء الحساب.",
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
          <Card className="w-full max-w-md shadow-2xl border-secondary/20">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}>
                <UserPlus className="mx-auto h-16 w-16 text-secondary mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-gradient-accented">إنشاء حساب جديد</CardTitle>
              <CardDescription className="text-muted-foreground">انضم إلينا اليوم! املأ البيانات لإنشاء حسابك.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block font-medium text-foreground/90">
                    <Mail className="inline-block ml-1 h-4 w-4" /> البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input/50 focus:border-secondary h-10"
                  />
                </div>
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
                      className="bg-input/50 focus:border-secondary rounded-l-md rounded-r-none h-10"
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
                      className="bg-input/50 focus:border-secondary pr-10"
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-right block font-medium text-foreground/90">تأكيد كلمة المرور</Label>
                   <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-input/50 focus:border-secondary pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 text-lg shadow-md" disabled={isLoading}>
                  {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center block">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="font-medium text-secondary hover:text-secondary/80 transition-colors">
                  سجل الدخول
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default SignupPage;