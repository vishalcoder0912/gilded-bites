import { Link } from "react-router-dom";
import { Flame, Gem, Gift, Leaf, Sparkles, Wand2 } from "lucide-react";
import NoirSaneHero from "@/components/home/NoirSaneHero";
import ProductCard from "@/components/ProductCard";
import { EmptyState, LoadingState, SectionHeading } from "@/components/luxury/LuxuryPrimitives";
import { useProducts } from "@/store/catalog";
import productOrigin from "@/assets/product-origin.jpg";
import productTruffle from "@/assets/product-truffle.jpg";

const process = [
  { icon: Leaf, title: "Select", text: "Finest single-origin cacao beans." },
  { icon: Flame, title: "Roast", text: "Slow roasted to unlock depth." },
  { icon: Wand2, title: "Refine", text: "Conched until smooth and aromatic." },
  { icon: Sparkles, title: "Craft", text: "Hand-finished with precision." },
  { icon: Gift, title: "Create", text: "Chocolates that delight the soul." },
];

const Home = () => {
  const featured = useProducts({ limit: 4, sort: "featured" });
  const bestSellers = useProducts({ limit: 4, sort: "price_desc" });

  return (
    <main className="overflow-x-hidden bg-[#090403]">
      <NoirSaneHero />

      <section className="relative border-t border-[#d9a35b]/10 py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Featured Creations"
            title="Signature pieces for"
            accent="slow tasting."
            centered
          />

          <div className="mt-12">
            {featured.isLoading ? (
              <LoadingState />
            ) : featured.error ? (
              <EmptyState title="The collection is resting" description="We could not load the featured creations. Please try again in a moment." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featured.data?.data.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="about" className="relative py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(217,163,91,0.12),transparent_34%)]" />
        <div className="container relative grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Our Maison"
              title="Where passion meets"
              accent="precision."
              description="Since 1899, Noir Sane has been a celebration of fine cacao and French-inspired craftsmanship. Every chocolate is a piece of our heritage, curated with patience, perfected with passion."
            />
            <Link to="/about" className="btn-ghost-gold mt-8">
              Discover Our Story
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-sm border border-[#d9a35b]/18 bg-[#180c06]/65">
            <img src={productOrigin} alt="Noir Sane chocolate atelier" className="h-[360px] w-full object-cover opacity-90 sm:h-[460px]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090403]/70 via-transparent to-[#090403]/20" />
            <div className="absolute bottom-6 left-6 max-w-xs">
              <p className="eyebrow mb-2">Atelier Finished</p>
              <p className="font-serif text-3xl text-[#f8eadc]">Human hands, precise temperatures, patient craft.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="py-16 sm:py-24">
        <div className="container">
          <SectionHeading eyebrow="The Craft" title="From bean to bar, a journey" accent="of artistry." centered />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((step) => (
              <div key={step.title} className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/70 p-6 text-center transition hover:-translate-y-1 hover:border-[#d9a35b]/45">
                <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full border border-[#d9a35b]/30 text-[#d9a35b]">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0c27a]">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#c8b5a4]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container">
          <SectionHeading eyebrow="Best Sellers" title="Beloved by the" accent="maison." centered />
          <div className="mt-12">
            {bestSellers.isLoading ? (
              <LoadingState />
            ) : bestSellers.error ? (
              <EmptyState title="Best sellers are unavailable" description="The atelier could not load best sellers right now." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {bestSellers.data?.data.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="container">
          <div className="relative overflow-hidden rounded-sm border border-[#d9a35b]/22 bg-[#1a0b05] p-8 sm:p-12">
            <img src={productTruffle} alt="Noir Sane gifting collection" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090403] via-[#090403]/74 to-transparent" />
            <div className="relative max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9a35b]/25 bg-[#d9a35b]/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#f0c27a]">
                <Gem className="h-4 w-4" /> The Art of Gifting
              </div>
              <h2 className="font-serif text-4xl leading-tight text-[#f8eadc] sm:text-5xl">Make every moment unforgettable.</h2>
              <Link to="/shop" className="btn-gold mt-8">
                Explore Gift Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
