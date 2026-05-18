import ScrollReveal from "./ScrollReveal";

const reasons = [
  "Premium dark chocolate",
  "Fruit-jelly inspired fillings",
  "Elegant gifting experience",
  "Small-batch luxury feel",
  "Made for modern chocolate lovers",
];

export default function BrandStory() {
  return (
    <section className="relative z-20 overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,168,95,0.08),transparent_70%)]" />

      <div className="container relative">
        <ScrollReveal direction="up" delay={0.1} className="mx-auto mb-12 max-w-4xl text-center lg:mb-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-[#d7a85f] sm:text-sm">
            Why Noir Sane
          </p>
          <h2 className="font-serif text-4xl leading-tight text-[#f8eadc] sm:text-5xl lg:text-6xl">
            Dark chocolate with a{" "}
            <span className="italic text-[#d7a85f]">brighter centre.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#c8b5a4]">
            Noir Sane blends dark cocoa, vivid fruit, glossy jelly notes, and polished
            presentation into chocolates made for mindful indulgence and memorable gifting.
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((reason, index) => (
            <ScrollReveal
              key={reason}
              direction="up"
              delay={0.15 + index * 0.06}
            >
              <div className="h-full rounded-sm border border-[#d7a85f]/18 bg-[#140904]/72 p-6 text-center">
                <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-full border border-[#d7a85f]/30 text-[#d7a85f]">
                  <span className="font-serif text-lg">{index + 1}</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f0c27a]">
                  {reason}
                </h3>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
