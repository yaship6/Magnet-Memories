import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { createFeedback } from "../api/feedback";
import { useStore } from "../context/StoreContext";
import feedbackCharacter from "../assets/customer-feedback-character.png";

function OrderFeedback() {
  const { user } = useStore();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState(user?.name ?? "");
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      <main className="min-h-[95vh] px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
        <section className="mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_260px]">
            <div>
              <h1 className="text-4xl font-black leading-tight text-[#ce272a] sm:text-6xl">
                Order Feedback
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 sm:mt-5 sm:text-xl">
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
              className="mt-10 grid gap-6 rounded-[24px] border border-[#ce272a]/25 bg-[#ffbcbc] p-5 shadow-xl sm:rounded-[32px] sm:p-10"
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
              className="w-full justify-self-start rounded-full bg-[#ce272a] px-8 py-4 text-base font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:w-auto sm:text-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>

        </section>
      </main>

      <Footer />
    </div>
  );
}

export default OrderFeedback;
