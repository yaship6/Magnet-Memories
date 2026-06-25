import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import HappyReviews from "../components/HappyReviews";

function Home() {
  return (
    <div className="min-h-screen bg-[#f8efe6]">
      <Navbar />
      <Hero />
      <HappyReviews />
      <Footer />
    </div>
  );
}

export default Home;
