import { useMemo, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { getProductImageCandidates, type Product } from "@/lib/api";

type ProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  product: Product;
};

const ProductImage = ({ product, alt, onError, ...props }: ProductImageProps) => {
  const candidates = useMemo(() => getProductImageCandidates(product), [product]);
  const [index, setIndex] = useState(0);

  return (
    <img
      {...props}
      src={candidates[index] || "/placeholder.svg"}
      alt={alt || product.name}
      onError={(event) => {
        if (index < candidates.length - 1) {
          setIndex(index + 1);
          return;
        }

        onError?.(event);
      }}
    />
  );
};

export default ProductImage;
