import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, MapPin } from 'lucide-react';

export const OrdersPreview = () => {
  const mockOrders = [
    {
      id: '#12345',
      date: '2024-01-15',
      status: 'تم التوصيل',
      total: 599,
      items: 3,
      statusColor: 'bg-success/20 text-success',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop'
    },
    {
      id: '#12344',
      date: '2024-01-10',
      status: 'قيد التوصيل',
      total: 349,
      items: 2,
      statusColor: 'bg-info/20 text-info',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop'
    },
    {
      id: '#12343',
      date: '2024-01-05',
      status: 'تم التوصيل',
      total: 899,
      items: 4,
      statusColor: 'bg-success/20 text-success',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop'
    }
  ];

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
            <h1 className="text-4xl font-bold text-foreground mb-2">طلباتي</h1>
            <p className="text-foreground/70">تتبع طلباتك السابقة والحالية</p>
          </motion.div>

          {/* Orders List */}
          <div className="space-y-6">
            {mockOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div className="text-right">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        طلب رقم {order.id}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{order.date}</span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${order.statusColor}`}>
                      {order.status}
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={order.image}
                        alt="Product"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 text-right">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-info/10 p-2 rounded-lg">
                            <Package className="w-5 h-5 text-info" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">عدد المنتجات</p>
                            <p className="font-bold text-foreground">{order.items} منتجات</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="bg-success/10 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">المجموع</p>
                            <p className="font-bold text-foreground">{order.total} ر.س</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-3">
                        <button className="flex-1 bg-info hover:bg-info/90 text-primary-foreground font-bold py-3 rounded-lg transition-colors">
                          تتبع الطلب
                        </button>
                        <button className="flex-1 border-2 border-border hover:bg-muted text-foreground font-bold py-3 rounded-lg transition-colors">
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State Message */}
          {mockOrders.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد طلبات بعد</h3>
              <p className="text-muted-foreground">ابدأ التسوق لإضافة طلباتك الأولى</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
