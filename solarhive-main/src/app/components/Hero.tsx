import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Leaf, Wallet, ShieldCheck } from "lucide-react";

const categories = [
  { name: "Solar Package", slug: "solar-package" },
  { name: "Inverters", slug: "inverters" },
  { name: "Batteries", slug: "batteries" },
  { name: "Charge Controllers", slug: "charge-controllers" },
  { name: "Panels", slug: "panels" },
  { name: "Accessories", slug: "accessories" },
];

const features = [
  { icon: Leaf, label: "Clean Energy" },
  { icon: Wallet, label: "Save Money" },
  { icon: ShieldCheck, label: "Energy Independence" },
];

const Hero = () => {
  return (
    <div className="px-6 pt-6 md:px-10">
      <section className="relative overflow-hidden rounded-3xl">
        <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9]">
          <Image
            src="/solarhive/products/residential-rooftop-scenic.jpg"
            alt="Solar panels on a residential roof overlooking the city"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
          <p className="text-xs font-semibold tracking-[0.3em] text-leaf uppercase">
            Switch to Solar. Live Better.
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.05] font-semibold text-white md:text-5xl lg:text-6xl">
            Get solar now.
            <br />
            Pay over time.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/75 md:text-base">
            Clean, reliable, affordable solar energy for your home, business,
            or farm — with Buy Now Pay Later and Save to Buy options that fit
            your budget.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-md bg-leaf px-7 py-3 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-leaf-dark"
            >
              Shop Now
            </Link>
            <a
              href="https://wa.me/2348027250668"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase backdrop-blur-sm transition hover:border-white hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-black/80 transition hover:border-gold hover:text-gold"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-3xl bg-black/[0.03] px-6 py-6 sm:grid-cols-3 md:px-10">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0 text-leaf" />
            <p className="text-xs font-medium tracking-wide text-black/70">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
