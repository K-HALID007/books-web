import About from "@/components/home/about/about";
import FeaturedCollections from "@/components/home/featured/featured";
import Footer from "@/components/home/footer/footer";
import Hero from "@/components/home/hero/hero";
import Navbar from "@/components/home/navbar/navbar";


export default function Home() {
  return (
   <>
   <Navbar />
   <Hero  />
   <About />
   <FeaturedCollections />
   <Footer /> 
  
   </>
  );
}
