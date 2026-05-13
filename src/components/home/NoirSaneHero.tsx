import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Hand,
  Gem,
  Heart,
  ArrowRight,
} from "lucide-react";
import ChocolateGlobe from "@/components/ChocolateGlobe";

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex min-w-[210px] items-start gap-3 rounded-sm border border-[#9a6736]/20 bg-[#120804]/35 p-4 backdrop-blur-sm transition hover:border-[#d7a85f]/35 sm:min-w-0 lg:border-0 lg:border-r lg:bg-transparent lg:p-0 lg:pr-5 lg:last:border-r-0">
      <div className="mt-1 shrink-0 text-[#d4a15c] transition-transform duration-300 group-hover:-translate-y-1">
        {icon}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7a85f]">
          {title}
        </h3>
        <p className="mt-2 max-w-[210px] text-sm leading-relaxed text-[#bda48d]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function NoirSaneHero() {
  const navigate = useNavigate();

  const openCollection = () => {
    navigate("/shop");
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#0b0503] text-[#f8eadc]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(168,82,27,0.38),transparent_32%),radial-gradient(circle_at_18%_44%,rgba(87,35,12,0.42),transparent_36%),linear-gradient(105deg,#0c0503_0%,#201008_42%,#0a0503_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_56%,rgba(214,147,65,0.14),transparent_22%),linear-gradient(90deg,rgba(0,0,0,0.25),transparent_48%,rgba(0,0,0,0.12))]" />

      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="pointer-events-none absolute left-[49%] top-[50%] hidden h-[1px] w-[42vw] -translate-x-1/2 rotate-[-8deg] bg-gradient-to-r from-transparent via-[#d7a85f]/45 to-transparent lg:block" />
      <div className="pointer-events-none absolute left-[62%] top-[54%] hidden h-[28vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b77730]/18 lg:block" />
      <div className="pointer-events-none absolute left-[63%] top-[56%] hidden h-[18vw] w-[46vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b77730]/10 lg:block" />

      <div className="absolute right-[-12vw] top-[8vh] hidden h-[74vw] max-h-[930px] w-[74vw] max-w-[930px] rounded-full border border-[#a26d38]/10 lg:block" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1780px] flex-col px-4 pt-16 sm:px-8 lg:px-16 lg:pt-24">
        <div className="grid flex-1 items-center gap-3 pb-5 pt-8 sm:gap-6 sm:pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:pb-0 lg:pt-0">
          <div className="relative z-20 max-w-3xl text-center sm:text-left lg:pl-8">
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.38em] text-[#c38a46] sm:mb-6 sm:text-sm sm:tracking-[0.48em]">
              Maison de Chocolat
            </p>

            <h2 className="font-serif text-[clamp(3.35rem,18vw,5rem)] leading-[0.92] tracking-[-0.025em] text-[#fff1e4] sm:text-[6rem] lg:text-[6.35rem] xl:text-[7rem] 2xl:text-[7.5rem]">
              A world cast in{" "}
              <span className="italic text-[#d7a85f]">cocoa</span> & gold.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#c8b5a4] sm:mx-0 sm:mt-8 sm:text-xl">
              Single-origin beans, atelier-finished by hand. Created for
              moments worth savouring.
            </p>

            <div className="mx-auto mt-7 flex max-w-sm flex-col gap-3 sm:mx-0 sm:mt-10 sm:max-w-none sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={openCollection}
                className="group inline-flex h-14 items-center justify-center gap-4 rounded-sm bg-gradient-to-r from-[#e6b66f] to-[#b97a38] px-6 text-xs font-bold uppercase tracking-[0.2em] text-[#1a0a04] shadow-[0_20px_55px_rgba(190,116,45,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(190,116,45,0.42)] sm:h-16 sm:px-9 sm:text-sm sm:tracking-[0.25em]"
              >
                Explore Collection
                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <Link
                to="/shop"
                className="inline-flex h-14 items-center justify-center rounded-sm border border-[#d7a85f]/35 px-6 text-xs font-bold uppercase tracking-[0.2em] text-[#f7e8d8] transition hover:border-[#d7a85f] hover:bg-[#d7a85f]/10 sm:h-16 sm:px-9 sm:text-sm sm:tracking-[0.25em]"
              >
                Our Atelier
              </Link>
            </div>
          </div>

          <div className="relative z-10 -mx-2 -mt-2 sm:-mx-4 lg:absolute lg:right-[1vw] lg:top-[13vh] lg:mx-0 lg:mt-0 lg:w-[52vw] xl:right-[3vw] xl:w-[50vw] 2xl:w-[47vw]">
            <ChocolateGlobe
              onClick={openCollection}
              className="lg:h-[min(58vw,720px)] xl:h-[min(54vw,740px)]"
            />
          </div>
        </div>

        <div className="relative z-20 -mx-4 flex gap-3 overflow-x-auto border-t border-[#d7a85f]/10 px-4 py-5 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:py-8 lg:grid-cols-4 lg:max-w-[1180px] lg:pl-8 [&::-webkit-scrollbar]:hidden">
          <FeatureItem
            icon={<Leaf size={34} strokeWidth={1.4} />}
            title="Single Origin"
            description="Ethically sourced fine cacao from selected estates."
          />

          <FeatureItem
            icon={<Hand size={34} strokeWidth={1.4} />}
            title="Handcrafted"
            description="Atelier-finished by skilled chocolate makers."
          />

          <FeatureItem
            icon={<Gem size={34} strokeWidth={1.4} />}
            title="Premium Quality"
            description="Fine ingredients, slow process, no compromises."
          />

          <FeatureItem
            icon={<Heart size={34} strokeWidth={1.4} />}
            title="Made With Love"
            description="Crafted to create elegant gifting moments."
          />
        </div>
      </div>
    </section>
  );
}
