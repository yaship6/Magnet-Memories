import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { createFeedback } from "../api/feedback";
import { useStore } from "../context/StoreContext";
import feedbackCharacter from "../assets/customer-feedback-character.png";
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

function OrderFeedback() {
  const { user } = useStore();
  const [activeReview, setActiveReview] = useState(0);
  const [name, setName] = useState(user?.name ?? "");
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await createFeedback({
        customer: user,
        name,
        orderId,
        rating,
        feedback,
      });

      setSubmitMessage("Thank you! Your feedback has been submitted.");
      setOrderId("");
      setRating(5);
      setFeedback("");

      if (!user) {
        setName("");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not submit feedback. Please try again.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[95vh] px-5 py-16 sm:px-8 lg:px-16 lg:py-20">
        <section className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_260px]">
            <div>
              <h1 className="text-5xl font-black leading-tight text-[#ce272a] sm:text-6xl">
                Order Feedback
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-gray-700">
                Tell us how your Memory Magnets order went. Your feedback helps
                us make every custom keepsake better.
              </p>
            </div>

            <img
              src={feedbackCharacter}
              alt="Happy customer holding a memory magnet"
              className="mx-auto w-48 drop-shadow-2xl md:w-full"
            />
          </div>

          <form
            onSubmit={handleSubmitFeedback}
            className="mt-10 grid gap-6 rounded-[32px] border border-[#ce272a]/25 bg-[#ffbcbc] p-5 shadow-xl sm:p-10"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-lg font-semibold">
                Name
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="rounded-2xl border border-[#2f9f9a]/40 bg-white px-5 py-4 text-base font-normal outline-none focus:border-[#ce272a]"
                />
              </label>

              <label className="flex flex-col gap-2 text-lg font-semibold">
                Order ID
                <input
                  type="text"
                  placeholder="Order number"
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  required
                  className="rounded-2xl border border-[#2f9f9a]/40 bg-white px-5 py-4 text-base font-normal outline-none focus:border-[#ce272a]"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-lg font-semibold">
              Rating
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="rounded-2xl border border-[#2f9f9a]/40 bg-white px-5 py-4 text-base font-normal outline-none focus:border-[#ce272a]"
              >
                <option value={5}>5 - Loved it</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Okay</option>
                <option value={2}>2 - Needs improvement</option>
                <option value={1}>1 - Not satisfied</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-lg font-semibold">
              Feedback
              <textarea
                placeholder="Share your experience"
                rows={6}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                required
                className="resize-none rounded-2xl border border-[#2f9f9a]/40 bg-white px-5 py-4 text-base font-normal outline-none focus:border-[#ce272a]"
              />
            </label>

            {submitError && (
              <p className="rounded-2xl bg-white px-5 py-3 text-base font-semibold text-[#ce272a]">
                {submitError}
              </p>
            )}

            {submitMessage && (
              <p className="rounded-2xl bg-white px-5 py-3 text-base font-semibold text-[#2f9f9a]">
                {submitMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="justify-self-start rounded-full bg-[#ce272a] px-8 py-4 text-lg font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>

          <section className="mt-8 rounded-[32px] border border-[#ce272a]/25 bg-[#ffbcbc] p-5 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <h2 className="text-2xl font-black text-[#ce272a] sm:text-3xl">
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
                className="h-72 w-full rounded-[24px] object-cover"
              />

              <div>
                <p className="text-2xl font-black text-[#2f9f9a]">
                  "{review.title}"
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-700">
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
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default OrderFeedback;
