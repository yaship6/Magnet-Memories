import { LogOut, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import logoImage from "../../Untitled (Your Story).png";

function Navbar() {
  const { cartCount, logout, user } = useStore();
  const navLinkClass =
    "flex min-h-10 items-center justify-center rounded-full border-2 border-[#790405] bg-[#ca3a3c] px-4 py-2 text-center text-base font-semibold leading-none text-white transition-all duration-300 hover:border-[#ff9999] hover:bg-[#5a0205]";

  return (
    <nav className="relative z-20 grid min-h-20 min-w-[1440px] grid-cols-[280px_1fr_280px] items-center gap-8 bg-[#2f9f9a] px-8 py-3">
      <img
        src={logoImage}
        alt="The Memory Magnets"
        className="absolute bottom-[-56px] left-8 z-30 h-32 rounded-lg"
      />

      <div className="z-20 col-start-2 flex -translate-x-8 items-center justify-center gap-3 whitespace-nowrap text-white">
        <Link to="/" className={navLinkClass}>
          Home
        </Link>
        <Link to="/shop" className={navLinkClass}>
          Shop
        </Link>
        <Link to="/customize" className={navLinkClass}>
          Customize
        </Link>
        <Link to="/order-feedback" className={navLinkClass}>
          Feedback
        </Link>
        <Link to="/society-stalls" className={navLinkClass}>
          Society Stalls
        </Link>
      </div>

      <div className="z-20 col-start-3 flex items-center justify-end gap-3 whitespace-nowrap text-white">
        <Link to="/cart" className={`${navLinkClass} flex items-center gap-2`}>
          <ShoppingCart size={22} />
          Cart
          {cartCount > 0 && (
            <span className="rounded-full bg-[#2f9f9a] px-2 py-0.5 text-sm">
              {cartCount}
            </span>
          )}
        </Link>
        <Link to="/contact" className={navLinkClass}>
          Contact
        </Link>
        {user ? (
          <>
            <Link to="/orders" className={navLinkClass}>
              Orders
            </Link>
            <button
              type="button"
              onClick={logout}
              className={`${navLinkClass} w-12 px-0`}
              aria-label={`Logout ${user.name ?? user.gmail ?? user.email}`}
              title={`Logout ${user.name ?? user.gmail ?? user.email}`}
            >
              <LogOut size={22} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={navLinkClass}>
              Login
            </Link>
            <Link to="/signup" className={navLinkClass}>
              Signup
            </Link>
          </>
        )}
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 36"
        preserveAspectRatio="none"
        className="absolute bottom-[-19px] left-0 z-10 h-5 w-full rotate-180 text-[#2f9f9a]"
      >
        <path
          fill="currentColor"
          d="M0 18 C30 18 30 4 60 4 S90 18 120 18 S150 4 180 4 S210 18 240 18 S270 4 300 4 S330 18 360 18 S390 4 420 4 S450 18 480 18 S510 4 540 4 S570 18 600 18 S630 4 660 4 S690 18 720 18 S750 4 780 4 S810 18 840 18 S870 4 900 4 S930 18 960 18 S990 4 1020 4 S1050 18 1080 18 S1110 4 1140 4 S1170 18 1200 18 S1230 4 1260 4 S1290 18 1320 18 S1350 4 1380 4 S1410 18 1440 18 V36 H0 Z"
        />
      </svg>
    </nav>
  );
}

export default Navbar;
