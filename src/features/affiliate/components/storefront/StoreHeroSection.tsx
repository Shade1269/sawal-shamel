import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface StoreHeroSectionProps {
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroDescription?: string | null;
  heroImageUrl?: string | null;
  heroCtaText?: string | null;
  heroCtaColor?: string | null;
}

export const StoreHeroSection = ({
  heroTitle,
  heroSubtitle,
  heroDescription,
  heroImageUrl,
  heroCtaText,
  heroCtaColor
}: StoreHeroSectionProps) => {
  if (!heroTitle && !heroImageUrl) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl mb-8 md:mb-12"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-subtle" />
        )}
        <div className="absolute inset-0 gradient-fade-down backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 py-20 px-8 text-center space-y-6">
        {heroTitle && (
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
            {heroTitle}
          </h2>
        )}
        
        {heroSubtitle && (
          <p className="text-xl md:text-2xl font-medium text-foreground/90 max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
        )}
        
        {heroDescription && (
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
        )}

        {heroCtaText && (
          <Button
            size="lg"
            variant={heroCtaColor as any}
            className="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform"
            onClick={() => {
              const productsSection = document.getElementById('products-section');
              productsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {heroCtaText}
            <ArrowRight className="mr-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </motion.section>
  );
};
