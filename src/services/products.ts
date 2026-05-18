import truffle from "@/assets/product-truffle.jpg";
import bar from "@/assets/product-bar.jpg";
import praline from "@/assets/product-praline.jpg";
import bonbon from "@/assets/product-bonbon.jpg";
import caramel from "@/assets/product-caramel.jpg";
import origin from "@/assets/product-origin.jpg";

export type Category = "Fruit Chocolates" | "Truffles" | "Bars" | "Pralines" | "Bonbons" | "Single Origin";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  cocoa: number;
  weight: string;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "eclat-de-pommeraie",
    name: "Eclat de Pommeraie",
    tagline: "Apple jelly, dark chocolate",
    description:
      "Apple jelly, dark chocolate, and warm orchard caramel arranged into a glossy fruit-forward chocolate made for gifting.",
    price: 780,
    category: "Fruit Chocolates",
    image: bar,
    cocoa: 72,
    weight: "100g bar",
    featured: true,
  },
  {
    id: "soleil-secret",
    name: "Soleil Secret",
    tagline: "Orange citrus jelly",
    description:
      "Orange citrus jelly folded into bittersweet dark chocolate for a bright, elegant finish.",
    price: 760,
    category: "Fruit Chocolates",
    image: caramel,
    cocoa: 68,
    weight: "100g bar",
    featured: true,
  },
  {
    id: "mystere-daurore",
    name: "Mystere d'Aurore",
    tagline: "Mango jelly, tropical caramel",
    description:
      "Mango jelly and tropical caramel layered with premium dark chocolate for a cinematic, golden bite.",
    price: 820,
    category: "Fruit Chocolates",
    image: origin,
    cocoa: 65,
    weight: "100g bar",
    featured: true,
  },
  {
    id: "coeur-des-rubis",
    name: "Coeur des Rubis",
    tagline: "Pomegranate ruby centre",
    description:
      "Pomegranate jewels with a ruby fruit centre, wrapped in dark cocoa and made for celebratory gifting.",
    price: 860,
    category: "Fruit Chocolates",
    image: bonbon,
    cocoa: 70,
    weight: "150g box",
    featured: true,
  },
  {
    id: "la-symphonie-noire",
    name: "La Symphonie Noire",
    tagline: "Tropical fruit fusion",
    description:
      "Tropical fruit fusion over premium dark chocolate, layered for a vivid, indulgent Noir Sane signature.",
    price: 940,
    category: "Fruit Chocolates",
    image: truffle,
    cocoa: 72,
    weight: "120g bar",
    featured: true,
  },
  {
    id: "noir-gold-truffle",
    name: "Noir Gold Truffle",
    tagline: "Dark ganache, soft gold",
    description:
      "A deep cocoa truffle with smooth ganache, satin finish, and a restrained luxury feel.",
    price: 1290,
    category: "Truffles",
    image: praline,
    cocoa: 72,
    weight: "120g box",
  },
];

export const categories: ("All" | Category)[] = [
  "All",
  "Fruit Chocolates",
  "Truffles",
  "Bars",
  "Pralines",
  "Bonbons",
  "Single Origin",
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getFeatured = () => products.filter((p) => p.featured);

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
