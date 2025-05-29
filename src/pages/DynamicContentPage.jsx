import React, { useState, useEffect } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';

    const DynamicContentPage = () => {
      const { slug } = useParams();
      const [pageContent, setPageContent] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const { toast } = useToast();

      useEffect(() => {
        const fetchPage = async () => {
          if (!slug) {
            setError('معرف الصفحة غير موجود.');
            setLoading(false);
            return;
          }

          setLoading(true);
          setError(null);
          try {
            const { data, error: dbError } = await supabase
              .from('content_pages')
              .select('title, content')
              .eq('slug', slug)
              .single();

            if (dbError) {
              if (dbError.code === 'PGRST116') { 
                setError('لم يتم العثور على الصفحة المطلوبة.');
                toast({
                  title: 'صفحة غير موجودة',
                  description: `الصفحة بالمعرف "${slug}" غير موجودة.`,
                  variant: 'destructive',
                });
              } else {
                throw dbError;
              }
            } else if (data) {
              setPageContent(data);
            } else {
               setError('لم يتم العثور على الصفحة المطلوبة.');
            }
          } catch (err) {
            console.error('Error fetching page content:', err);
            setError('حدث خطأ أثناء جلب محتوى الصفحة.');
            toast({
              title: 'خطأ في جلب البيانات',
              description: err.message,
              variant: 'destructive',
            });
          } finally {
            setLoading(false);
          }
        };

        fetchPage();
      }, [slug, toast]);

      if (loading) {
        return (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        );
      }

      if (error) {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-12 md:py-20 text-center"
            dir="rtl"
          >
            <Card className="max-w-lg mx-auto shadow-xl border-destructive/50 bg-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl text-destructive">
                  <AlertTriangle className="mr-2 rtl:ml-2 rtl:mr-0 h-8 w-8" />
                  حدث خطأ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-destructive-foreground mb-6">{error}</p>
                <Button asChild variant="secondary">
                  <Link to="/">
                    <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" /> العودة إلى الرئيسية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      }

      if (!pageContent) {
        return (
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-12 md:py-20 text-center"
            dir="rtl"
          >
             <Card className="max-w-lg mx-auto shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">صفحة غير موجودة</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground mb-6">عفواً، لم نتمكن من العثور على الصفحة التي تبحث عنها.</p>
                    <Button asChild variant="default">
                      <Link to="/">
                        <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" /> العودة إلى الرئيسية
                      </Link>
                    </Button>
                </CardContent>
             </Card>
           </motion.div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-12 md:py-20"
          dir="rtl"
        >
          <article className="prose prose-lg dark:prose-invert max-w-none bg-card p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
            <header className="mb-8 border-b pb-4 border-border">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-dynamic">{pageContent.title}</h1>
            </header>
            {typeof pageContent.content?.body === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: pageContent.content.body.replace(/\n/g, '<br />') }} />
            ) : (
              <p>محتوى هذه الصفحة غير متوفر حاليًا أو بتنسيق غير مدعوم.</p>
            )}
          </article>
        </motion.div>
      );
    };

    export default DynamicContentPage;