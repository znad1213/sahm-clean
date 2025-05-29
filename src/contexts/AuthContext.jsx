import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const AuthContext = createContext(null);

    const initialUser = JSON.parse(localStorage.getItem('user')) || null;
    const initialProfile = JSON.parse(localStorage.getItem('profile')) || null;

    const useAuthEffects = (setUser, setProfile, fetchUserProfile, toast) => {
      useEffect(() => {
        const getSessionAndProfile = async () => {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("Error getting session:", sessionError.message);
            toast({ title: "خطأ في الجلسة", description: "حدث خطأ أثناء محاولة استرداد جلسة المستخدم.", variant: "destructive" });
          }
          
          const currentUser = session?.user ?? initialUser;
          setUser(currentUser);

          if (currentUser) {
            const userProfile = await fetchUserProfile(currentUser.id) || initialProfile;
            setProfile(userProfile);
            localStorage.setItem('user', JSON.stringify(currentUser));
            if (userProfile) {
              localStorage.setItem('profile', JSON.stringify(userProfile));
            } else {
              localStorage.removeItem('profile'); 
            }
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('profile');
            setProfile(null); 
          }
        };

        getSessionAndProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
              const userProfile = await fetchUserProfile(currentUser.id);
              setProfile(userProfile);
              localStorage.setItem('user', JSON.stringify(currentUser));
              if (userProfile) {
                localStorage.setItem('profile', JSON.stringify(userProfile));
              } else {
                localStorage.removeItem('profile');
              }
            } else {
              setProfile(null);
              localStorage.removeItem('user');
              localStorage.removeItem('profile');
            }
          }
        );

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }, [setUser, setProfile, fetchUserProfile, toast]);
    };


    const useAuthActions = (setLoading, fetchUserProfile, setProfileHook, setUserHook, toast) => {
      const login = async (phoneOrEmail, password) => {
        setLoading(true);
        let identity = {};
        const isEmail = phoneOrEmail.includes('@');

        if (isEmail) {
          identity = { email: phoneOrEmail, password };
        } else {
          const fullPhoneNumber = phoneOrEmail.startsWith('+') ? phoneOrEmail : `+966${phoneOrEmail.replace(/^0+/, '')}`;
          identity = { phone: fullPhoneNumber, password };
        }

        const { data, error } = await supabase.auth.signInWithPassword(identity);
        
        if (error) {
          toast({ title: "فشل تسجيل الدخول", description: `فشل تسجيل الدخول: ${error.message}`, variant: "destructive" });
          setLoading(false);
          return { user: null, profile: null, error };
        }

        let fetchedProfile = null;
        if (data.user) {
          fetchedProfile = await fetchUserProfile(data.user.id);
          setProfileHook(fetchedProfile);
          setUserHook(data.user); 
          toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك مجدداً!" });
          localStorage.setItem('user', JSON.stringify(data.user));
          if (fetchedProfile) {
            localStorage.setItem('profile', JSON.stringify(fetchedProfile));
          }
        }
        setLoading(false);
        return { user: data.user, profile: fetchedProfile, error: null };
      };
      
      const signup = async (email, phone, password, fullName, role = 'user') => {
        setLoading(true);
        const fullPhoneNumber = phone.startsWith('+') ? phone : `+966${phone.replace(/^0+/, '')}`;
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          phone: fullPhoneNumber,
          password,
          options: {
            data: { 
              full_name: fullName,
              role: role,
            }
          }
        });

        if (authError) {
          let errorMessage = authError.message;
          if (authError.message.includes("User already registered")) {
            errorMessage = "هذا البريد الإلكتروني أو الرقم مسجل بالفعل. يرجى استخدام بيانات أخرى أو تسجيل الدخول.";
          } else if (authError.message.includes("Password should be at least 6 characters")) {
            errorMessage = "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.";
          } else if (authError.message.includes("Unable to validate email address")) {
            errorMessage = "البريد الإلكتروني الذي أدخلته غير صالح.";
          }
          toast({ title: "فشل إنشاء حساب المصادقة", description: `فشل إنشاء الحساب: ${errorMessage}`, variant: "destructive" });
          setLoading(false);
          return { user: null, profile: null, error: authError, data: authData };
        }
        
        let signedUpProfile = {full_name: fullName, role: role, email: email};
        if (authData.user) {
           const userProfileData = await fetchUserProfile(authData.user.id);
           if (userProfileData) {
             setProfileHook(userProfileData);
             localStorage.setItem('profile', JSON.stringify(userProfileData));
             signedUpProfile = userProfileData;
           }
          setUserHook(authData.user); 
          localStorage.setItem('user', JSON.stringify(authData.user));
        }
        
        setLoading(false);
        return { user: authData.user, profile: signedUpProfile, error: null, data: authData };
      };

      const logout = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ title: "فشل تسجيل الخروج", description: error.message, variant: "destructive" });
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
          setUserHook(null);
          setProfileHook(null);
          toast({ title: "تم تسجيل الخروج" });
        }
        setLoading(false);
        return { error };
      };
      
      const sendPasswordResetEmail = async (email) => {
        setLoading(true);
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) {
          toast({ title: "فشل إرسال طلب إعادة التعيين", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "تم إرسال طلب إعادة تعيين كلمة المرور", description: "يرجى التحقق من بريدك الإلكتروني." });
        }
        setLoading(false);
        return { data, error };
      };

      const updateUserPassword = async (newPassword) => {
        setLoading(true);
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          toast({ title: "فشل تحديث كلمة المرور", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "تم تحديث كلمة المرور بنجاح" });
        }
        setLoading(false);
        return { data, error };
      };

      return { login, signup, logout, sendPasswordResetEmail, updateUserPassword };
    };


    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(initialUser);
      const [profile, setProfile] = useState(initialProfile);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      const fetchUserProfile = useCallback(async (userId) => {
        if (!userId) return null;
        setLoading(true);
        try {
          const { data, error, status } = await supabase
            .from('profiles')
            .select('full_name, role, email') 
            .eq('id', userId)
            .single();

          if (error && status !== 406) { 
            console.error('Error fetching user profile:', error.message);
            toast({ title: "خطأ في جلب الملف الشخصي", description: error.message, variant: "destructive" });
            setLoading(false);
            return null;
          }
          setLoading(false);
          return data;
        } catch (e) {
          console.error('Exception fetching user profile:', e);
          toast({ title: "خطأ استثنائي", description: "حدث خطأ غير متوقع أثناء جلب الملف الشخصي.", variant: "destructive" });
          setLoading(false);
          return null;
        }
      }, [toast]);
      
      useAuthEffects(setUser, setProfile, fetchUserProfile, toast);
      const actions = useAuthActions(setLoading, fetchUserProfile, setProfile, setUser, toast);

      useEffect(() => {
        const checkLoadingState = async () => {
            if (user && !profile) {
                setLoading(true); 
                const fetchedProfile = await fetchUserProfile(user.id);
                setProfile(fetchedProfile);
                setLoading(false);
            } else if (!user) {
                setLoading(false);
            }
        };
        checkLoadingState();
    }, [user, profile, fetchUserProfile]);


      const value = {
        user,
        profile,
        loading,
        ...actions,
        fetchUserProfile,
        isAuthenticated: !!user,
        isAdmin: profile?.role === 'admin',
        isEmployee: profile?.role === 'employee',
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };