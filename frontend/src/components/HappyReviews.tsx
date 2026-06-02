import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import customerReviewImage from "../../WhatsApp Image 2026-05-27 at 16.04.35.jpeg";
import customerReviewImage2 from "../../WhatsApp Image 2026-05-27 at 16.08.20.jpeg";
import customerReviewImage3 from "../../WhatsApp Image 2026-05-27 at 16.08.24.jpeg";

const reviews = [
  {
    image: customerReviewImage,
    title: "Loved the final magnets!",
    text: "The customer really liked the order and loved how their memory turned into a cute keepsake. The finish, colors, and overall look made the magnets feel special and gift-worthy.",
  },
  {
    image: customerReviewImage2,
    title: "Perfect for gifting",
    text: "The magnets came out bright, neat, and personal. The customer loved the quality and felt it was a thoughtful gift for friends and family.",
  },
  {
    image: customerReviewImage3,
    title: "Cute and memorable",
    text: "The customer liked how the photos looked as magnets and appreciated the clean finish. It made their favorite memories feel easy to display every day.",
  },
];

function HappyReviews() {
  const [activeReview, setActiveReview] = useState(0);
  const review = reviews[activeReview];

  const showPreviousReview = () => {
    setActiveReview((current) =>
      current === 0 ? reviews.length - 1 : current - 1
    );
  };

  const showNextReview = () => {
    setActiveReview((current) =>
      current === reviews.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="bg-[#f8efe6] px-4 pb-12 pt-2 sm:px-8 sm:pt-4 lg:px-16 lg:pb-20 lg:pt-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[24px] border border-[#ce272a]/25 bg-[#ffbcbc] p-5 shadow-xl sm:rounded-[32px] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2 className="text-3xl font-black text-[#ce272a] sm:text-4xl">
            Happy Customer Reviews
          </h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={showPreviousReview}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2f9f9a]/40 bg-white text-[#2f9f9a]"
              aria-label="Previous review"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={showNextReview}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2f9f9a]/40 bg-white text-[#2f9f9a]"
              aria-label="Next review"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <img
            src={review.image}
            alt="Customer feedback for Memory Magnets"
            className="h-56 w-full rounded-[20px] object-cover sm:h-72 sm:rounded-[24px]"
          />

          <div className="min-w-0">
            <p className="text-xl font-black text-[#2f9f9a] sm:text-2xl">
              "{review.title}"
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
              {review.text}
            </p>
            <div className="mt-6 flex gap-2">
              {reviews.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveReview(index)}
                  className={`h-2.5 rounded-full transition ${
                    activeReview === index
                      ? "w-8 bg-[#ce272a]"
                      : "w-2.5 bg-[#2f9f9a]/35"
                  }`}
                  aria-label={`Show review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HappyReviews;
