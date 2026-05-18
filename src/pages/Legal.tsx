import { PageShell, SectionHeading } from "@/components/luxury/LuxuryPrimitives";

type LegalProps = {
  type: "privacy" | "terms";
};

export default function Legal({ type }: LegalProps) {
  const isPrivacy = type === "privacy";

  return (
    <PageShell>
      <section className="container pt-28 pb-24 sm:pt-36">
        <SectionHeading
          eyebrow={isPrivacy ? "Privacy Policy" : "Terms"}
          title={isPrivacy ? "Your trust matters" : "A clear gifting experience"}
          accent={isPrivacy ? "at Noir Sane." : "from cart to delivery."}
          description={
            isPrivacy
              ? "Noir Sane uses account, order, address, and payment-status information only to support shopping, checkout, delivery, order tracking, and customer care."
              : "By ordering from Noir Sane, you agree to provide accurate checkout details, complete payment through the available methods, and use order tracking for delivery updates."
          }
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {(isPrivacy
            ? [
                ["Orders", "We use your order details to prepare chocolate selections, verify payment, and support delivery tracking."],
                ["Accounts", "Your account helps manage cart, checkout, addresses, order history, and support requests."],
                ["Support", "Messages sent to Noir Sane are used to respond to orders, gifting requests, collaborations, and care questions."],
              ]
            : [
                ["Products", "Product availability, stock, pricing, and categories are managed through the Noir Sane ecommerce system."],
                ["Payment", "UPI payment and verification details support secure checkout and order confirmation."],
                ["Delivery", "Order and delivery tracking help keep customers updated from checkout to final handoff."],
              ]
          ).map(([title, text]) => (
            <div key={title} className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-6">
              <h2 className="font-serif text-2xl text-[#f8eadc]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#c8b5a4]">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
