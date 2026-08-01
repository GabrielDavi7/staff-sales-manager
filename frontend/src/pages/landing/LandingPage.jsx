import HeroSection from './HeroSection';
import MetricsSection from './MetricsSection';
import PinDeviceSection from './PinDeviceSection';
import RolesSection from './RolesSection';
import PlansSection from './PlansSection';
import ContactSection from './ContactSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <HeroSection />
      <MetricsSection />
      <PinDeviceSection />
      <RolesSection />
      <PlansSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
