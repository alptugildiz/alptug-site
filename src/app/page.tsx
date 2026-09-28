import BootSequence from "@/components/fx/BootSequence";
import Motion from "@/components/fx/Motion";
import About from "@/sections/About";
import Contact from "@/sections/Contact";
import Experience from "@/sections/Experience";
import Footer from "@/sections/Footer";
import Hero from "@/sections/Hero";
import Nav from "@/sections/Nav";
import Stack from "@/sections/Stack";
import Work from "@/sections/Work";

export default function Home() {
  return (
    <>
      <BootSequence />
      <Nav />
      <main className="flex flex-col gap-3 pb-3">
        <Hero />
        <About />
        <Experience />
        <Stack />
        <Work />
        <Contact />
      </main>
      <Footer />
      <Motion />
    </>
  );
}
