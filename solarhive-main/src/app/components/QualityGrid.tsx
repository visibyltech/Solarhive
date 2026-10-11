import Image from "next/image";

const QualityGrid = () => {
  return (
    <div className="mx-10 mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="relative h-100 overflow-hidden rounded-3xl md:h-auto">
        <Image
          src="/solarhive/products/commercial-rooftop-aerial.jpg"
          alt="Commercial rooftop solar array"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <p className="font-display absolute bottom-8 left-8 max-w-sm text-2xl font-semibold text-white md:text-3xl">
          Solar energy for a brighter tomorrow
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative h-48 overflow-hidden rounded-3xl">
          <Image
            src="/solarhive/products/agricultural-farm-barn.jpg"
            alt="Solar panels on a farm building"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative h-48 overflow-hidden rounded-3xl">
          <Image
            src="/solarhive/products/mounting-rail-kit.jpg"
            alt="Solar mounting rail and accessories"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative col-span-2 h-48 overflow-hidden rounded-3xl">
          <Image
            src="/solarhive/products/inverter-battery-stack.jpg"
            alt="Solar inverter and battery installation"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default QualityGrid;
