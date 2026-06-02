import { useState } from "react";
import { FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoImage from "../../Untitled (Your Story).png";

function Footer() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <footer className="relative bg-[#2f9f9a] px-4 py-8 text-[#f8f3e8] sm:px-8 lg:px-10 lg:py-6 lg:pl-32">
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
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 lg:grid-cols-[1.45fr_0.85fr] lg:gap-10">
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <img
              src={logoImage}
              alt="The Memory Magnets"
              className="h-24 w-fit rounded-lg sm:h-32"
            />
            <h1 className="max-w-[16rem] text-3xl font-black leading-tight sm:max-w-none sm:-ml-4 sm:text-4xl">
              The Memory Magnets
            </h1>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-3 text-base font-bold sm:max-w-2xl sm:gap-x-10 sm:text-2xl">
            <div className="contents sm:flex sm:flex-col sm:items-start sm:gap-5 sm:text-left">
              <Link className="rounded-2xl bg-[#2a8f8b] px-3 py-3 text-center sm:bg-transparent sm:p-0 sm:text-left" to="/shop">Shop</Link>
              <Link className="rounded-2xl bg-[#2a8f8b] px-3 py-3 text-center sm:bg-transparent sm:p-0 sm:text-left" to="/customize">Customize</Link>
              <div className="col-span-2 flex justify-center gap-5 text-3xl sm:justify-start sm:gap-6 sm:text-4xl">
                <a
                  href="https://www.instagram.com/the.memory.magnets"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="The Memory Magnets on Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="The Memory Magnets on LinkedIn"
                >
                  <FaLinkedin />
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
            <div className="contents sm:flex sm:flex-col sm:items-end sm:gap-5 sm:text-right">
              <Link className="rounded-2xl bg-[#2a8f8b] px-3 py-3 text-center sm:bg-transparent sm:p-0 sm:text-right" to="/our-story">About Us</Link>
              <Link className="rounded-2xl bg-[#2a8f8b] px-3 py-3 text-center sm:bg-transparent sm:p-0 sm:text-right" to="/contact">Contact</Link>
              <Link className="rounded-2xl bg-[#2a8f8b] px-3 py-3 text-center sm:bg-transparent sm:p-0 sm:text-right" to="/order-feedback">Order Feedback</Link>
            </div>
          </div>

          <Link
            to="/returns-exchanges"
            className="mt-6 inline-flex rounded-2xl border-4 border-[#790405] bg-[#ffb43b] px-5 py-3 text-center text-lg font-black leading-tight text-[#ca3a3c] shadow-[5px_5px_0px_#790405] transition hover:bg-[#ffef3f]"
          >
            Returns & Exchanges
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center text-center lg:items-end lg:text-left">
          <div className="w-full max-w-md sm:max-w-xl">
            <h2 className="mb-4 text-2xl font-black">Products</h2>

            <div className="flex flex-col gap-3 text-base font-medium sm:text-lg">
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

              <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#8aa89a] sm:flex-row sm:rounded-none sm:border-0">
                <input
                  type="email"
                  placeholder="Your email here"
                  className="min-w-0 flex-1 border-b border-[#8aa89a] bg-transparent px-4 py-3 text-base outline-none placeholder:text-[#c9d6cf] sm:border sm:border-[#8aa89a]"
                />
                <button
                  type="button"
                  onClick={() => setIsSubscribed(true)}
                  className="bg-[#ca3a3c] px-7 py-3 text-base font-semibold transition hover:bg-[#f8f3e8] hover:text-[#2f9f9a] sm:border sm:border-[#8aa89a] sm:bg-transparent"
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <label className="mt-3 flex items-start gap-3 text-left text-sm text-[#c9d6cf]">
                <input className="mt-1 shrink-0" type="checkbox" />
                By checking the box, you agree to receive updates from us.
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[1200px] flex-wrap justify-center gap-x-3 gap-y-2 border-t border-[#7d5f5f] pt-4 text-center text-xs text-[#c9d6cf]">
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
