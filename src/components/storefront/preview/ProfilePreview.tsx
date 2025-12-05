import { motion } from 'framer-motion';
import { User, Phone, MapPin, Mail, Edit2 } from 'lucide-react';
import { UnifiedButton } from '@/components/design-system';

export const ProfilePreview = () => {
  const mockProfile = {
    name: 'سارة أحمد',
    email: 'sara.ahmed@example.com',
    phone: '+966 50 123 4567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    address: 'الرياض، حي النخيل، شارع الملك فهد'
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">الملف الشخصي</h1>
            <p className="text-foreground/70">إدارة معلوماتك الشخصية</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-lg p-8 mb-6"
          >
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <img
                  src={mockProfile.avatar}
                  alt={mockProfile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                />
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{mockProfile.name}</h2>
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <p className="font-semibold text-foreground">{mockProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground mb-1">رقم الجوال</p>
                  <p className="font-semibold text-foreground">{mockProfile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground mb-1">العنوان</p>
                  <p className="font-semibold text-foreground">{mockProfile.address}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8">
              <UnifiedButton className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6">
                تعديل المعلومات
              </UnifiedButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
