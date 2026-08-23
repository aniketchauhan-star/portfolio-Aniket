import { Chrome } from "@/components/layout/Chrome";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/about/About";
import { Skills } from "@/components/skills/Skills";
import { Projects } from "@/components/projects/Projects";
import { Experience } from "@/components/experience/Experience";
import { Knowledge } from "@/components/education/Knowledge";
import { Contact } from "@/components/contact/Contact";

/**
 * One continuous scroll:
 *   ENTER → DISCOVER WHO I AM → WHAT I CAN DO → THE WORK → THE JOURNEY → CONNECT
 * The narrative is carried by the persistent 3D scene, never spelled out.
 */
export default function Home() {
  return (
    <>
      <Chrome />
      <Navbar />
      <main className="content-layer relative">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Knowledge />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
