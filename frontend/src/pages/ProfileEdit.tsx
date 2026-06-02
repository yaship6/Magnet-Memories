import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { updateProfile } from "../api/auth";
import { useStore } from "../context/StoreContext";

function ProfileEdit() {
  const { user, updateAuthenticatedUser } = useStore();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? user?.gmail ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const updatedUser = await updateProfile({
        id: user.id,
        currentEmail: user.email,
        name,
        phone,
        email,
      });

      updateAuthenticatedUser(updatedUser);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-8 sm:py-20">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl rounded-[28px] bg-[#ca3a3c] p-5 text-white shadow-[0px_24px_70px_rgba(121,4,5,0.28)] sm:rounded-[40px] sm:p-10"
        >
          <h1 className="text-4xl font-black sm:text-5xl">Profile Edit</h1>
          <p className="mt-4 text-base text-[#ffe1dc] sm:text-xl">
            Keep your account details ready for orders.
          </p>

          <label className="mt-8 flex flex-col gap-2 text-lg font-semibold">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
            />
          </label>

          <label className="mt-5 flex flex-col gap-2 text-lg font-semibold">
            Phone Number
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Your phone number"
              className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
            />
          </label>

          <label className="mt-5 flex flex-col gap-2 text-lg font-semibold">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
            />
          </label>

          {error && (
            <p className="mt-4 text-lg font-semibold text-[#ffe1dc]">{error}</p>
          )}

          {message && (
            <p className="mt-4 text-lg font-semibold text-[#ffe1dc]">
              {message}
            </p>
          )}

          <div className="mt-8 grid gap-3 sm:flex sm:items-center sm:gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl border-2 border-[#790405] bg-[#5a0205] px-8 py-4 text-lg font-semibold text-white transition hover:scale-105 hover:border-[#ff9999] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:text-xl"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            <Link
              to="/shop"
              className="rounded-2xl border-2 border-[#790405] bg-[#f8efe6] px-8 py-4 text-center text-lg font-semibold text-[#790405] sm:text-xl"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default ProfileEdit;
