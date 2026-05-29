import { useState } from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoImage from "../../Untitled (Your Story).png";

function Footer() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <footer className="relative bg-[#2f9f9a] px-5 py-6 text-[#f8f3e8] sm:px-8 lg:px-10 lg:py-6 lg:pl-32">
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 36"
        preserveAspectRatio="none"
        className="absolute left-0 top-[-19px] h-5 w-full text-[#2f9f9a]"
      >
        <path
          fill="currentColor"
          d="M0 18 C30 18 30 4 60 4 S90 18 120 18 S150 4 180 4 S210 18 240 18 S270 4 300 4 S330 18 360 18 S390 4 420 4 S450 18 480 18 S510 4 540 4 S570 18 600 18 S630 4 660 4 S690 18 720 18 S750 4 780 4 S810 18 840 18 S870 4 900 4 S930 18 960 18 S990 4 1020 4 S1050 18 1080 18 S1110 4 1140 4 S1170 18 1200 18 S1230 4 1260 4 S1290 18 1320 18 S1350 4 1380 4 S1410 18 1440 18 V36 H0 Z"
        />
      </svg>
      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr] lg:gap-10">
        <div className="relative flex flex-col items-center justify-center text-center">
          <Link
            to="/returns-exchanges"
            className="absolute left-[-4.5rem] top-1/2 hidden h-60 w-20 -translate-y-1/2 rotate-180 items-center justify-center rounded-l-2xl border-4 border-[#790405] bg-[#ffb43b] text-center text-2xl font-black leading-none text-[#ca3a3c] shadow-[-7px_-7px_0px_#790405] transition hover:-translate-y-[52%] hover:bg-[#ffef3f] lg:flex"
          >
            <span className="[writing-mode:vertical-rl] [text-orientation:mixed]">
              Returns & Exchanges
            </span>
          </Link>

          <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <img
              src={logoImage}
              alt="The Memory Magnets"
              className="h-28 w-fit rounded-lg sm:h-32"
            />
            <h1 className="text-3xl font-black sm:-ml-4 sm:text-4xl">
              The Memory Magnets
            </h1>
          </div>

          <div className="grid max-w-2xl grid-cols-2 gap-x-10 text-2xl font-bold">
            <div className="flex flex-col items-start gap-5 text-left">
              <Link to="/shop">Shop</Link>
              <Link to="/customize">Customize</Link>
              <Link to="/society-stalls">Society Stalls</Link>
            </div>
            <div className="flex flex-col items-end gap-5 text-right">
              <Link to="/our-story">Our Story</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/order-feedback">Order Feedback</Link>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-8 text-4xl">
            <a
              href="https://www.instagram.com/the.memory.magnets"
              target="_blank"
              rel="noreferrer"
              aria-label="The Memory Magnets on Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://wa.me/917042736597?text=Hi%20The%20Memory%20Magnets%2C%20I%20want%20to%20ask%20about%20an%20order."
              target="_blank"
              rel="noreferrer"
              aria-label="The Memory Magnets on WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-start justify-center lg:items-end">
          <div className="w-full max-w-xl">
            <h2 className="mb-4 text-2xl font-black">Products</h2>

            <div className="flex flex-col gap-3 text-lg font-medium">
              <Link to="/shop?category=Square+Photo+Magnets">
                Square Photo Magnets
              </Link>
              <Link to="/shop?category=Strip+Acrylic+Magnet+Frames">
                Strip Acrylic Magnet Frames
              </Link>
              <Link to="/shop?category=Big+Acrylic+Magnet+Frames">
                Big Acrylic Magnet Frames
              </Link>
              <Link to="/customize">Custom Magnets</Link>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-base font-semibold">
                Get the freshest Memory Magnets news
              </h3>

              <div className="flex w-full flex-col sm:flex-row">
                <input
                  type="email"
                  placeholder="Your email here"
                  className="min-w-0 flex-1 border border-[#8aa89a] bg-transparent px-4 py-3 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsSubscribed(true)}
                  className="border border-[#8aa89a] px-7 py-3 text-base font-semibold transition hover:bg-[#f8f3e8] hover:text-[#2f9f9a]"
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <label className="mt-3 flex gap-3 text-sm text-[#c9d6cf]">
                <input type="checkbox" />
                By checking the box, you agree to receive updates from us.
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 border-t border-[#7d5f5f] pt-3 text-center text-xs text-[#c9d6cf]">
        <span>Website Terms</span>
        <span>|</span>
        <span>Privacy Policy</span>
        <span>|</span>
        <span>Copyright 2026 The Memory Magnets. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
