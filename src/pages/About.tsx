import { Link } from "react-router-dom";
import { Award, Flame, Leaf, Sparkles } from "lucide-react";
import { PageShell, SectionHeading } from "@/components/luxury/LuxuryPrimitives";
import productPraline from "@/assets/product-praline.jpg";
import productBar from "@/assets/product-bar.jpg";

const stats = [
  ["Dark", "Cocoa-led"],
  ["Fruit", "Jelly centres"],
  ["Gift", "Presentation-first"],
  ["Ritual", "Slow indulgence"],
];

const process = [
  { icon: Leaf, title: "Dark Cocoa", text: "Premium chocolate gives each bite depth and restraint." },
  { icon: Flame, title: "Bright Fruit", text: "Fruit-jelly notes add colour, gloss, and natural contrast." },
  { icon: Award, title: "Smooth Filling", text: "Caramel and fruit centres create a soft, memorable finish." },
  { icon: Sparkles, title: "Elegant Gifting", text: "Every piece is designed to feel cinematic and considered." },
];

export default function About() {
  return (
    <PageShell>
      <section className="container pt-28 pb-20 sm:pt-36">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="About Noir Sane"
              title="A chocolate house built around"
              accent="contrast."
              description="Noir Sane is a premium chocolate house built around contrast: dark cocoa, bright fruit, smooth caramel, and elegant presentation. Our chocolates are designed to feel cinematic, indulgent, and memorable - perfect for gifting or slow personal rituals."
            />
            <Link to="/shop" className="btn-gold mt-8">Explore The Collection</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <img src={productPraline} alt="Chocolate craft" className="h-80 w-full rounded-sm border border-[#d9a35b]/18 object-cover sm:h-[460px]" />
            <img src={productBar} alt="Noir Sane creations" className="h-80 w-full rounded-sm border border-[#d9a35b]/18 object-cover sm:mt-16 sm:h-[460px]" />
          </div>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-6 text-center">
              <div className="font-serif text-5xl text-[#f0c27a]">{value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.24em] text-[#c8b5a4]">{label}</div>
            </div>
          ))}
        </div>

        <section className="mt-20">
          <SectionHeading eyebrow="Our Approach" title="Luxury that feels" accent="mindful." centered />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <div key={item.title} className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-6">
                <item.icon className="mb-5 h-6 w-6 text-[#d9a35b]" />
                <h3 className="font-serif text-2xl text-[#f8eadc]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#c8b5a4]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </PageShell>
  );
}
