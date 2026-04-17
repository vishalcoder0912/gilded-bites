import truffle from "@/assets/product-truffle.jpg";
import bar from "@/assets/product-bar.jpg";
import praline from "@/assets/product-praline.jpg";
import bonbon from "@/assets/product-bonbon.jpg";
import caramel from "@/assets/product-caramel.jpg";
import origin from "@/assets/product-origin.jpg";

export type Category = "Truffles" | "Bars" | "Pralines" | "Bonbons" | "Single Origin";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // INR
  category: Category;
  image: string;
  cocoa: number;
  weight: string;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "noir-truffle",
    name: "Noir Gold Truffle",
    tagline: "24-karat indulgence",
    description:
      "A whisper-thin shell of 72% Venezuelan dark chocolate cradles a velvet ganache, crowned with edible 24k gold leaf.",
    price: 1290,
    category: "Truffles",
    image: truffle,
    cocoa: 72,
    weight: "120g · 6 pieces",
    featured: true,
  },
  {
    id: "hazelnut-bar",
    name: "Piedmont Hazelnut Bar",
    tagline: "Roasted, crushed, layered",
    description:
      "Slow-conched dark chocolate folded with caramelised Piedmont hazelnuts. A study in restraint and crunch.",
    price: 690,
    category: "Bars",
    image: bar,
    cocoa: 68,
    weight: "100g bar",
    featured: true,
  },
  {
    id: "maison-praline",
    name: "Maison Praline Coffret",
    tagline: "The signature collection",
    description:
      "Twelve hand-finished pralines arranged in our signature coffret — a curated journey through our atelier's craft.",
    price: 2450,
    category: "Pralines",
    image: praline,
    cocoa: 65,
    weight: "240g · 12 pieces",
    featured: true,
  },
  {
    id: "rose-bonbon",
    name: "Rose Raspberry Bonbon",
    tagline: "White chocolate, ruby heart",
    description:
      "Silken white chocolate bonbons with a molten raspberry-rose centre. Floral, tart, decadent.",
    price: 1490,
    category: "Bonbons",
    image: bonbon,
    cocoa: 32,
    weight: "150g · 8 pieces",
  },
  {
    id: "salted-caramel",
    name: "Fleur de Sel Caramel",
    tagline: "Sweet meets storm",
    description:
      "Buttery caramel layered between milk chocolate and finished with hand-harvested fleur de sel.",
    price: 890,
    category: "Bars",
    image: caramel,
    cocoa: 45,
    weight: "120g · 9 squares",
  },
  {
    id: "madagascar-origin",
    name: "Madagascar 78%",
    tagline: "Single origin, single estate",
    description:
      "Bright, fruity, unmistakable. A single-estate bar from the Sambirano Valley, with notes of red berries and citrus.",
    price: 990,
    category: "Single Origin",
    image: origin,
    cocoa: 78,
    weight: "85g bar",
  },
];

export const categories: ("All" | Category)[] = [
  "All",
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
