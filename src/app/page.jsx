import About from "@/components/home/about/about";
import AuthorSpotlights from "@/components/home/authorspotlight/authorspotlight";
import FeaturedCollections from "@/components/home/featured/featured";
import Footer from "@/components/home/footer/footer";
import Hero from "@/components/home/hero/hero";
import Navbar from "@/components/home/navbar/navbar";
import SiteStats from "@/components/home/stats/stats";
import HowItWorks from "@/components/home/works/works";
import Testimonials from "@/components/testimonal/testimonal";


export default function Home() {
  return (
   <>
   <Navbar />
   <Hero  />
   <About />
   <FeaturedCollections />
   <AuthorSpotlights />
   <Testimonials />
   <SiteStats />
   <HowItWorks />
   <Footer /> 
  
   </>
  );
}
