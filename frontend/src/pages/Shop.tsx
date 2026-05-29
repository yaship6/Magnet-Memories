import { Bookmark, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";

type Product = {
  category:
    | "Square Photo Magnets"
    | "Strip Acrylic Magnet Frames"
    | "Big Acrylic Magnet Frames";
  name: string;
  price: string;
  image: string | string[];
  quote?: string;
};

const magnetImages = {
  familyBirthday:
    "https://images.pexels.com/photos/7921809/pexels-photo-7921809.jpeg?auto=compress&cs=tinysrgb&w=900",
  indianWedding:
    "https://images.pexels.com/photos/27456655/pexels-photo-27456655.jpeg?auto=compress&cs=tinysrgb&w=900",
  bridalPortrait:
    "https://images.pexels.com/photos/27455007/pexels-photo-27455007.jpeg?auto=compress&cs=tinysrgb&w=900",
  familyPicnic:
    "https://images.pexels.com/photos/7669128/pexels-photo-7669128.jpeg?auto=compress&cs=tinysrgb&w=900",
  picnicMusic:
    "https://images.pexels.com/photos/8841503/pexels-photo-8841503.jpeg?auto=compress&cs=tinysrgb&w=900",
  backyardMeal:
    "https://images.pexels.com/photos/8841182/pexels-photo-8841182.jpeg?auto=compress&cs=tinysrgb&w=900",
  beachCouple:
    "https://images.pexels.com/photos/9149294/pexels-photo-9149294.jpeg?auto=compress&cs=tinysrgb&w=900",
  beachWalk:
    "https://images.pexels.com/photos/15954981/pexels-photo-15954981.jpeg?auto=compress&cs=tinysrgb&w=900",
  picnicFamily:
    "https://images.pexels.com/photos/5119627/pexels-photo-5119627.jpeg?auto=compress&cs=tinysrgb&w=900",
  coastCouple:
    "https://images.pexels.com/photos/6075217/pexels-photo-6075217.jpeg?auto=compress&cs=tinysrgb&w=900",
  partyFamily:
    "https://images.pexels.com/photos/4262427/pexels-photo-4262427.jpeg?auto=compress&cs=tinysrgb&w=900",
  grassFamily:
    "https://images.pexels.com/photos/36317738/pexels-photo-36317738.jpeg?auto=compress&cs=tinysrgb&w=900",
  tropicalCouple:
    "https://images.pexels.com/photos/15831641/pexels-photo-15831641.jpeg?auto=compress&cs=tinysrgb&w=900",
  weddingSmile:
    "https://images.pexels.com/photos/27456656/pexels-photo-27456656.jpeg?auto=compress&cs=tinysrgb&w=900",
  pinkFlowers:
    "https://images.pexels.com/photos/16665255/pexels-photo-16665255.jpeg?auto=compress&cs=tinysrgb&w=900",
  peonies:
    "https://images.pexels.com/photos/931188/pexels-photo-931188.jpeg?auto=compress&cs=tinysrgb&w=900",
  tulips:
    "https://images.pexels.com/photos/3878527/pexels-photo-3878527.jpeg?auto=compress&cs=tinysrgb&w=900",
  pastelSky:
    "https://images.pexels.com/photos/10731706/pexels-photo-10731706.jpeg?auto=compress&cs=tinysrgb&w=900",
  dreamySky:
    "https://images.pexels.com/photos/14060322/pexels-photo-14060322.jpeg?auto=compress&cs=tinysrgb&w=900",
  floralCake:
    "https://images.pexels.com/photos/11783270/pexels-photo-11783270.jpeg?auto=compress&cs=tinysrgb&w=900",
  berryCake:
    "https://images.pexels.com/photos/8101695/pexels-photo-8101695.jpeg?auto=compress&cs=tinysrgb&w=900",
  coffeeFlowers:
    "https://images.pexels.com/photos/14258282/pexels-photo-14258282.jpeg?auto=compress&cs=tinysrgb&w=900",
  coffeeRoses:
    "https://images.pexels.com/photos/17460292/pexels-photo-17460292.jpeg?auto=compress&cs=tinysrgb&w=900",
  candleCoffee:
    "https://images.pexels.com/photos/14656017/pexels-photo-14656017.jpeg?auto=compress&cs=tinysrgb&w=900",
  mountainSunset:
    "https://images.pexels.com/photos/816057/pexels-photo-816057.jpeg?auto=compress&cs=tinysrgb&w=900",
  mountainDusk:
    "https://images.pexels.com/photos/5661213/pexels-photo-5661213.jpeg?auto=compress&cs=tinysrgb&w=900",
  winterMountain:
    "https://images.pexels.com/photos/15476103/pexels-photo-15476103.jpeg?auto=compress&cs=tinysrgb&w=900",
  babyCake:
    "https://images.pexels.com/photos/2116103/pexels-photo-2116103.jpeg?auto=compress&cs=tinysrgb&w=900",
  cakeSmash:
    "https://images.pexels.com/photos/30111570/pexels-photo-30111570.jpeg?auto=compress&cs=tinysrgb&w=900",
  cuteDog:
    "https://images.pexels.com/photos/27487541/pexels-photo-27487541.jpeg?auto=compress&cs=tinysrgb&w=900",
  fluffyDog:
    "https://images.pexels.com/photos/14506620/pexels-photo-14506620.jpeg?auto=compress&cs=tinysrgb&w=900",
};

const products = [
  {
    category: "Square Photo Magnets",
    name: "Pastel sky quote magnet",
    price: "Rs. 99",
    image: magnetImages.pastelSky,
    quote: "Choose joy",
  },
  {
    category: "Strip Acrylic Magnet Frames",
    name: "Bloom Strip Acrylic Magnet Frame",
    price: "Rs. 249",
    image: [
      magnetImages.pinkFlowers,
      magnetImages.peonies,
      magnetImages.tulips,
    ],
  },
  {
    category: "Big Acrylic Magnet Frames",
    name: "Floral cake Big Acrylic Magnet Frame",
    price: "Rs. 199",
    image: magnetImages.floralCake,
  },
  {
    category: "Square Photo Magnets",
    name: "Pink flower magnet",
    price: "Rs. 99",
    image: magnetImages.pinkFlowers,
  },
  {
    category: "Square Photo Magnets",
    name: "Dreamy sky magnet",
    price: "Rs. 99",
    image: magnetImages.dreamySky,
  },
  {
    category: "Strip Acrylic Magnet Frames",
    name: "Cake Party Strip Acrylic Magnet Frame",
    price: "Rs. 249",
    image: [
      magnetImages.floralCake,
      magnetImages.berryCake,
      magnetImages.partyFamily,
    ],
  },
  {
    category: "Big Acrylic Magnet Frames",
    name: "Pastel sky Big Acrylic Magnet Frame",
    price: "Rs. 199",
    image: magnetImages.dreamySky,
  },
  {
    category: "Square Photo Magnets",
    name: "Berry cake magnet",
    price: "Rs. 99",
    image: magnetImages.berryCake,
  },
  {
    category: "Square Photo Magnets",
    name: "Motivation mini magnet",
    price: "Rs. 99",
    image: magnetImages.peonies,
    quote: "Small steps every day",
  },
  {
    category: "Square Photo Magnets",
    name: "Tulip desk magnet",
    price: "Rs. 99",
    image: magnetImages.tulips,
  },
  {
    category: "Square Photo Magnets",
    name: "Birthday cake magnet",
    price: "Rs. 99",
    image: magnetImages.floralCake,
  },
  {
    category: "Square Photo Magnets",
    name: "Keep going quote magnet",
    price: "Rs. 99",
    image: magnetImages.pastelSky,
    quote: "Keep going",
  },
  {
    category: "Strip Acrylic Magnet Frames",
    name: "Pinterest Mood Strip Acrylic Magnet Frame",
    price: "Rs. 249",
    image: [
      magnetImages.pastelSky,
      magnetImages.pinkFlowers,
      magnetImages.berryCake,
    ],
  },
  {
    category: "Big Acrylic Magnet Frames",
    name: "Flower Big Acrylic Magnet Frame",
    price: "Rs. 199",
    image: magnetImages.peonies,
  },
  {
    category: "Square Photo Magnets",
    name: "Family memory magnet",
    price: "Rs. 99",
    image: magnetImages.familyBirthday,
  },
  {
    category: "Strip Acrylic Magnet Frames",
    name: "Celebration Strip Acrylic Magnet Frame",
    price: "Rs. 249",
    image: [
      magnetImages.familyBirthday,
      magnetImages.partyFamily,
      magnetImages.floralCake,
    ],
  },
  {
    category: "Big Acrylic Magnet Frames",
    name: "Wedding Big Acrylic Magnet Frame",
    price: "Rs. 199",
    image: magnetImages.weddingSmile,
  },
  {
    category: "Square Photo Magnets",
    name: "Coffee table magnet",
    price: "Rs. 99",
    image: magnetImages.coffeeFlowers,
  },
  {
    category: "Square Photo Magnets",
    name: "Cozy coffee quote magnet",
    price: "Rs. 99",
    image: magnetImages.coffeeRoses,
    quote: "Slow mornings",
  },
  {
    category: "Square Photo Magnets",
    name: "Mountain sunset magnet",
    price: "Rs. 99",
    image: magnetImages.mountainSunset,
  },
  {
    category: "Square Photo Magnets",
    name: "Adventure quote magnet",
    price: "Rs. 99",
    image: magnetImages.mountainDusk,
    quote: "Go where you feel alive",
  },
  {
    category: "Square Photo Magnets",
    name: "Baby cake magnet",
    price: "Rs. 99",
    image: magnetImages.babyCake,
  },
  {
    category: "Square Photo Magnets",
    name: "Pet portrait magnet",
    price: "Rs. 99",
    image: magnetImages.cuteDog,
  },
  {
    category: "Strip Acrylic Magnet Frames",
    name: "Cozy Cafe Strip Acrylic Magnet Frame",
    price: "Rs. 249",
    image: [
      magnetImages.coffeeFlowers,
      magnetImages.coffeeRoses,
      magnetImages.candleCoffee,
    ],
  },
  {
    category: "Strip Acrylic Magnet Frames",
    name: "Mountain Mood Strip Acrylic Magnet Frame",
    price: "Rs. 249",
    image: [
      magnetImages.mountainSunset,
      magnetImages.mountainDusk,
      magnetImages.winterMountain,
    ],
  },
  {
    category: "Strip Acrylic Magnet Frames",
    name: "Cute Moments Strip Acrylic Magnet Frame",
    price: "Rs. 249",
    image: [
      magnetImages.babyCake,
      magnetImages.cakeSmash,
      magnetImages.fluffyDog,
    ],
  },
  {
    category: "Big Acrylic Magnet Frames",
    name: "Cozy Coffee Big Acrylic Magnet Frame",
    price: "Rs. 199",
    image: magnetImages.candleCoffee,
  },
  {
    category: "Big Acrylic Magnet Frames",
    name: "Mountain Big Acrylic Magnet Frame",
    price: "Rs. 199",
    image: magnetImages.winterMountain,
  },
  {
    category: "Big Acrylic Magnet Frames",
    name: "Cake Smash Big Acrylic Magnet Frame",
    price: "Rs. 199",
    image: magnetImages.cakeSmash,
  },
] satisfies Product[];

const shopPins = products;

const categories = [
  { label: "All", value: "All" },
  { label: "Square Photo Magnets", value: "Square Photo Magnets" },
  {
    label: "Big Acrylic Magnet Frames",
    value: "Big Acrylic Magnet Frames",
  },
  {
    label: "Strip Acrylic Magnet Frames",
    value: "Strip Acrylic Magnet Frames",
  },
];

const getProductId = (product: Product) =>
  `${product.category}-${product.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function Shop() {
  const navigate = useNavigate();
  const {
    addToCart,
    addToWishlist,
    isInWishlist,
    removeFromWishlist,
    user,
  } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addedProductId, setAddedProductId] = useState("");
  const requestedCategory = searchParams.get("category") ?? "All";
  const activeCategory = categories.some(
    (category) => category.value === requestedCategory
  )
    ? requestedCategory
    : "All";
  const visiblePins =
    activeCategory === "All"
      ? shopPins
      : shopPins.filter((product) => product.category === activeCategory);
  const isFilteredView = activeCategory !== "All";

  const updateCategory = (category: string) => {
    if (category === "All") {
      setSearchParams({});
      return;
    }

    setSearchParams({ category });
  };

  const getStoreItem = (product: Product) => ({
    id: getProductId(product),
    name: product.name,
    price: product.price,
    category: product.category,
    image: Array.isArray(product.image) ? product.image[0] : product.image,
  });

  const handleAddToCart = (product: (typeof shopPins)[number]) => {
    if (!user) {
      navigate("/login");
      return;
    }

    addToCart(getStoreItem(product));
    const productId = getProductId(product);
    setAddedProductId(productId);
    window.setTimeout(() => {
      setAddedProductId((currentProductId) =>
        currentProductId === productId ? "" : currentProductId
      );
    }, 1400);
  };

  const handleToggleWishlist = (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const wishlistItem = getStoreItem(product);

    if (isInWishlist(wishlistItem.id)) {
      removeFromWishlist(wishlistItem.id);
      return;
    }

    addToWishlist(wishlistItem);
  };

  const renderProductPreview = (product: Product) => {
    if (product.category === "Strip Acrylic Magnet Frames") {
      const images = Array.isArray(product.image)
        ? product.image
        : [product.image, product.image, product.image];

      return (
        <div className="flex h-[420px] items-center justify-center bg-[#f6f1ec] p-5">
          <div className="relative aspect-[3/7] h-full max-h-[380px] rounded-[20px] bg-[#d8d5cb]/60 p-3 shadow-[0_18px_35px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.8)]">
            {[0, 1, 2, 3].map((corner) => (
              <span
                key={corner}
                className={`absolute z-10 h-6 w-6 rounded-full bg-gradient-to-br from-white via-[#e8e4db] to-[#aaa59a] shadow ${
                  corner === 0
                    ? "left-2 top-2"
                    : corner === 1
                    ? "right-2 top-2"
                    : corner === 2
                    ? "bottom-2 left-2"
                    : "bottom-2 right-2"
                }`}
              />
            ))}
            <div className="flex h-full flex-col gap-2 rounded-[12px] bg-white p-2 shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
              {images.slice(0, 3).map((image, imageIndex) => (
                <div
                  key={`${image}-${imageIndex}`}
                  className="min-h-0 flex-1 overflow-hidden bg-[#f8efe6]"
                >
                  <img
                    src={image}
                    alt={`${product.name} photo ${imageIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/35 via-transparent to-black/10" />
          </div>
        </div>
      );
    }

    if (product.category === "Big Acrylic Magnet Frames") {
      const image = Array.isArray(product.image) ? product.image[0] : product.image;

      return (
        <div className="flex h-[420px] items-center justify-center bg-[#f6f1ec] p-5">
          <div className="relative aspect-[3/4] h-full max-h-[380px] rounded-[22px] bg-[#e8e8e3]/65 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.85)]">
            {[0, 1, 2, 3].map((corner) => (
              <span
                key={corner}
                className={`absolute z-10 h-6 w-6 rounded-full bg-gradient-to-br from-white via-[#efeee9] to-[#c8c3b8] shadow ${
                  corner === 0
                    ? "left-2 top-2"
                    : corner === 1
                    ? "right-2 top-2"
                    : corner === 2
                    ? "bottom-2 left-2"
                    : "bottom-2 right-2"
                }`}
              />
            ))}
            <div className="h-full overflow-hidden rounded-[12px] bg-white p-2 shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/35 via-transparent to-black/10" />
          </div>
        </div>
      );
    }

    const image = Array.isArray(product.image) ? product.image[0] : product.image;

    return (
      <div className="flex aspect-square items-center justify-center bg-[#f6f1ec] p-5">
        <div className="relative aspect-square w-full max-w-[330px] overflow-hidden rounded-[34px] bg-[#f1f1f1] shadow-[0_18px_34px_rgba(0,0,0,0.2),inset_0_8px_12px_rgba(255,255,255,0.68),inset_0_-12px_18px_rgba(0,0,0,0.12)]">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          <div
            className={`pointer-events-none absolute inset-0 ${
              product.quote
                ? "bg-gradient-to-br from-white/72 via-white/24 to-black/24"
                : "bg-gradient-to-br from-white/38 via-transparent to-black/14"
            }`}
          />
          {product.quote && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-7 text-center">
              <p className="rounded-2xl bg-white/72 px-5 py-4 text-2xl font-black leading-tight text-[#790405] shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-sm">
                {product.quote}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[105vh] px-8 py-10">
        <section className="mx-auto max-w-[1800px]">
          <div className="sticky top-0 z-10 -mx-8 mb-7 flex flex-wrap items-center justify-center gap-3 bg-[#f8efe6] px-8 py-4 text-base font-semibold text-black lg:gap-5 lg:text-lg">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => updateCategory(category.value)}
                className={`max-w-full rounded-full px-4 py-2 text-center leading-tight transition ${
                  activeCategory === category.value
                    ? "bg-[#ce272a] text-white"
                    : "bg-[#ffbcbc] text-[#790405] hover:bg-[#ce272a] hover:text-white"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div
            className={
              isFilteredView
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "columns-1 gap-4 md:columns-3 lg:columns-7"
            }
          >
            {visiblePins.map((product, index) => {
              const productId = getProductId(product);
              const saved = isInWishlist(productId);
              const isAdded = addedProductId === productId;

              return (
              <article
                key={`${product.name}-${index}`}
                className={`group ${
                  isFilteredView
                    ? "w-full"
                    : "mb-5 inline-block w-full break-inside-avoid"
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white">
                  {renderProductPreview(product)}
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(product)}
                    className={`absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition group-hover:opacity-100 ${
                      saved
                        ? "bg-[#e60023] text-white opacity-100"
                        : "bg-white text-[#790405] opacity-0"
                    }`}
                    aria-label={
                      saved
                        ? `Remove ${product.name} from wishlist`
                        : `Save ${product.name} to wishlist`
                    }
                    title={saved ? "Saved" : "Save"}
                  >
                    <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition group-hover:opacity-100"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart size={18} />
                  </button>
                  {isAdded && (
                    <div className="pointer-events-none absolute bottom-14 right-3 rounded-full border-2 border-[#790405] bg-[#2f9f9a] px-4 py-2 text-sm font-black text-white shadow-xl">
                      Added!
                    </div>
                  )}
                </div>

                <div className="px-1 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-1 text-sm font-semibold text-black">
                      {product.name}
                    </h2>
                    <span className="text-lg leading-none">...</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#2f9f9a]">
                      {product.price}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="rounded-full bg-[#ce272a] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Shop;
