import { UnifiedButton as Button } from "@/components/design-system";
import { UnifiedCard as Card } from "@/components/design-system";
import { UnifiedBadge as Badge } from "@/components/design-system";
import { MessageCircle, Users, Shield, Zap, Globe, Heart, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useDarkMode } from "@/shared/components/DarkModeProvider";

const ChatLanding = () => {
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="min-h-screen bg-gradient-landing rtl" dir="rtl">
      {/* Olive overlay for hero */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full" style={{
        background: `radial-gradient(1200px 600px at 80% -200px, color-mix(in srgb, var(--olive, var(--accent)) 20%, transparent), transparent 60%),
                       radial-gradient(800px 400px at 20% 0px, color-mix(in srgb, var(--olive, var(--accent)) 15%, transparent), transparent 60%)`
        }} />
      </div>
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground arabic-text">دردشة عربية</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Badge variant={isDarkMode ? "secondary" : "default"} className="arabic-text">
                  {isDarkMode ? "الوضع الليلي" : "الوضع النهاري"}
                </Badge>
                <span className="text-sm arabic-text">مرحباً، {user.email}</span>
                <Button variant="ghost" onClick={() => navigate('/chat')} className="arabic-text">
                  الدردشة الآن
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')} className="arabic-text">تسجيل الدخول</Button>
                <Button variant="hero" onClick={() => navigate('/auth')} className="arabic-text shadow-soft">انضم الآن</Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 arabic-text leading-tight">
            تطبيق الدردشة العربي
            <span className="bg-gradient-hero bg-clip-text text-transparent block mt-2">
              الأول في المنطقة
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 arabic-text max-w-2xl mx-auto leading-relaxed">
            تواصل مع الأصدقاء والعائلة في بيئة آمنة ومحمية. دردشة لحظية، مكالمات صوتية ومرئية، 
            ومشاركة الملفات بكل سهولة وأمان
          </p>
          <div className="flex gap-6 justify-center items-center flex-wrap">
            <Button 
              size="lg" 
              variant="hero" 
              className="text-lg px-8 py-4 arabic-text shadow-glow animate-bounce-in"
              onClick={() => user ? navigate('/chat') : navigate('/auth')}
            >
              <MessageCircle className="ml-2 h-5 w-5" />
              {user ? 'الدردشة' : 'ابدأ الدردشة الآن'}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 arabic-text animate-slide-up">
              <Users className="ml-2 h-5 w-5" />
              تصفح الغرف
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4 arabic-text">
            لماذا دردشة عربية؟
          </h3>
          <p className="text-muted-foreground arabic-text text-lg">
            أفضل تجربة دردشة مصممة خصيصاً للمستخدم العربي
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 text-center hover:shadow-soft transition-all duration-300 animate-slide-up">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4 arabic-text">دردشة لحظية</h4>
            <p className="text-muted-foreground arabic-text leading-relaxed">
              رسائل فورية بسرعة البرق مع تقنية الوقت الفعلي المتطورة
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-soft transition-all duration-300 animate-slide-up delay-100">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4 arabic-text">أمان عالي</h4>
            <p className="text-muted-foreground arabic-text leading-relaxed">
              تشفير من النهاية للنهاية لحماية محادثاتك وخصوصيتك
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-soft transition-all duration-300 animate-slide-up delay-200">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4 arabic-text">غرف متنوعة</h4>
            <p className="text-muted-foreground arabic-text leading-relaxed">
              غرف عامة وخاصة للنقاشات المختلفة والاهتمامات المتنوعة
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-soft transition-all duration-300 animate-slide-up delay-300">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4 arabic-text">واجهة عربية</h4>
            <p className="text-muted-foreground arabic-text leading-relaxed">
              تصميم من اليمين لليسار يدعم اللغة العربية بشكل مثالي
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-soft transition-all duration-300 animate-slide-up delay-400">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4 arabic-text">رسائل متقدمة</h4>
            <p className="text-muted-foreground arabic-text leading-relaxed">
              نصوص، إيموجي، صور، فيديو قصير ومشاركة الملفات
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-soft transition-all duration-300 animate-slide-up delay-500">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4 arabic-text">مجتمع ودود</h4>
            <p className="text-muted-foreground arabic-text leading-relaxed">
              انضم لمجتمع عربي متحضر ومتفاعل في بيئة آمنة
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl font-bold text-foreground mb-6 arabic-text">
            جاهز للبدء؟
          </h3>
          <p className="text-xl text-muted-foreground mb-10 arabic-text">
            انضم لآلاف المستخدمين واستمتع بأفضل تجربة دردشة عربية
          </p>
          <Button 
            size="lg" 
            variant="hero" 
            className="text-xl px-12 py-5 arabic-text shadow-glow animate-bounce-in"
            onClick={() => user ? navigate('/chat') : navigate('/auth')}
          >
            <MessageCircle className="ml-3 h-6 w-6" />
            {user ? 'الدردشة' : 'ابدأ الدردشة مجاناً'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-xl font-bold text-foreground arabic-text">دردشة عربية</h4>
          </div>
          <p className="text-muted-foreground arabic-text">
            © 2024 دردشة عربية. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatLanding;