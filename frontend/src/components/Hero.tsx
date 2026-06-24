import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ekuImage from "../../Eku.png";
import ganeshImage from "../../Ganesh.png";
import motivationImage from "../../Motivation.webp";

function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 px-4 pb-12 pt-10 sm:px-8 sm:py-20 lg:min-h-[calc(118vh-96px)] lg:grid-cols-2 lg:gap-12 lg:px-16 lg:py-32">
      <div className="min-w-0 text-center lg:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-[11ch] text-4xl font-black leading-tight text-[#1a1a1a] min-[380px]:text-5xl sm:text-6xl lg:mx-0 lg:max-w-none lg:text-7xl"
        >
          Turn Your <br />
          Memories Into <br />
          <span className="text-[#ca3a3c]">Magnets</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#470000] sm:mt-8 sm:text-xl lg:mx-0 lg:max-w-2xl"
        >
          Premium customized Square Photo Magnets, Big Acrylic Magnet Frames,
          and memory keepsakes delivered to your doorstep.
        </motion.p>

        <div className="mx-auto mt-7 grid max-w-md gap-3 min-[420px]:grid-cols-2 sm:mt-10 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-5 lg:mx-0 lg:justify-start">
          <Link
            to="/customize"
            className="rounded-full border-2 border-[#790405] bg-[#ca3a3c] px-6 py-3 text-center text-base text-white transition-all duration-300 hover:border-[#ff9999] hover:bg-[#5a0205] sm:px-8 sm:py-4 sm:text-lg"
          >
            Customize Now
          </Link>

          <Link
            to="/shop"
            className="rounded-full border-2 border-[#790405] bg-[#ca3a3c] px-6 py-3 text-center text-base text-white transition-all duration-300 hover:border-[#ff9999] hover:bg-[#5a0205] sm:px-8 sm:py-4 sm:text-lg"
          >
            Explore Collection
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-md min-w-0 grid-cols-3 items-center justify-center gap-2 px-1 sm:flex sm:max-w-none sm:flex-wrap sm:gap-6 sm:px-0 lg:mx-0">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4,
          }}
          className="aspect-[3/4] h-auto w-full overflow-hidden rounded-2xl shadow-2xl sm:h-72 sm:w-48 sm:rounded-3xl"
        >
          <img
            src={motivationImage}
            alt="Motivation memory magnet"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{
            repeat: Infinity,
            duration: 5,
          }}
          className="aspect-[3/4] h-auto w-full overflow-hidden rounded-2xl shadow-2xl sm:h-72 sm:w-48 sm:rounded-3xl"
        >
          <img
            src={ekuImage}
            alt="Eku memory magnet"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4.6,
          }}
          whileHover={{ scale: 1.05 }}
          className="aspect-[3/4] h-auto w-full overflow-hidden rounded-2xl shadow-2xl sm:h-72 sm:w-48 sm:rounded-3xl"
        >
          <img
            src={ganeshImage}
            alt="Ganesh memory magnet"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
