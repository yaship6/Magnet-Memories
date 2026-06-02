import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SocietyStallsGallery from "../components/SocietyStallsGallery";

function SocietyStalls() {
  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />
      <main className="min-h-[105vh] px-4 py-12 sm:px-8 lg:px-16 lg:py-28">
        <SocietyStallsGallery />
      </main>
      <Footer />
    </div>
  );
}

export default SocietyStalls;
