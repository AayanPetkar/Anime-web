import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { SkillsSection } from '@/components/home/SkillsSection';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <SkillsSection />
      </main>
    </>
  );
}
