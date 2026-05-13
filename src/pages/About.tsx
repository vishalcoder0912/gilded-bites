import { Link } from "react-router-dom";
import { Award, Flame, Leaf, Sparkles } from "lucide-react";
import { PageShell, SectionHeading } from "@/components/luxury/LuxuryPrimitives";
import productPraline from "@/assets/product-praline.jpg";
import productBar from "@/assets/product-bar.jpg";

const stats = [
  ["1899", "Founded"],
  ["125+", "Years of craft"],
  ["28", "Origin estates"],
  ["50K+", "Happy customers"],
];

const process = [
  { icon: Leaf, title: "Origin", text: "Cacao chosen from estates with character and care." },
  { icon: Flame, title: "Roast", text: "Gentle roasting reveals layered chocolate notes." },
  { icon: Award, title: "Finish", text: "Each piece is polished, inspected, and wrapped by hand." },
  { icon: Sparkles, title: "Gift", text: "Designed for quiet luxury and lasting memory." },
];

export default function About() {
  return (
    <PageShell>
      <section className="container pt-28 pb-20 sm:pt-36">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="The Maison"
              title="Our story is written in"
              accent="cocoa & passion."
              description="Noir Sane began as a small atelier devoted to the patient art of chocolate. Today, every creation still carries that same human rhythm: selection, roasting, refining, finishing, and gifting."
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
          <SectionHeading eyebrow="Atelier" title="The art behind" accent="every creation." centered />
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
