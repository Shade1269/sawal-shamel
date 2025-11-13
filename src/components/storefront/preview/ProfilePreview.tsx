import { motion } from 'framer-motion';
import { User, Phone, MapPin, Mail, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <img
                  src={mockProfile.avatar}
                  alt={mockProfile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{mockProfile.name}</h2>
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                  <p className="font-semibold text-gray-900">{mockProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 mb-1">رقم الجوال</p>
                  <p className="font-semibold text-gray-900">{mockProfile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 mb-1">العنوان</p>
                  <p className="font-semibold text-gray-900">{mockProfile.address}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-6">
                تعديل المعلومات
              </Button>
              <Button variant="outline" className="flex-1 border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-6">
                تغيير كلمة المرور
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
