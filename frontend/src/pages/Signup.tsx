import { useState, type FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { signupUser } from "../api/auth";
import { useStore } from "../context/StoreContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Signup() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useStore();
  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const user = await signupUser({ name, gmail, password });
      setAuthenticatedUser(user);
      navigate("/shop");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Could not connect to the signup server."
        );
        return;
      }

      setError("Could not create account. Try again.");
    }
  };

  const handleGoogleSuccess = (user: any) => {
    setAuthenticatedUser(user);
    navigate("/shop");
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-8 sm:py-20">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl rounded-[28px] bg-[#ca3a3c] p-5 text-white shadow-[0px_24px_70px_rgba(121,4,5,0.28)] sm:rounded-[40px] sm:p-10"
        >
          <h1 className="text-4xl font-black sm:text-5xl">Signup</h1>
          <p className="mt-4 text-base text-[#ffe1dc] sm:text-xl">
            Create your account and keep your cart saved.
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
            Gmail
            <input
              required
              type="email"
              value={gmail}
              onChange={(event) => setGmail(event.target.value)}
              placeholder="yourgmail@gmail.com"
              className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
            />
          </label>

          <label className="mt-5 flex flex-col gap-2 text-lg font-semibold">
            Password
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
            />
          </label>

          {error && <p className="mt-4 text-lg font-semibold text-[#ffe1dc]">{error}</p>}

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-4 text-lg font-semibold text-white transition hover:scale-105 hover:border-[#ff9999] sm:py-5 sm:text-xl"
          >
            Create Account
          </button>

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="h-[1px] flex-1 bg-[#ffb6b6]/40" />
            <span className="text-sm font-semibold text-[#ffe1dc]/70">or</span>
            <span className="h-[1px] flex-1 bg-[#ffb6b6]/40" />
          </div>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />

          <p className="mt-5 text-center text-base text-[#ffe1dc] sm:text-lg">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-white underline">
              Login
            </Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Signup;
