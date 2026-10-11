import CategoriesSection from "./components/CategoriesSection";
import NewArrivalsSection from "./components/NewArrivalsSection";
import Hero from "./components/Hero";
import QualityGrid from "./components/QualityGrid";
import SpecialOffersSection from "./components/SpecialOffersSection";
import TrustSection from "./components/TrustSection";

export default function Home() {
  return (
    <div className="pb-16">
      <Hero />
      <CategoriesSection />
      <NewArrivalsSection />
      <TrustSection />
      <QualityGrid />
      <SpecialOffersSection />
    </div>
  );
}
