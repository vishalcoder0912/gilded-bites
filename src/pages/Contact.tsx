import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageShell, SectionHeading } from "@/components/luxury/LuxuryPrimitives";

const contactItems = [
  { icon: MapPin, title: "Store", text: "Noir Sane Atelier, Gwalior, India" },
  { icon: Mail, title: "Email", text: "care@noirsane.com" },
  { icon: Phone, title: "Phone", text: "+91 98765 43210" },
  { icon: Clock, title: "Hours", text: "Monday - Saturday, 10 AM - 8 PM" },
];

export default function Contact() {
  return (
    <PageShell>
      <section className="container pt-28 pb-24 sm:pt-36">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="We'd love to hear"
              accent="from you."
              description="For gifting, custom orders, delivery questions, or atelier visits, write to us and our team will respond with care."
            />
            <div className="mt-10 grid gap-4">
              {contactItems.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-5">
                  <item.icon className="mt-1 h-5 w-5 shrink-0 text-[#d9a35b]" />
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.24em] text-[#f0c27a]">{item.title}</h3>
                    <p className="mt-2 text-sm text-[#c8b5a4]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <input className="input-luxury" placeholder="Your Name" />
              <input className="input-luxury" type="email" placeholder="Email Address" />
              <input className="input-luxury sm:col-span-2" placeholder="Subject" />
              <textarea className="input-luxury min-h-[180px] sm:col-span-2" placeholder="Your Message" />
            </div>
            <button type="button" className="btn-gold mt-6 w-full">Send Message</button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
