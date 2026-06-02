import { BookmarkX, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";

function Wishlist() {
  const { addToCart, removeFromWishlist, user, wishlistItems } = useStore();
  const customerDisplayName = user?.name ?? user?.gmail ?? user?.email ?? "";

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[80vh] px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
        <section className="mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#ce272a] sm:text-6xl">
                Wishlist
              </h1>
              <p className="mt-3 text-base text-gray-700 sm:mt-4 sm:text-xl">
                {user
                  ? `${customerDisplayName}'s saved magnets`
                  : "Login to save favorite magnets for later."}
              </p>
            </div>

            <Link
              to="/shop"
              className="w-full rounded-full bg-[#2f9f9a] px-6 py-3 text-center text-base font-semibold text-white sm:w-auto sm:text-lg"
            >
              Shop Magnets
            </Link>
          </div>

          {!user && (
            <Link
              to="/login"
              className="mt-8 inline-flex w-full justify-center rounded-full bg-[#ce272a] px-7 py-3 text-base font-semibold text-white sm:w-auto sm:text-lg"
            >
              Login
            </Link>
          )}

          {wishlistItems.length === 0 ? (
            <div className="mt-10 rounded-[28px] bg-[#ffbcbc] p-6 text-center shadow-xl sm:rounded-[32px] sm:p-10">
              <BookmarkX className="mx-auto text-[#ce272a]" size={48} />
              <p className="mt-4 text-2xl font-black text-[#ce272a] sm:text-3xl">
                Your wishlist is empty.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-[#ce272a] px-8 py-4 text-base font-semibold text-white sm:w-auto sm:text-lg"
              >
                Find Favorites
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[28px] bg-[#ffbcbc] shadow-lg"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-56 w-full object-cover sm:h-72"
                  />

                  <div className="grid gap-4 p-5">
                    <div>
                      <h2 className="text-xl font-black text-[#790405] sm:text-2xl">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-base text-gray-700">
                        {item.category}
                      </p>
                      <p className="mt-2 text-xl font-bold text-[#2f9f9a]">
                        {item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#ce272a] px-4 py-2 text-sm font-semibold text-white"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#790405]"
                        aria-label={`Remove ${item.name} from wishlist`}
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;
