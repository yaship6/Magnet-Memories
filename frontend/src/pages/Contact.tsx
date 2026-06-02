import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Send,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { createContactMessage } from "../api/contact";
import founderImage from "../../WhatsApp Image 2026-05-28 at 18.37.14.jpeg";

const phoneNumber = "+91 70427 36597";
const phoneHref = "tel:+917042736597";
const whatsappHref =
  "https://wa.me/917042736597?text=Hi%20The%20Memory%20Magnets%2C%20I%20want%20to%20ask%20about%20an%20order.";
const instagramHref = "https://www.instagram.com/the.memory.magnets";
const mapHref =
  "https://www.google.com/maps/search/?api=1&query=Gardenia%2C%20Crossings%20Republik%2C%20Ghaziabad%20201016";

const contactActions = [
  {
    icon: Phone,
    title: "Call",
    text: phoneNumber,
    href: phoneHref,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    text: "Fastest for custom orders",
    href: whatsappHref,
  },
  {
    icon: FaInstagram,
    title: "Instagram",
    text: "@the.memory.magnets",
    href: instagramHref,
  },
  {
    icon: MapPin,
    title: "Visit Area",
    text: "Crossings Republik, Ghaziabad",
    href: mapHref,
  },
];

function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState("Custom order");
  const [message, setMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await createContactMessage({
        name,
        phone,
        requestType,
        message,
      });

      setName("");
      setPhone("");
      setRequestType("Custom order");
      setMessage("");
      setSubmitMessage("Message saved. We will get back to you soon.");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not submit contact message."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="min-h-[95vh] px-4 py-12 sm:px-8 lg:px-16 lg:py-24">
        <section className="mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="inline-flex items-center gap-2 rounded-full bg-[#ffbcbc] px-4 py-2 text-base font-black text-[#790405]">
                <Sparkles size={18} />
                Custom magnets, stalls, and gifting
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight text-[#ce272a] sm:text-6xl">
                Contact Us
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-xl">
                Reach out for custom photo magnets, society stalls, bulk gifting,
                order questions, or a design idea you want us to bring to life.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="rounded-[28px] border border-[#2f9f9a]/30 bg-[#fffaf7] p-5 shadow-xl sm:rounded-[36px] sm:p-6"
            >
              <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[150px_1fr]">
                <div className="mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-[24px] sm:max-w-none">
                  <img
                    src={founderImage}
                    alt="Sanjana Trivedi and Gaurav Dubey"
                    className="h-full w-full scale-110 object-cover object-[50%_18%]"
                  />
                </div>
                <div>
                  <UserRound className="mb-3 text-[#2f9f9a]" size={34} />
                  <h2 className="text-2xl font-black text-[#ce272a] sm:text-3xl">
                    Founders
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-gray-700 sm:text-lg">
                    Sanjana Trivedi & Gaurav Dubey
                  </p>
                  <p className="mt-3 text-base font-semibold text-[#790405]">
                    We usually reply fastest on WhatsApp or Instagram.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <motion.a
                  key={action.title}
                  href={action.href}
                  target={action.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    action.href.startsWith("http") ? "noreferrer" : undefined
                  }
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2 + index * 0.08 }}
                  className="rounded-[28px] border border-[#2f9f9a]/30 bg-[#fffaf7] p-5 shadow-lg transition hover:-translate-y-1 hover:border-[#ce272a]/50"
                >
                  <Icon className="text-[#2f9f9a]" size={32} />
                  <h2 className="mt-4 text-xl font-black text-[#ce272a] sm:text-2xl">
                    {action.title}
                  </h2>
                  <p className="mt-2 text-base font-semibold leading-relaxed text-gray-700">
                    {action.text}
                  </p>
                </motion.a>
              );
            })}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.form
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              onSubmit={handleSubmit}
              className="rounded-[28px] bg-[#ca3a3c] p-5 text-white shadow-[0px_24px_70px_rgba(121,4,5,0.28)] sm:rounded-[36px] sm:p-8"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <Mail className="shrink-0" size={34} />
                <h2 className="min-w-0 text-3xl font-black sm:text-4xl">Send a Message</h2>
              </div>
              <p className="mt-3 text-lg text-[#ffe1dc]">
                Share what you need and we will get back to you with next steps.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-lg font-semibold">
                  Name
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-lg font-semibold">
                  Phone
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Your phone number"
                    className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                  />
                </label>
              </div>

              <label className="mt-5 flex flex-col gap-2 text-lg font-semibold">
                What can we help with?
                <select
                  value={requestType}
                  onChange={(event) => setRequestType(event.target.value)}
                  className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                >
                  <option>Custom order</option>
                  <option>Bulk gifting</option>
                  <option>Society stall</option>
                  <option>Existing order</option>
                  <option>Other question</option>
                </select>
              </label>

              <label className="mt-5 flex flex-col gap-2 text-lg font-semibold">
                Message
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us your idea, quantity, deadline, or order question"
                  className="resize-none rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                />
              </label>

              {submitError && (
                <p className="mt-5 rounded-2xl bg-[#f8efe6] px-5 py-3 text-base font-semibold text-[#ce272a]">
                  {submitError}
                </p>
              )}

              {submitMessage && (
                <p className="mt-5 rounded-2xl bg-[#f8efe6] px-5 py-3 text-base font-semibold text-[#2f9f9a]">
                  {submitMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#790405] bg-[#5a0205] px-8 py-4 text-lg font-semibold text-white transition hover:scale-105 hover:border-[#ff9999] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:w-auto sm:text-xl"
              >
                <Send size={22} />
                {isSubmitting ? "Saving..." : "Send Message"}
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="grid gap-5"
            >
              <div className="rounded-[28px] border border-[#2f9f9a]/30 bg-[#fffaf7] p-6 shadow-lg">
                <MapPin className="text-[#2f9f9a]" size={32} />
                <h2 className="mt-4 text-2xl font-black text-[#ce272a]">
                  Address
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  Gardenia, Crossings Republik, Ghaziabad, 201016
                </p>
              </div>

              <div className="rounded-[28px] border border-[#2f9f9a]/30 bg-[#fffaf7] p-6 shadow-lg">
                <Clock className="text-[#2f9f9a]" size={32} />
                <h2 className="mt-4 text-2xl font-black text-[#ce272a]">
                  Reply Window
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  Messages are usually answered within a day. For urgent orders,
                  WhatsApp is best.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-[28px] border border-[#2f9f9a]/30 bg-[#fffaf7] p-5 shadow-lg">
                  <PackageCheck className="text-[#2f9f9a]" size={30} />
                  <h3 className="mt-4 text-xl font-black text-[#ce272a]">
                    Orders
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-700">
                    Custom photo magnets, acrylic frames, and keepsake gifts.
                  </p>
                </div>

                <div className="rounded-[28px] border border-[#2f9f9a]/30 bg-[#fffaf7] p-5 shadow-lg">
                  <Store className="text-[#2f9f9a]" size={30} />
                  <h3 className="mt-4 text-xl font-black text-[#ce272a]">
                    Stalls
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-700">
                    Society stalls, events, and gifting counters.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
