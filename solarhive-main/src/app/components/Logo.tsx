import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  withTagline?: boolean;
  className?: string;
};

const Logo = ({ withTagline = false, className = "" }: LogoProps) => {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative h-10 w-10 shrink-0">
        <Image src="/solarhive/logo.jpg" alt="Solar Hive" fill className="object-contain" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-[0.15em] uppercase">
          Solar <span className="text-leaf">Hive</span>
        </span>
        {withTagline && (
          <span className="mt-1.5 text-[10px] tracking-widest text-black/50">
            Affordable Solar. Flexible Payments.
          </span>
        )}
      </span>
    </Link>
  );
};

export default Logo;
