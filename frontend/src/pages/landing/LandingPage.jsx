import HeroSection from "./HeroSection";
import MetricsSection from "./MetricsSection";
import PinDeviceSection from "./PinDeviceSection";
import RolesSection from "./RolesSection";
import PlansSection from "./PlansSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import Navbar from "./Navbar";
import AboutFeaturesSection from "./AboutFeaturesSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <HeroSection />
      <Navbar />
      <MetricsSection />
      <PinDeviceSection />
      <RolesSection />
      <AboutFeaturesSection />
      <PlansSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
