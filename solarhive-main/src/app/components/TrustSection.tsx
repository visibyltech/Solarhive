import Image from "next/image";
import { Check } from "lucide-react";

const points = [
  "High-quality, reliable solar equipment",
  "Professional installation on every system",
  "Flexible payment plans — Buy Now Pay Later + Save to Buy",
];

const TrustSection = () => {
  return (
    <div className="mx-10 mt-16 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
      <div className="relative aspect-4/3 overflow-hidden rounded-3xl">
        <Image
          src="/solarhive/products/residential-rooftop-close.jpg"
          alt="Solar panels installed on a residential roof"
          fill
          className="object-cover"
        />
      </div>

      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Your power. <span className="text-leaf">Our priority.</span>
        </h2>
        <p className="mt-4 text-black/60">
          At Solar Hive, every system — residential, commercial, or
          agricultural — is professionally installed and backed by real
          support, so you can switch to solar with confidence.
        </p>

        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-black/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrustSection;
