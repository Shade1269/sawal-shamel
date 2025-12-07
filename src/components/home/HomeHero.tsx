import { motion } from 'framer-motion';

export const HomeHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center mb-20"
    >
      {/* Minimal Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-anaqati-pink-light border border-primary/20"
      >
        <span className="w-2 h-2 bg-anaqati-success rounded-full animate-pulse" />
        <span className="text-sm font-medium text-primary">منصة حية</span>
      </motion.div>

      {/* Main Title - Clean Typography */}
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-anaqati-text">
        منية أناقتي
      </h1>
      
      <p className="text-2xl md:text-3xl font-light mb-8 text-primary">
        للأزياء والموضة
      </p>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-anaqati-text-secondary max-w-2xl mx-auto leading-relaxed mb-12">
        تجربة تسوق راقية وأنيقة مع أفضل المنتجات والخدمات
      </p>

      {/* Stats - Minimal Design */}
      <div className="flex items-center justify-center gap-8 md:gap-12">
        <StatItem value="152+" label="منتج" />
        <div className="w-px h-8 bg-anaqati-border" />
        <StatItem value="25+" label="مستخدم" />
        <div className="w-px h-8 bg-anaqati-border" />
        <StatItem value="7" label="متجر" />
      </div>
    </motion.div>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-2xl md:text-3xl font-semibold text-anaqati-text">{value}</div>
    <div className="text-sm text-anaqati-text-secondary">{label}</div>
  </div>
);
