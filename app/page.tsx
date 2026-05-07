import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import SampleOutput from "@/app/components/SampleOutput";
import BeforeAfter from "@/app/components/BeforeAfter";
import IndustryGrid from "@/app/components/IndustryGrid";
import ScriptForm from "@/app/components/ScriptForm";
import FAQ from "@/app/components/FAQ";
import PricingSection from "@/app/components/PricingSection";
import FinalCTA from "@/app/components/FinalCTA";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="bg-[#F6F4EE] text-[#0F1B2D]">
      <Navbar />
      <Hero />
      <SampleOutput />
      <BeforeAfter />
      <IndustryGrid />
      <section id="form" className="scroll-mt-14 bg-[#F6F4EE] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <ScriptForm />
        </div>
      </section>
      <FAQ />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
