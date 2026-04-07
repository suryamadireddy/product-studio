import { getFeaturedPublicProjects } from "@/lib/get-featured-public-projects";
import { Header } from "@/components/public/header";
import { Hero } from "@/components/public/hero";
import { FeaturedProjects } from "@/components/public/featured-projects";
import { Process } from "@/components/public/process";
import { Closing } from "@/components/public/closing";
import { Footer } from "@/components/public/footer";


export default async function HomePage() {
  const projects = await getFeaturedPublicProjects();

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedProjects projects={projects} />
      <Process />
      <Closing />
      <Footer />
    </main>
  );
}