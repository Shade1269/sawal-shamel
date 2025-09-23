export const performSignUpRuntime = async (
  { supabase, toast, fetchUserProfile, getBaseUrlFn },
  { email, password, fullName, username, role }
) => {
  const fallbackGetBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
        return window.location.origin;
      }
    }

    return 'https://atlantiss.tech';
  };

  const resolveBaseUrl = typeof getBaseUrlFn === 'function' ? getBaseUrlFn : fallbackGetBaseUrl;

  try {
    const normalizedRole = role ?? 'affiliate';
    const normalizedUsername = (username || fullName || '').trim() || fullName;

    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      const errorMsg = 'هذا البريد الإلكتروني مستخدم مسبقاً. الرجاء استخدام بريد آخر أو تسجيل الدخول.';
      toast({
        title: 'خطأ في التسجيل',
        description: errorMsg,
        variant: 'destructive'
      });
      return { error: new Error('Email already exists') };
    }

    const redirectUrl = `${resolveBaseUrl()}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          username: normalizedUsername,
          role: normalizedRole
        }
      }
    });

    if (error) {
      let errorMessage = error.message;

      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        errorMessage = 'هذا البريد الإلكتروني مستخدم مسبقاً. الرجاء استخدام بريد آخر أو تسجيل الدخول.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'كلمة المرور ضعيفة. استخدم أحرف وأرقام ورموز';
      } else if (error.message.includes('signup disabled')) {
        errorMessage = 'التسجيل معطل حالياً. تواصل مع الدعم الفني';
      }

      toast({
        title: 'خطأ في التسجيل',
        description: errorMessage,
        variant: 'destructive'
      });

      return { error };
    }

    if (data?.user) {
      const profileRecord = {
        auth_user_id: data.user.id,
        email,
        full_name: fullName,
        role: normalizedRole,
        is_active: true,
        points: 0,
      };

      const userProfileRecord = {
        ...profileRecord,
        level: 'bronze',
      };

      const { error: legacyProfileError } = await supabase
        .from('profiles')
        .upsert(profileRecord, { onConflict: 'auth_user_id' })
        .select('id')
        .maybeSingle();

      if (legacyProfileError) {
        console.error('Error creating profile record:', legacyProfileError);
        toast({
          title: 'تحذير',
          description: 'تم إنشاء الحساب ولكن حدث خطأ في حفظ بيانات الملف الشخصي.',
          variant: 'destructive',
        });
      }

      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .upsert(userProfileRecord, { onConflict: 'auth_user_id' })
        .select('id')
        .maybeSingle();

      if (userProfileError) {
        console.error('Error syncing user_profiles record:', userProfileError);
      }

      await fetchUserProfile(data.user.id, false);
    }

    if (data?.user && !data.user.email_confirmed_at) {
      toast({
        title: 'تم التسجيل بنجاح!',
        description: 'تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.',
      });
    } else {
      toast({
        title: 'تم التسجيل بنجاح!',
        description: 'مرحباً بك! تم إنشاء حسابك وتسجيل دخولك تلقائياً.',
      });
    }

    return { data, error: null };
  } catch (error) {
    console.error('SignUp error:', error);

    let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
    if (error?.message?.includes && error.message.includes('network')) {
      errorMessage = 'تحقق من اتصال الإنترنت وحاول مرة أخرى';
    }

    toast({
      title: 'خطأ في التسجيل',
      description: errorMessage,
      variant: 'destructive'
    });

    return { error };
  }
};
