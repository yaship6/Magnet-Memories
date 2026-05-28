import { ShoppingCart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";
import ekuImage from "../../Eku.png";
import ganeshImage from "../../Ganesh.png";
import motivationImage from "../../Motivation.webp";
import logoImage from "../../withbg.png";

const products = [
  {
    category: "Square Photo Magnets",
    name: "Square Photo Magnets",
    price: "Rs. 99",
    image: ganeshImage,
    imageHeight: "h-80",
  },
  {
    category: "Strip Acryclic Magnet Frames",
    name: "Strip Acryclic Magnet Frame",
    price: "Rs. 249",
    image: ekuImage,
    imageHeight: "h-56",
  },
  {
    category: "Big Acryclic Magnet Frames",
    name: "Big Acryclic Magnet Frame",
    price: "Rs. 199",
    image: motivationImage,
    imageHeight: "h-96",
  },
  {
    category: "Square Photo Magnets",
    name: "Custom logo magnet",
    price: "Rs. 99",
    image: logoImage,
    imageHeight: "h-72",
  },
  {
    category: "Square Photo Magnets",
    name: "Mini Square Photo Magnet",
    price: "Rs. 99",
    image: ganeshImage,
    imageHeight: "h-64",
  },
  {
    category: "Strip Acryclic Magnet Frames",
    name: "Photo Strip Acryclic Magnet Frame",
    price: "Rs. 249",
    image: ekuImage,
    imageHeight: "h-48",
  },
  {
    category: "Big Acryclic Magnet Frames",
    name: "Premium Big Acryclic Magnet Frame",
    price: "Rs. 199",
    image: motivationImage,
    imageHeight: "h-88",
  },
  {
    category: "Square Photo Magnets",
    name: "Logo magnet",
    price: "Rs. 99",
    image: logoImage,
    imageHeight: "h-60",
  },
  {
    category: "Square Photo Magnets",
    name: "Memory gift set",
    price: "Rs. 99",
    image: ganeshImage,
    imageHeight: "h-72",
  },
  {
    category: "Square Photo Magnets",
    name: "Quote magnet",
    price: "Rs. 99",
    image: ekuImage,
    imageHeight: "h-52",
  },
  {
    category: "Square Photo Magnets",
    name: "Festive magnet",
    price: "Rs. 99",
    image: motivationImage,
    imageHeight: "h-80",
  },
  {
    category: "Square Photo Magnets",
    name: "Personalized magnet",
    price: "Rs. 99",
    image: logoImage,
    imageHeight: "h-64",
  },
];

const shopPins = [
  ...products.slice(0, 7),
  ...products.slice(0, 7).map((product, index) => ({
    ...product,
    name: [
      "Memory Square Photo Magnet",
      "Mini Strip Acryclic Magnet Frame",
      "Classic Big Acryclic Magnet Frame",
      "Personalized logo magnet",
      "Pocket Square Photo Magnet",
      "Family Strip Acryclic Magnet Frame",
      "Keepsake Big Acryclic Magnet Frame",
    ][index],
    image: [
      motivationImage,
      ganeshImage,
      ekuImage,
      logoImage,
      ganeshImage,
      motivationImage,
      ekuImage,
    ][index],
    imageHeight: ["h-56", "h-72", "h-52", "h-80", "h-64", "h-48", "h-88"][
      index
    ],
  })),
];

const categories = [
  { label: "All", value: "All" },
  { label: "Square Photo Magnets", value: "Square Photo Magnets" },
  {
    label: "Big Acryclic Magnet Frames",
    value: "Big Acryclic Magnet Frames",
  },
  {
    label: "Strip Acryclic Magnet Frames",
    value: "Strip Acryclic Magnet Frames",
  },
];

function Shop() {
  const navigate = useNavigate();
  const { addToCart, user } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const isSquareView = activeCategory === "Square Photo Magnets";

  const updateCategory = (category: string) => {
    if (category === "All") {
      setSearchParams({});
      return;
    }

    setSearchParams({ category });
  };

  const handleAddToCart = (product: (typeof shopPins)[number], index: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    addToCart({
      id: `${product.category}-${product.name}-${index}`,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
    });
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[105vh] px-3 py-10">
        <section className="mx-auto max-w-[1800px]">
          <div className="sticky top-0 z-10 -mx-3 mb-7 flex flex-wrap items-center justify-center gap-3 bg-[#f8efe6] px-5 py-4 text-base font-semibold text-black lg:gap-5 lg:text-lg">
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
            {visiblePins.map((product, index) => (
              <article
                key={`${product.name}-${index}`}
                className={`group ${
                  isFilteredView
                    ? "w-full"
                    : "mb-5 inline-block w-full break-inside-avoid"
                }`}
              >
                <div
                  className={`relative flex ${
                    isSquareView ? "aspect-square h-auto" : product.imageHeight
                  } items-center justify-center overflow-hidden rounded-2xl bg-white`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  <button className="absolute right-3 top-3 rounded-full bg-[#e60023] px-5 py-3 text-sm font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product, index)}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition group-hover:opacity-100"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart size={18} />
                  </button>
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
                      onClick={() => handleAddToCart(product, index)}
                      className="rounded-full bg-[#ce272a] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Shop;
