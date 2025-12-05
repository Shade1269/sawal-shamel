type Props = {
  product: {
    id: string;
    name: string;
    image?: string;
    price: number;
    price_compare?: number;
    rating?: number;
  };
  onAdd: (id: string, price: number) => void;
};

export default function ProductCard({ product, onAdd }: Props) {
  const discount =
    product.price_compare && product.price_compare > product.price
      ? Math.round((1 - product.price / (product.price_compare ?? product.price)) * 100)
      : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-3 hover:shadow-[0_8px_40px_rgba(90,38,71,0.1)] hover:border-primary/20 transition-all duration-300">
      <div className="aspect-square rounded-lg overflow-hidden bg-secondary/30">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-foreground">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">{product.price.toFixed(2)} ر.س</span>
          {discount > 0 && (
            <>
              <span className="line-through text-muted-foreground text-sm">
                {product.price_compare?.toFixed(2)} ر.س
              </span>
              <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-semibold">-{discount}%</span>
            </>
          )}
        </div>
        {product.rating && product.rating > 0 && (
          <div className="mt-1 text-accent" aria-label={`تقييم ${product.rating} من 5`}>
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
          </div>
        )}
        <button
          className="w-full mt-3 rounded-lg py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          onClick={() => onAdd(product.id, product.price)}
        >
          أضف للسلة
        </button>
      </div>
    </div>
  );
}
