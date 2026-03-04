import HeroSection from "~/components/sections/hero-section";
import FeaturesSection from "~/components/sections/features-section";
import HowItWorksSection from "~/components/sections/how-it-works-section";
import MapViewSection from "~/components/sections/map-view-section";
import BenefitsSection from "~/components/sections/benefits-section";
import TestimonialsSection from "~/components/sections/testimonials-section";
import PartnersSection from "~/components/sections/partners-section";
import Navbar from "~/components/layout/navbar";
import Footer from "~/components/layout/footer";

export default function Home() {
  return (
    <main className="relative bg-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <BenefitsSection />
      <MapViewSection />
      <PartnersSection />
      <Footer />
    </main>
  );
}
