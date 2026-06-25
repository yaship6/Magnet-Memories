import { useState, type FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";
import { loginUser } from "../api/auth";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Login() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const user = await loginUser({ email, password });
      setAuthenticatedUser(user);
      navigate("/shop");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Could not connect to the login server."
        );
        return;
      }

      setError("Invalid email or password.");
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
          <h1 className="text-4xl font-black sm:text-5xl">Login</h1>
          <p className="mt-4 text-base text-[#ffe1dc] sm:text-xl">
            Save your cart and keep your Memory Magnets together.
          </p>

          <label className="mt-8 flex flex-col gap-2 text-lg font-semibold">
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

          <div className="mt-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Password</span>
              <Link
                to="/forgot-password"
                className="text-sm font-normal text-[#ffe1dc] hover:text-white underline transition"
              >
                Forgot password?
              </Link>
            </div>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
            />
          </div>

          {error && <p className="mt-4 text-lg font-semibold text-[#ffe1dc]">{error}</p>}

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-4 text-lg font-semibold text-white transition hover:scale-105 hover:border-[#ff9999] sm:py-5 sm:text-xl"
          >
            Login
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
            New here?{" "}
            <Link to="/signup" className="font-bold text-white underline">
              Create an account
            </Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
