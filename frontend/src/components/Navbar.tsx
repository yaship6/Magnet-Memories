import {
  Bookmark,
  ChevronDown,
  ClipboardList,
  LogOut,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import logoImage from "../../Untitled (Your Story).png";

function Navbar() {
  const { cartCount, logout, user, wishlistCount } = useStore();
  const userDisplayName = user?.name ?? user?.gmail ?? user?.email ?? "Account";
  const navLinkClass =
    "flex min-h-10 items-center justify-center rounded-full border-2 border-[#790405] bg-[#ca3a3c] px-4 py-2 text-center text-base font-semibold leading-none text-white transition-all duration-300 hover:border-[#ff9999] hover:bg-[#5a0205]";
  const accountMenuItemClass =
    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold text-[#790405] transition hover:bg-[#ffbcbc]";

  return (
    <nav className="relative z-20 grid min-h-20 min-w-[1440px] grid-cols-[280px_1fr_auto] items-center gap-8 bg-[#2f9f9a] px-8 py-3">
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
        <Link to="/contact" className={navLinkClass}>
          Contact
        </Link>
        <Link to="/cart" className={`${navLinkClass} gap-2`}>
          <ShoppingCart size={19} />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="rounded-full bg-[#2f9f9a] px-2 py-0.5 text-sm text-white">
              {cartCount}
            </span>
          )}
        </Link>
        {user ? (
          <div className="group relative">
            <button
              type="button"
              className={`${navLinkClass} max-w-[220px] gap-2`}
              aria-haspopup="menu"
              aria-label={`${userDisplayName} account menu`}
            >
              <UserRound size={21} />
              <span className="max-w-[120px] truncate">{userDisplayName}</span>
              <ChevronDown
                className="transition group-hover:rotate-180 group-focus-within:rotate-180"
                size={18}
              />
            </button>
            <div
              className="invisible absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-[24px] border-2 border-[#790405] bg-[#fffaf7] p-3 text-[#790405] opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              role="menu"
            >
              <Link
                to="/profile-edit"
                className={accountMenuItemClass}
                role="menuitem"
              >
                <UserRound size={20} />
                Profile Edit
              </Link>
              <Link
                to="/wishlist"
                className={accountMenuItemClass}
                role="menuitem"
              >
                <Bookmark size={20} />
                <span className="flex-1">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-[#2f9f9a] px-2 py-0.5 text-sm text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                className={accountMenuItemClass}
                role="menuitem"
              >
                <ClipboardList size={20} />
                Orders
              </Link>
              <button
                type="button"
                onClick={logout}
                className={accountMenuItemClass}
                role="menuitem"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
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
