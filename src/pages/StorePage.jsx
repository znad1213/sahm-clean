import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
    import { ShoppingCart, PackagePlus, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import ContactModal from '@/components/ContactModal';

    const fadeIn = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
      hidden: {},
      visible: { transition: { staggerChildren: 0.1 } }
    };

    // Dummy product data - replace with actual data source later
    const initialProducts = [
      { id: 'prod_001', name: 'منظف شامل عالي التركيز (1 لتر)', price: 45.00, description: 'منظف فعال لجميع الأسطح، يزيل الأوساخ والدهون بسهولة.', imageQuery: 'bottle of concentrated all-purpose cleaner' },
      { id: 'prod_002', name: 'معقم أسطح برائحة الليمون (500 مل)', price: 25.00, description: 'يقتل 99.9% من الجراثيم ويترك رائحة منعشة.', imageQuery: 'spray bottle of lemon scented surface sanitizer' },
      { id: 'prod_003', name: 'ملمع أثاث بخشب العود (300 مل)', price: 35.00, description: 'يعيد اللمعان للخشب ويحميه، برائحة العود الفاخرة.', imageQuery: 'bottle of oud scented furniture polish' },
      { id: 'prod_004', name: 'شامبو سيارات بالواكس (1 لتر)', price: 55.00, description: 'ينظف ويلمع ويحمي طلاء السيارة في خطوة واحدة.', imageQuery: 'bottle of car wash shampoo with wax' },
      { id: 'prod_005', name: 'منشفة مايكروفايبر فائقة الامتصاص (قطعتين)', price: 30.00, description: 'لتنظيف وتجفيف مثالي بدون خدوش.', imageQuery: 'pack of two microfiber cleaning cloths' },
    ];
    
    const StorePage = () => {
      const [products, setProducts] = useState(initialProducts);
      const [cart, setCart] = useState([]);
      const { toast } = useToast();
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedProductForModal, setSelectedProductForModal] = useState("منتج من المتجر");


      useEffect(() => {
        const storedCart = localStorage.getItem('cleaningStoreCart');
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      }, []);

      useEffect(() => {
        localStorage.setItem('cleaningStoreCart', JSON.stringify(cart));
      }, [cart]);

      const addToCart = (product) => {
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item.id === product.id);
          if (existingItem) {
            return prevCart.map(item =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            return [...prevCart, { ...product, quantity: 1 }];
          }
        });
        toast({
          title: `🛒 ${product.name}`,
          description: "أضيف إلى سلة التسوق بنجاح!",
        });
      };

      const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
        toast({
          title: "🗑️ تم الحذف",
          description: "تمت إزالة المنتج من السلة.",
          variant: "destructive"
        });
      };

      const updateQuantity = (productId, amount) => {
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === productId
              ? { ...item, quantity: Math.max(1, item.quantity + amount) } // Ensure quantity doesn't go below 1
              : item
          ).filter(item => item.quantity > 0) // Remove if quantity becomes 0 or less
        );
      };
      
      const openContactModal = (productName) => {
        setSelectedProductForModal(`طلب المنتج: ${productName}`);
        setIsModalOpen(true);
      };

      const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

      return (
        <motion.div 
          className="container mx-auto px-4 py-12 md:py-20"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          dir="rtl"
        >
          <ContactModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} serviceName={selectedProductForModal} />

          <motion.header variants={fadeIn} className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gradient-professional mb-4">متجر سهم النقاء</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              منتجات تنظيف عالية الجودة، مختارة بعناية لتلبية احتياجاتك. تسوق الآن!
            </p>
          </motion.header>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Products List */}
            <motion.section className="lg:col-span-2" variants={staggerContainer}>
              <h2 className="text-2xl font-semibold mb-6 text-primary">منتجاتنا</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {products.map(product => (
                  <motion.div variants={fadeIn} key={product.id}>
                    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
                      <div className="h-48 w-full overflow-hidden">
                        <img  class="w-full h-full object-cover" alt={product.name} src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl text-foreground">{product.name}</CardTitle>
                        <CardDescription className="text-muted-foreground h-12 overflow-hidden">{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-end">
                        <p className="text-2xl font-bold text-primary mb-4">{product.price.toFixed(2)} ريال</p>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => addToCart(product)}>
                          <PackagePlus className="ml-2 h-5 w-5 rtl:mr-2 rtl:ml-0" /> أضف للسلة
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Shopping Cart */}
            <motion.aside className="lg:col-span-1" variants={fadeIn}>
              <Card className="sticky top-24 shadow-xl border-secondary/30">
                <CardHeader className="bg-secondary/10">
                  <CardTitle className="text-2xl text-secondary flex items-center">
                    <ShoppingCart className="ml-3 h-7 w-7 rtl:mr-3 rtl:ml-0" /> سلة التسوق
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">سلتك فارغة حالياً.</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <motion.div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 bg-background rounded-md shadow"
                          layout
                          initial={{ opacity: 0, y:10 }}
                          animate={{ opacity: 1, y:0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <div>
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} ريال x {item.quantity}</p>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="text-destructive hover:bg-destructive/10 h-7 w-7">
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                             <span className="w-5 text-center">{item.quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} className="text-primary hover:bg-primary/10 h-7 w-7">
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:bg-destructive/10 h-7 w-7">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      <hr className="my-4 border-border" />
                      <div className="flex justify-between items-center text-xl font-bold">
                        <p className="text-foreground">الإجمالي:</p>
                        <p className="text-primary">{cartTotal.toFixed(2)} ريال</p>
                      </div>
                      <Button className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground text-lg py-3" onClick={() => openContactModal(`إكمال شراء منتجات بقيمة ${cartTotal.toFixed(2)} ريال`)}>
                        إتمام الشراء والتواصل
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">سيتم التواصل معك لتأكيد الطلب واستكمال عملية الدفع والشحن.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.aside>
          </div>
        </motion.div>
      );
    };

    export default StorePage;