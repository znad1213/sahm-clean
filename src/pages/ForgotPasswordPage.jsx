import React, { useState } from 'react';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext'; 
    import { MailQuestion } from 'lucide-react';

    const ForgotPasswordPage = () => {
      const [email, setEmail] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const { sendPasswordResetEmail } = useAuth();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await sendPasswordResetEmail(email);
        // Toast is handled by AuthContext
        setIsLoading(false);
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
          <Card className="w-full max-w-md shadow-2xl border-accent/20">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}>
                <MailQuestion className="mx-auto h-16 w-16 text-accent mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-gradient-professional">نسيت كلمة المرور؟</CardTitle>
              <CardDescription className="text-muted-foreground">لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيينها.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block font-medium text-foreground/90">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input/50 focus:border-accent"
                  />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-lg shadow-md" disabled={isLoading}>
                  {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center block">
              <p className="text-sm text-muted-foreground">
                تذكرت كلمة المرور؟{' '}
                <Link to="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
                  العودة لتسجيل الدخول
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default ForgotPasswordPage;