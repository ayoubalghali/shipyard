import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedAgents from "@/components/home/FeaturedAgents";
import TrendingCarousel from "@/components/home/TrendingCarousel";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import BrowseAgents from "@/components/home/BrowseAgents";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <HeroSection />
        <FeaturedAgents />
        <TrendingCarousel />
        <CategoriesGrid />
        <BrowseAgents />
      </main>
      <Footer />
    </div>
  );
}
