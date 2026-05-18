import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    title: "Noir Fruit Chocolates",
    desc: "Dark chocolate paired with natural fruit pulp jelly.",
  },
  {
    title: "Mood Ritual Bites",
    desc: "A mindful chocolate ritual for calm, joy, and balance.",
  },
  {
    title: "Glow & Energy Collection",
    desc: "Rich cacao crafted for daily indulgence and inner radiance.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050201] text-[#f8eadc]">
      <section className="relative z-10 flex min-h-screen items-center px-6 pt-28 md:px-16">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.45em] text-[#d7a85f]"
          >
            <Sparkles size={15} /> Wholesome Bites, Delightful Nights
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="font-serif text-6xl leading-[0.9] tracking-tight md:text-8xl lg:text-9xl"
          >
            Dark Chocolate <br />
            <span className="italic text-[#d7a85f]">for your mood.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mt-8 max-w-2xl text-base leading-8 text-[#c8b5a4] md:text-lg"
          >
            NoirSane blends premium dark chocolate with fruit-forward indulgence,
            designed as a daily ritual for calm, joy, emotional balance, and
            mindful pleasure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-[#d7a85f] px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] text-[#090403] transition hover:scale-105"
            >
              Explore Chocolates
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center rounded-full border border-[#d7a85f]/30 px-7 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#f8eadc] transition hover:bg-[#d7a85f]/10"
            >
              Our Story
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#d7a85f]">
            The NoirSane Ritual
          </p>

          <h2 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Chocolate that feels like calm, glow, and emotional reset.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <Feature
              icon={<Heart />}
              title="Mood Elevation"
              desc="Dark chocolate supports feel-good rituals built around joy, balance, and emotional wellbeing."
            />
            <Feature
              icon={<Leaf />}
              title="Natural Indulgence"
              desc="Fruit pulp jelly and cacao create a clean, rich, and memorable chocolate experience."
            />
            <Feature
              icon={<ShieldCheck />}
              title="Daily Resilience"
              desc="A premium chocolate ritual for stress relief, inner glow, energy, and mindful living."
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 md:px-16">
        <div className="mx-auto max-w-6xl rounded-[3rem] border border-[#d7a85f]/20 bg-[#100604]/70 p-8 backdrop-blur-xl md:p-12">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#d7a85f]">
                Signature Collection
              </p>
              <h2 className="font-serif text-4xl leading-tight md:text-6xl">
                Fruit-filled dark chocolate, made for gifting.
              </h2>
            </div>

            <p className="text-sm leading-8 text-[#c8b5a4] md:text-base">
              From apple, orange, mango, grape, pineapple, and pomegranate
              inspired notes, NoirSane turns chocolate into a sensory story -
              rich, glossy, emotional, and premium.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {products.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-[#d7a85f]/15 bg-[#050201]/55 p-6 transition hover:-translate-y-2 hover:border-[#d7a85f]/45"
              >
                <h3 className="font-serif text-2xl text-[#f8eadc]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#c8b5a4]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#f8eadc] px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] text-[#050201]"
          >
            Shop Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="relative z-10 px-6 py-28 text-center md:px-16">
        <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#d7a85f]">
          Calm in a Bite
        </p>
        <h2 className="mx-auto max-w-4xl font-serif text-5xl leading-tight md:text-7xl">
          A chocolate experience for delightful nights.
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#c8b5a4]">
          Discover NoirSane - premium dark chocolate crafted for taste,
          emotion, gifting, and everyday mindful indulgence.
        </p>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[2rem] border border-[#d7a85f]/15 bg-[#100604]/65 p-7 backdrop-blur-md">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#d7a85f]/15 text-[#d7a85f]">
        {icon}
      </div>
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[#c8b5a4]">{desc}</p>
    </div>
  );
}
