import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { Leaf, ShoppingBasket } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  index: number;
  onOrder: (product: Product) => void;
}

function getStockBadge(stock: number) {
  if (stock === 0)
    return { label: "Out of Stock", variant: "destructive" as const };
  if (stock <= 5) return { label: "Low Stock", variant: "secondary" as const };
  return { label: "In Stock", variant: "default" as const };
}

export function ProductCard({ product, index, onOrder }: ProductCardProps) {
  const stockBadge = getStockBadge(product.stock);
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      data-ocid={`product.item.${index}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Product image */}
      <div className="relative overflow-hidden aspect-[3/2] bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Stock badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={stockBadge.variant}
            className={
              stockBadge.label === "In Stock"
                ? "bg-primary/90 text-primary-foreground border-0 text-xs font-semibold backdrop-blur-sm"
                : stockBadge.label === "Low Stock"
                  ? "bg-accent/90 text-accent-foreground border-0 text-xs font-semibold backdrop-blur-sm"
                  : "bg-destructive/90 text-destructive-foreground border-0 text-xs font-semibold backdrop-blur-sm"
            }
          >
            {stockBadge.label}
          </Badge>
        </div>

        {/* Leaf icon decoration */}
        <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm">
          <Leaf className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      {/* Card content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div>
            <span className="text-xl font-display font-bold text-primary">
              R{product.price}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {product.unit}
            </span>
          </div>
          <Button
            data-ocid={`product.order_button.${index}`}
            size="sm"
            disabled={isOutOfStock}
            onClick={() => onOrder(product)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <ShoppingBasket className="w-3.5 h-3.5" />
            Order Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
