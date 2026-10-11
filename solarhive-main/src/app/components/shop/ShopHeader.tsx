const ShopHeader = () => {
  return (
    <div className="mx-10 mt-6 rounded-3xl bg-black/[0.03] px-6 py-14 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Shop <span className="text-leaf">everything</span>
      </h1>
      <p className="mt-3 text-sm text-black/50">
        Home <span className="text-gold">/</span> Shop
      </p>
    </div>
  );
};

export default ShopHeader;
