import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import stallImage1 from "../../WhatsApp Image 2026-01-25 at 21.06.49 (1).jpeg";
import stallImage2 from "../../WhatsApp Image 2026-01-25 at 21.06.49 (2).jpeg";
import stallImage3 from "../../WhatsApp Image 2026-01-25 at 21.06.49.jpeg";
import stallImage4 from "../../WhatsApp Image 2026-01-25 at 21.06.50 (1).jpeg";
import stallImage5 from "../../WhatsApp Image 2026-01-25 at 21.06.50.jpeg";
import stallImage6 from "../../WhatsApp Image 2026-01-25 at 21.06.55.jpeg";
import stallImage8 from "../../WhatsApp Image 2026-05-27 at 16.08.20 (1).jpeg";
import stallImage9 from "../../WhatsApp Image 2026-05-27 at 16.08.20.jpeg";
import stallImage10 from "../../WhatsApp Image 2026-05-27 at 16.08.24.jpeg";
import stallImage11 from "../../WhatsApp Image 2026-05-28 at 04.06.13.jpeg";
import stallImage12 from "../../WhatsApp Image 2026-05-28 at 04.06.56.jpeg";
import stallImage13 from "../../WhatsApp Image 2026-05-28 at 04.07.25.jpeg";
import stallImage14 from "../../WhatsApp Image 2026-05-28 at 04.07.48.jpeg";
import stallImage15 from "../../WhatsApp Image 2026-05-28 at 04.08.43.jpeg";
import stallVideo1 from "../../WhatsApp Video 2026-01-25 at 21.06.53.mp4";
import stallVideo2 from "../../WhatsApp Video 2026-05-27 at 16.08.24.mp4";

const stallMedia = [
  { type: "image", src: stallImage1 },
  { type: "image", src: stallImage2 },
  { type: "image", src: stallImage3 },
  { type: "video", src: stallVideo1 },
  { type: "image", src: stallImage4 },
  { type: "image", src: stallImage5 },
  { type: "image", src: stallImage6 },
  { type: "image", src: stallImage8 },
  { type: "video", src: stallVideo2 },
  { type: "image", src: stallImage9 },
  { type: "image", src: stallImage10 },
  { type: "image", src: stallImage11 },
  { type: "image", src: stallImage12 },
  { type: "image", src: stallImage13 },
  { type: "image", src: stallImage14 },
  { type: "image", src: stallImage15 },
];

const stallSections = [
  { name: "Panchsheel", media: stallMedia.slice(0, 6), startIndex: 0 },
  { name: "Gardenia", media: stallMedia.slice(6, 11), startIndex: 6 },
  { name: "Stall", media: stallMedia.slice(11), startIndex: 11 },
];

function SocietyStallsGallery() {
  const [activeMedia, setActiveMedia] = useState<number | null>(null);

  const showPreviousMedia = () => {
    setActiveMedia((current) => {
      if (current === null) return current;
      return current === 0 ? stallMedia.length - 1 : current - 1;
    });
  };

  const showNextMedia = () => {
    setActiveMedia((current) => {
      if (current === null) return current;
      return current === stallMedia.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <section className="mx-auto mt-16 w-full max-w-[1200px] sm:mt-20">
      <h2 className="text-3xl font-black text-[#2f9f9a] sm:text-4xl">
        Society Stalls
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-xl">
        A glimpse of Memory Magnets stalls, customer moments, and our favorite
        display setups.
      </p>

      <div className="mt-10 space-y-14 sm:mt-14 sm:space-y-20">
        {stallSections.map((section) => (
          <section key={section.name}>
            <h3 className="text-2xl font-black text-[#ce272a] sm:text-3xl">
              {section.name}
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] sm:gap-6">
              {section.media.map((media, index) => {
                const mediaIndex = section.startIndex + index;

                return (
                  <button
                    key={media.src}
                    type="button"
                    onClick={() => setActiveMedia(mediaIndex)}
                    className="relative aspect-square w-full overflow-hidden rounded-[20px] shadow-xl sm:aspect-[4/3] sm:rounded-[28px]"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.src}
                        alt={`${section.name} Memory Magnets stall ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    ) : (
                      <>
                        <video
                          src={media.src}
                          muted
                          playsInline
                          className="h-full w-full object-cover transition hover:scale-105"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#ce272a] shadow-xl">
                            <Play size={28} fill="currentColor" />
                          </span>
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {activeMedia !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 sm:px-8">
          <button
            type="button"
            onClick={() => setActiveMedia(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl sm:right-8 sm:top-8 sm:h-12 sm:w-12"
            aria-label="Close image"
          >
            <X size={26} />
          </button>

          <button
            type="button"
            onClick={showPreviousMedia}
            className="absolute bottom-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl sm:bottom-auto sm:left-8 sm:h-14 sm:w-14"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>

          {stallMedia[activeMedia].type === "image" ? (
            <img
              src={stallMedia[activeMedia].src}
              alt={`Memory Magnets society stall ${activeMedia + 1}`}
              className="max-h-[78vh] max-w-[92vw] rounded-[20px] object-contain shadow-2xl sm:max-h-[86vh] sm:max-w-[82vw] sm:rounded-[28px]"
            />
          ) : (
            <video
              src={stallMedia[activeMedia].src}
              controls
              autoPlay
              className="max-h-[78vh] max-w-[92vw] rounded-[20px] object-contain shadow-2xl sm:max-h-[86vh] sm:max-w-[82vw] sm:rounded-[28px]"
            />
          )}

          <button
            type="button"
            onClick={showNextMedia}
            className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl sm:bottom-auto sm:right-8 sm:h-14 sm:w-14"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
}

export default SocietyStallsGallery;
