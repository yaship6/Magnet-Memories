import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SocietyStallsGallery from "../components/SocietyStallsGallery";
import withBgLogo from "../../withbg.png";

function OurStory() {
  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[115vh] px-4 py-12 sm:px-8 lg:px-16 lg:py-32">
        <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <motion.img
            src={withBgLogo}
            alt="The Memory Magnets"
            initial={{ opacity: 0, x: -50, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto h-44 rounded-[24px] object-contain sm:h-80 sm:rounded-[32px]"
          />

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-4xl font-black leading-tight text-[#ce272a] sm:text-6xl"
            >
              Our Story
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-6 text-base leading-relaxed text-gray-700 sm:mt-8 sm:text-xl"
            >
              Memory Magnets started with a simple idea: the best moments should
              not stay hidden inside a phone gallery. We wanted to turn favorite
              photos, little celebrations, trips, friendships, and family
              memories into something people could see every day.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-5 text-base leading-relaxed text-gray-700 sm:mt-6 sm:text-xl"
            >
              What began as a love for personalized keepsakes became a small
              brand built around custom magnets, Big Acrylic Magnet Frames,
              and meaningful gifts. Every magnet is made to feel personal,
              warm, and easy to keep close.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-5 text-base leading-relaxed text-gray-700 sm:mt-6 sm:text-xl"
            >
              Our goal is to help people decorate their spaces with memories
              that make them smile, one magnet at a time.
            </motion.p>
          </motion.div>
        </section>
        <SocietyStallsGallery />
      </main>

      <Footer />
    </div>
  );
}

export default OurStory;
