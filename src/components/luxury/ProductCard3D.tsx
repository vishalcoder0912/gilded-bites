import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCard3DProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images?: string[];
    imageUrls?: string[];
    description?: string | null;
    shortDescription?: string | null;
    inStock?: boolean;
    isFeatured?: boolean;
    isBestseller?: boolean;
  };
  index?: number;
  className?: string;
}

function displayPrice(value: number) {
  const rupees = value > 10000 ? value / 100 : value;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export default function ProductCard3D({
  product,
  index = 0,
  className = "",
}: ProductCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoved, setIsLoved] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 260, damping: 22 });
  const ySpring = useSpring(y, { stiffness: 260, damping: 22 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-10, 10]);

  const imageUrl =
    product.images?.[0] ||
    product.imageUrls?.[0] ||
    "/placeholder.svg";

  const description =
    product.shortDescription ||
    product.description ||
    "Premium dark chocolate crafted for slow luxury.";

  const hasBadge = product.isFeatured || product.isBestseller;

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      x.set((event.clientX - centerX) / rect.width);
      y.set((event.clientY - centerY) / rect.height);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.72,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn("group perspective-1000", className)}
    >
      <div className="relative overflow-hidden rounded-[1.6rem] border border-[#d7a85f]/18 bg-[#100604]/85 shadow-[0_30px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(215,168,95,0.22),transparent_42%)] opacity-70" />

        {hasBadge && (
          <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-[#d7a85f]/25 bg-[#070302]/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#d7a85f] backdrop-blur">
            <Star className="h-3 w-3 fill-[#d7a85f]" />
            {product.isBestseller ? "Bestseller" : "Featured"}
          </div>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            setIsLoved((value) => !value);
          }}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-[#d7a85f]/20 bg-[#070302]/70 text-[#f8eadc] backdrop-blur transition hover:border-[#d7a85f]/50"
          aria-label="Add to wishlist"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition",
              isLoved && "fill-[#d7a85f] text-[#d7a85f]"
            )}
          />
        </button>

        <Link to={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden">
            <motion.img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
              style={{
                transform: isHovered ? "translateZ(34px)" : "translateZ(0px)",
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#070302] via-[#070302]/16 to-transparent" />

            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 16 }}
              transition={{ duration: 0.28 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d7a85f] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#090403] shadow-[0_0_35px_rgba(215,168,95,0.28)]">
                <ShoppingBag className="h-4 w-4" />
                View Product
              </div>
            </motion.div>
          </div>

          <div className="relative p-5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#d7a85f]">
              Noir Sane
            </p>

            <h3 className="font-serif text-2xl leading-tight text-[#f8eadc]">
              {product.name}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#bca895]">
              {description}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-serif text-2xl text-[#d7a85f]">
                {displayPrice(product.price)}
              </span>

              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8f7862]">
                {product.inStock === false ? "Sold Out" : "Available"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
