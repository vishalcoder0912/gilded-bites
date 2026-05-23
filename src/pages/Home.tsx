import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  Heart,
  Leaf,
  Moon,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden bg-transparent text-[#f8eadc]">
      <section className="relative flex min-h-screen items-center px-6 pt-28 md:px-16">
        <div className="max-w-4xl">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.8 }}
            className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.42em] text-[#d7a85f]"
          >
            <Sparkles size={15} /> Wholesome Bites, Delightful Nights
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.9, delay: 0.12 }}
            className="font-serif text-6xl leading-[0.88] tracking-tight md:text-8xl lg:text-9xl"
          >
            Premium Dark <br />
            <span className="italic text-[#d7a85f]">Chocolate Rituals.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.9, delay: 0.22 }}
            className="mt-8 max-w-2xl text-base leading-8 text-[#c8b5a4] md:text-lg"
          >
            Noir Sane crafts fruit-filled dark chocolates for gifting, mindful
            indulgence, calm evenings, and mood-lifting moments.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.9, delay: 0.34 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-[#d7a85f] px-7 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#090403] transition hover:scale-105"
            >
              Explore Chocolates
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center rounded-full border border-[#d7a85f]/35 px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#f8eadc] transition hover:bg-[#d7a85f]/10"
            >
              Our Story
            </Link>
          </motion.div>
        </div>
      </section>

      <Section>
        <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.36em] text-[#d7a85f]">
          <Sparkles size={14} /> The Noir Sane Ritual
        </p>

        <h2 className="max-w-4xl font-serif text-4xl leading-tight md:text-6xl">
          Chocolate made for calm, glow, gifting, and delightful nights.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Heart />}
            title="Mood Elevation"
            desc="Rich dark chocolate crafted for feel-good rituals, joy, emotional balance, and mindful pleasure."
          />
          <Feature
            icon={<Leaf />}
            title="Fruit-Filled Indulgence"
            desc="Natural fruit-inspired fillings meet smooth cacao for a glossy, layered, premium bite."
          />
          <Feature
            icon={<Moon />}
            title="Evening Calm"
            desc="A refined chocolate experience made for stress relief, slow moments, and peaceful nights."
          />
        </div>
      </Section>

      <section className="relative px-6 py-24 md:px-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={fadeUp}
          transition={{ duration: 0.85 }}
          className="mx-auto max-w-6xl rounded-[3rem] border border-[#d7a85f]/20 bg-[#100604]/70 p-8 backdrop-blur-xl md:p-12"
        >
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.36em] text-[#d7a85f]">
                <Gift size={14} /> Signature Collection
              </p>
              <h2 className="font-serif text-4xl leading-tight md:text-6xl">
                Fruit-filled dark chocolate, made for premium gifting.
              </h2>
            </div>

            <p className="text-sm leading-8 text-[#c8b5a4] md:text-base">
              From apple, orange, mango, grape, pineapple, and pomegranate
              inspired notes, Noir Sane turns chocolate into a sensory story.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <CollectionCard title="Noir Fruit Chocolates" desc="Dark chocolate paired with natural fruit-pulp jelly." />
            <CollectionCard title="Mood Ritual Bites" desc="A mindful chocolate ritual for calm, joy, and balance." />
            <CollectionCard title="Glow & Energy Collection" desc="Rich cacao crafted for daily indulgence and inner radiance." />
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 rounded-full bg-[#f8eadc] px-7 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#050201] transition hover:scale-105"
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          <MiniCard icon={<Zap />} title="Energy" text="A rich cacao bite for your daily reset." />
          <MiniCard icon={<Heart />} title="Emotion" text="Crafted around mood, joy, and mindful living." />
          <MiniCard icon={<Gift />} title="Gifting" text="Elegant chocolate boxes for modern celebrations." />
        </div>
      </Section>

      <section className="relative px-6 py-28 text-center md:px-16">
        <p className="mb-5 text-xs uppercase tracking-[0.36em] text-[#d7a85f]">
          Calm in a Bite
        </p>
        <h2 className="mx-auto max-w-4xl font-serif text-5xl leading-tight md:text-7xl">
          A chocolate experience for delightful nights.
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#c8b5a4]">
          Discover Noir Sane - premium dark chocolate crafted for taste,
          emotion, gifting, and everyday mindful indulgence.
        </p>
      </section>
    </main>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative px-6 py-24 md:px-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={fadeUp}
        transition={{ duration: 0.85 }}
        className="mx-auto max-w-6xl"
      >
        {children}
      </motion.div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-[2rem] border border-[#d7a85f]/15 bg-[#100604]/60 p-7 backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-[#d7a85f]/45">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#d7a85f]/15 text-[#d7a85f]">
        {icon}
      </div>
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[#c8b5a4]">{desc}</p>
    </div>
  );
}

function CollectionCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[2rem] border border-[#d7a85f]/15 bg-[#050201]/55 p-6 transition duration-500 hover:-translate-y-2 hover:border-[#d7a85f]/45">
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[#c8b5a4]">{desc}</p>
    </div>
  );
}

function MiniCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-5 rounded-[2rem] border border-[#d7a85f]/15 bg-[#100604]/55 p-6 backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-[#d7a85f]/45">
      <div className="text-[#d7a85f]">{icon}</div>
      <div>
        <h3 className="font-serif text-xl">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#c8b5a4]">{text}</p>
      </div>
    </div>
  );
}
