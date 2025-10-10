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
    <div className="card p-3 hover:scale-[1.01] transition">
      <div className="aspect-square rounded-xl overflow-hidden bg-black/20">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-medium">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-semibold">{product.price.toFixed(2)} ر.س</span>
          {discount > 0 && (
            <>
              <span className="line-through text-muted-foreground">
                {product.price_compare?.toFixed(2)} ر.س
              </span>
              <span className="badge-discount">-{discount}%</span>
            </>
          )}
        </div>
        {product.rating && product.rating > 0 && (
          <div className="mt-1 text-amber-500" aria-label={`تقييم ${product.rating} من 5`}>
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
          </div>
        )}
        <button
          className="btn-primary w-full mt-3 rounded-xl py-2.5"
          onClick={() => onAdd(product.id, product.price)}
        >
          أضف للسلة
        </button>
      </div>
    </div>
  );
}
