import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import ProjectsSection from "@/components/ProjectsSection";
import GamingSection from "@/components/GamingSection";
import RocketLeaguePage from "@/components/RocketLeaguePage";
import GolfSection from "@/components/GolfSection";
import BettingSection from "@/components/BettingSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <HeroSection />
      <ProjectsSection />
      <GamingSection />
      <RocketLeaguePage />
      <GolfSection />
      <BettingSection />
      <Footer />
    </main>
  );
}
