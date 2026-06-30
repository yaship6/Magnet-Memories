import { motion } from "framer-motion";
import { Check, ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { compressImage } from "../utils/image";
import customTabHelper from "../assets/custom-tab-helper-transparent.png";

type MagnetType =
  | "Square Photo Magnets"
  | "Strip Acrylic Magnet Frames"
  | "Big Acrylic Magnet Frames";

type ImageAdjustment = {
  scale: number;
  x: number;
  y: number;
};

const magnetTypes: MagnetType[] = [
  "Square Photo Magnets",
  "Strip Acrylic Magnet Frames",
  "Big Acrylic Magnet Frames",
];

const photoSlotColors = ["bg-[#ffd4d4]", "bg-[#fff1e7]", "bg-[#f7b8b9]"];
const defaultImageAdjustment: ImageAdjustment = { scale: 1, x: 0, y: 0 };

const magnetPrices: Record<MagnetType, string> = {
  "Square Photo Magnets": "Rs. 99",
  "Strip Acrylic Magnet Frames": "Rs. 249",
  "Big Acrylic Magnet Frames": "Rs. 199",
};

const magnetSizes: Record<MagnetType, string> = {
  "Square Photo Magnets": "Square - 2x2 inches",
  "Strip Acrylic Magnet Frames": "Strip Magnetic Frame - 3x7 inches",
  "Big Acrylic Magnet Frames": "Rectangle Magnetic Frame - 3x4 inches",
};

function CustomizeSection() {
  const navigate = useNavigate();
  const { addToCart, user } = useStore();
  const [magnetType, setMagnetType] =
    useState<MagnetType>("Square Photo Magnets");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustment[]>(
    []
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const needsThreeImages = magnetType === "Strip Acrylic Magnet Frames";
  const hasRequiredImages =
    needsThreeImages ? previewImages.length === 3 : previewImages.length === 1;

  const loadImageFiles = (files: File[]) => {
    if (files.length === 0) {
      setPreviewImages([]);
      setImageAdjustments([]);
      setActiveImageIndex(0);
      return;
    }

    const maxImages = needsThreeImages ? 3 : 1;
    const readers = files.slice(0, maxImages).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const rawBase64 = String(reader.result);
            const compressed = await compressImage(rawBase64);
            resolve(compressed);
          };
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((nextPreviews) => {
      setPreviewImages(nextPreviews);
      setImageAdjustments(
        nextPreviews.map(() => ({ ...defaultImageAdjustment }))
      );
      setActiveImageIndex(0);
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    loadImageFiles(Array.from(event.target.files ?? []));
  };

  const handleImageDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    loadImageFiles(
      Array.from(event.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      )
    );
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const updateMagnetType = (nextMagnetType: MagnetType) => {
    setMagnetType(nextMagnetType);
    setPreviewImages((currentPreviews) => {
      if (nextMagnetType === "Strip Acrylic Magnet Frames") {
        return currentPreviews;
      }

      const [firstPreview] = currentPreviews;

      return firstPreview ? [firstPreview] : [];
    });
    setImageAdjustments((currentAdjustments) => {
      if (nextMagnetType === "Strip Acrylic Magnet Frames") {
        return currentAdjustments;
      }

      const [firstAdjustment] = currentAdjustments;

      return firstAdjustment ? [firstAdjustment] : [];
    });
    setActiveImageIndex(0);
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const removeImage = (indexToRemove: number) => {
    setPreviewImages((currentPreviews) => {
      return currentPreviews.filter((_, index) => index !== indexToRemove);
    });
    setImageAdjustments((currentAdjustments) => {
      return currentAdjustments.filter((_, index) => index !== indexToRemove);
    });
    setActiveImageIndex((currentIndex) => {
      return Math.max(0, Math.min(currentIndex, previewImages.length - 2));
    });
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const updateImageAdjustment = (
    key: keyof ImageAdjustment,
    value: number
  ) => {
    setImageAdjustments((currentAdjustments) => {
      const nextAdjustments = [...currentAdjustments];
      nextAdjustments[activeImageIndex] = {
        ...(nextAdjustments[activeImageIndex] ?? defaultImageAdjustment),
        [key]: value,
      };

      return nextAdjustments;
    });
  };

  const resetActiveImageAdjustment = () => {
    setImageAdjustments((currentAdjustments) => {
      const nextAdjustments = [...currentAdjustments];
      nextAdjustments[activeImageIndex] = { ...defaultImageAdjustment };

      return nextAdjustments;
    });
  };

  const renderRemoveButton = (index: number) => (
    <button
      type="button"
      aria-label="Remove image"
      onClick={() => removeImage(index)}
      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#5a0205] text-white shadow-lg transition hover:scale-110 hover:bg-[#790405]"
    >
      <X size={18} strokeWidth={3} />
    </button>
  );

  const renderPhoto = (
    image: string | undefined,
    className = "",
    index = 0
  ) => {
    const adjustment = imageAdjustments[index] ?? defaultImageAdjustment;

    return image ? (
      <img
        src={image}
        alt="Uploaded magnet preview"
        style={{
          transform: `translate(${adjustment.x}%, ${adjustment.y}%) scale(${adjustment.scale})`,
        }}
        className={`h-full w-full object-cover transition-transform duration-200 ${className}`}
      />
    ) : (
      <div className={`h-full w-full ${className}`} />
    );
  };

  const renderAdjustmentControls = () => {
    if (previewImages.length === 0) {
      return null;
    }

    const activeAdjustment =
      imageAdjustments[activeImageIndex] ?? defaultImageAdjustment;

    return (
      <div className="w-full max-w-md rounded-2xl border border-[#f1b8b9] bg-[#fffaf7] p-4 shadow-lg">
        {previewImages.length > 1 && (
          <div className="mb-4 flex justify-center gap-2">
            {previewImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`h-9 rounded-full px-4 text-sm font-bold transition ${
                  activeImageIndex === index
                    ? "bg-[#ca3a3c] text-white"
                    : "bg-[#ffe1dc] text-[#790405]"
                }`}
              >
                Photo {index + 1}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-3 text-[#790405]">
          <label className="grid gap-1 text-sm font-bold">
            Zoom
            <input
              type="range"
              min="1"
              max="2"
              step="0.05"
              value={activeAdjustment.scale}
              onChange={(event) =>
                updateImageAdjustment("scale", Number(event.target.value))
              }
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Left / Right
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={activeAdjustment.x}
              onChange={(event) =>
                updateImageAdjustment("x", Number(event.target.value))
              }
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Up / Down
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={activeAdjustment.y}
              onChange={(event) =>
                updateImageAdjustment("y", Number(event.target.value))
              }
            />
          </label>
        </div>

        <button
          type="button"
          onClick={resetActiveImageAdjustment}
          className="mt-4 w-full rounded-xl border border-[#ca3a3c] px-4 py-2 text-sm font-bold text-[#ca3a3c] transition hover:bg-[#ca3a3c] hover:text-white"
        >
          Reset Adjustment
        </button>
      </div>
    );
  };

  const renderPreview = () => {
    if (magnetType === "Strip Acrylic Magnet Frames") {
      return (
        <div className="relative flex h-[420px] w-[210px] max-w-full items-center justify-center sm:h-[560px] sm:w-[270px]">
          <div className="absolute bottom-8 h-14 w-44 rounded-full bg-black/20 blur-2xl" />
          <div className="relative h-full w-[190px] rounded-[24px] bg-[#d8d5cb]/55 p-3 shadow-[0_26px_55px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur sm:w-[240px] sm:p-5">
            <div className="absolute inset-y-3 left-3 w-3 rounded-l-[24px] bg-white/45 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.16)]" />
            <div className="absolute inset-y-3 right-3 w-3 rounded-r-[24px] bg-black/10" />
            {[0, 1, 2, 3].map((corner) => (
              <div
                key={corner}
                className={`absolute z-20 h-8 w-8 rounded-full bg-gradient-to-br from-white via-[#dedbd1] to-[#aaa59a] shadow-[0_3px_8px_rgba(0,0,0,0.28),inset_0_2px_2px_rgba(255,255,255,0.85)] ${
                  corner === 0
                    ? "left-3 top-3"
                    : corner === 1
                    ? "right-3 top-3"
                    : corner === 2
                    ? "bottom-3 left-3"
                    : "bottom-3 right-3"
                }`}
              />
            ))}
            <div className="relative h-full rounded-[16px] bg-white p-3 shadow-[0_10px_22px_rgba(0,0,0,0.18)] sm:p-4">
              <div className="flex h-full flex-col gap-3">
                {photoSlotColors.map((slotColor, index) => (
                  <div
                    key={slotColor}
                    onClick={() => setActiveImageIndex(index)}
                    className="relative min-h-0 flex-1 overflow-hidden bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  >
                    {renderPhoto(previewImages[index], slotColor, index)}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
                    {previewImages[index] && renderRemoveButton(index)}
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/35 via-transparent to-black/12" />
          </div>
        </div>
      );
    }

    if (magnetType === "Big Acrylic Magnet Frames") {
      return (
        <div className="relative flex h-[340px] w-full max-w-full items-center justify-center sm:h-[500px] sm:w-[380px]">
          <div className="absolute bottom-8 h-14 w-56 rounded-full bg-black/18 blur-2xl" />
          <div className="relative h-[320px] w-[240px] rounded-[24px] bg-[#e8e8e3]/58 p-4 shadow-[0_28px_56px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur sm:h-[480px] sm:w-[360px] sm:p-5">
            <div className="absolute inset-y-3 left-2 w-2 rounded-l-[18px] bg-white/55 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.12)]" />
            <div className="absolute inset-y-3 right-2 w-2 rounded-r-[18px] bg-black/8" />
            {[0, 1, 2, 3].map((corner) => (
              <div
                key={corner}
                className={`absolute z-20 h-7 w-7 rounded-full bg-gradient-to-br from-white via-[#efeee9] to-[#c8c3b8] shadow-[0_2px_7px_rgba(0,0,0,0.22),inset_0_2px_2px_rgba(255,255,255,0.9)] ${
                  corner === 0
                    ? "left-3 top-3"
                    : corner === 1
                    ? "right-3 top-3"
                    : corner === 2
                    ? "bottom-3 left-3"
                    : "bottom-3 right-3"
                }`}
              />
            ))}
            <div className="relative h-full rounded-[14px] bg-white p-3 shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
              <div className="relative h-full overflow-hidden bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
                {renderPhoto(previewImages[0], photoSlotColors[0])}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
                {previewImages[0] && renderRemoveButton(0)}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/35 via-transparent to-black/10" />
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex h-[280px] w-full max-w-full items-center justify-center sm:h-[430px] sm:w-[430px]">
        <div className="absolute bottom-8 h-12 w-64 rounded-full bg-black/18 blur-2xl sm:w-80" />
        <div className="relative h-[230px] w-[230px] rounded-[32px] bg-[#f1f1f1] shadow-[0_24px_46px_rgba(0,0,0,0.22),inset_0_10px_14px_rgba(255,255,255,0.72),inset_0_-14px_22px_rgba(0,0,0,0.14)] sm:h-[340px] sm:w-[340px] sm:rounded-[48px]">
          <div className="relative h-full overflow-hidden rounded-[38px] bg-[#f1f1f1] sm:rounded-[48px]">
            {renderPhoto(previewImages[0], "bg-[#f1f1f1]")}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/45 via-transparent to-black/16" />
            <div className="pointer-events-none absolute left-4 top-4 h-20 w-28 rounded-full bg-white/35 blur-xl sm:h-28 sm:w-40" />
            {previewImages[0] && renderRemoveButton(0)}
          </div>
        </div>
      </div>
    );
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!hasRequiredImages) {
      return;
    }

    const itemId = `custom-${magnetType}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    for (let count = 0; count < quantity; count += 1) {
      addToCart({
        id: itemId,
        name: `Custom ${magnetType}`,
        price: magnetPrices[magnetType],
        category: "Custom Magnets",
        image: previewImages[0],
        customImages: previewImages,
      });
    }

    setCartMessage(`${quantity} custom ${magnetType.toLowerCase()} added.`);
  };

  return (
    <section
      id="customize"
      className="relative min-h-screen overflow-hidden bg-[#f8efe6] px-3 py-10 sm:px-8 lg:px-16 lg:py-24"
    >
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center text-3xl font-black leading-tight text-[#1a1a1a] min-[380px]:text-4xl sm:text-6xl"
      >
        Customize Your Magnet
      </motion.h2>

      <p className="mx-auto mt-3 max-w-[1200px] px-2 text-center text-sm leading-relaxed text-gray-600 sm:mt-5 sm:text-xl">
        Upload your favorite memory and turn it into a premium keepsake.
      </p>

      <div className="mx-auto mt-7 grid w-full max-w-[1200px] grid-cols-1 gap-7 sm:mt-14 lg:mt-20 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative order-2 rounded-[24px] bg-[#ca3a3c] p-4 text-white shadow-[0px_18px_45px_rgba(121,4,5,0.24)] sm:p-10 sm:rounded-[40px] lg:order-none lg:shadow-[0px_24px_70px_rgba(121,4,5,0.28)]"
        >
          <motion.img
            src={customTabHelper}
            alt="Memory Magnets helper"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="pointer-events-none absolute -right-80 top-8 hidden w-44 drop-shadow-2xl xl:block 2xl:-right-90 2xl:w-52"
          />

          <h3 className="mb-4 text-2xl font-bold sm:mb-8 sm:text-3xl">Create Your Magnet</h3>

          <p className="mt-2 text-sm leading-relaxed text-[#ffe1dc] sm:text-base">
            {magnetType === "Strip Acrylic Magnet Frames"
              ? "Upload exactly 3 pictures for a Strip Acrylic Magnet Frame."
              : "Upload 1 picture for this magnet."}
          </p>

          <div className="mt-5 grid gap-3 min-[560px]:grid-cols-3 sm:mt-7 sm:gap-4">
            {magnetTypes.map((type) => {
              const isSelected = magnetType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateMagnetType(type)}
                  className={`flex min-h-20 w-full items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left transition sm:min-h-36 sm:flex-col sm:items-stretch sm:gap-4 sm:rounded-[24px] sm:py-4 ${
                    isSelected
                      ? "border-[#790405] bg-[#f8efe6] text-[#790405] shadow-lg"
                      : "border-[#ffb6b6] bg-[#ffe1dc] text-[#1a1a1a] hover:border-[#790405]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-base font-bold leading-snug sm:text-lg">
                      {type}
                    </span>
                    <span
                      className={`mt-2 block text-sm font-semibold leading-snug ${
                        isSelected ? "text-[#9a1518]" : "text-[#5a0205]/75"
                      }`}
                    >
                      {magnetSizes[type]}
                    </span>
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border sm:self-end ${
                      isSelected
                        ? "border-[#790405] bg-[#ca3a3c] text-white"
                        : "border-[#790405]/30 bg-white text-transparent"
                    }`}
                  >
                    <Check size={18} strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-[#ffb6b6] bg-[#5a0205]/35 px-4 py-3 sm:mt-5 sm:px-5 sm:py-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#ffe1dc]">
              Selected size
            </p>
            <p className="mt-1 text-base font-bold leading-snug text-white sm:text-lg">
              {magnetSizes[magnetType]}
            </p>
          </div>

          <label
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDraggingImage(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingImage(true);
            }}
            onDragLeave={() => setIsDraggingImage(false)}
            onDrop={handleImageDrop}
            className={`mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 text-center transition sm:mt-5 sm:min-h-40 sm:px-5 sm:py-6 ${
              isDraggingImage
                ? "border-[#ffef3f] bg-[#5a0205] text-white"
                : "border-[#ffb6b6] bg-[#f8efe6] text-[#790405]"
            }`}
          >
            <ImagePlus size={34} />
            <span className="mt-3 text-base font-black sm:text-lg">
              Drag & drop {needsThreeImages ? "3 images" : "an image"} here
            </span>
            <span className="mt-1 text-sm font-semibold">
              or tap to browse from your device
            </span>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              multiple={needsThreeImages}
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>

          <input
            type="number"
            placeholder="Quantity"
            min="1"
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Number(event.target.value) || 1))
            }
            className="mt-4 w-full rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] p-4 text-[#1a1a1a] sm:mt-5 sm:p-5"
          />

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!hasRequiredImages}
            className="mt-6 w-full rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-4 text-lg text-white transition hover:border-[#ff9999] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-8 sm:py-5 sm:text-xl lg:hover:scale-105 lg:disabled:hover:scale-100"
          >
            Add To Cart
          </button>
          {cartMessage && (
            <p className="mt-4 text-center text-lg font-semibold text-[#ffe1dc]">
              {cartMessage}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="order-1 flex items-center justify-center lg:order-none"
        >
          <div className="flex w-full flex-col items-center gap-4 sm:gap-6">
            {renderPreview()}
            {renderAdjustmentControls()}
            <p className="text-center text-xl font-bold leading-tight text-[#ca3a3c] sm:text-3xl">
              {magnetType}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CustomizeSection;
