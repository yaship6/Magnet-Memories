import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ArrowLeft, Loader2 } from "lucide-react";
import { googleLogin } from "../api/auth";
import type { User as StoreUser } from "../context/StoreContext";

type GoogleSignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: StoreUser) => void;
};

type Profile = {
  name: string;
  gmail: string;
  avatarColor: string;
};

const mockProfiles: Profile[] = [
  { name: "Yash", gmail: "yashi@gmail.com", avatarColor: "bg-blue-500" },
  { name: "Guest User", gmail: "guest@gmail.com", avatarColor: "bg-emerald-500" },
];

export default function GoogleSignInModal({ isOpen, onClose, onSuccess }: GoogleSignInModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  const handleSelectProfile = async (profile: { name: string; gmail: string }) => {
    setLoading(true);
    setError("");

    try {
      const user = await googleLogin({ credential: `mock-google-token:${profile.gmail}:${profile.name}` });
      onSuccess(user);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign in with Google.");
      }
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      setError("Please fill in both name and Gmail address.");
      return;
    }
    if (!customEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    handleSelectProfile({ name: customName, gmail: customEmail });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[28px] bg-white p-6 text-[#1a1a1a] shadow-2xl md:p-8"
          >
            {/* Header close button */}
            {!loading && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            )}

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="mt-4 text-lg font-semibold text-gray-700">Connecting with Google...</p>
                <p className="mt-1 text-sm text-gray-500">Signing into Memory Magnets</p>
              </div>
            ) : (
              <div>
                {/* Google Logo */}
                <div className="flex justify-center">
                  <svg className="h-8 w-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>

                {!showCustomForm ? (
                  <>
                    <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-gray-800">
                      Choose an account
                    </h2>
                    <p className="mt-1 text-center text-sm text-gray-500">
                      to continue to <span className="font-semibold text-gray-700">Memory Magnets</span>
                    </p>

                    {error && (
                      <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                        {error}
                      </div>
                    )}

                    {/* Account list */}
                    <div className="mt-6 space-y-2">
                      {mockProfiles.map((profile) => (
                        <button
                          key={profile.gmail}
                          onClick={() => handleSelectProfile(profile)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 p-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${profile.avatarColor}`}
                          >
                            {profile.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-800">{profile.name}</p>
                            <p className="truncate text-xs text-gray-500">{profile.gmail}</p>
                          </div>
                        </button>
                      ))}

                      {/* Use another account button */}
                      <button
                        onClick={() => {
                          setShowCustomForm(true);
                          setError("");
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-gray-300 p-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                          <User size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-700">Use another account</p>
                          <p className="text-xs text-gray-400">Sign in with a different Gmail address</p>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleCustomSubmit} className="mt-4">
                    <div className="mb-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomForm(false);
                          setError("");
                        }}
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <h2 className="text-lg font-bold text-gray-800">Add an account</h2>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                        Full Name
                        <input
                          required
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Your Name"
                          className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-700">
                        Gmail Address
                        <input
                          required
                          type="email"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </label>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
                      >
                        Next
                      </button>
                    </div>
                  </form>
                )}

                {/* Footer disclaimer */}
                <p className="mt-8 text-center text-xs leading-normal text-gray-400">
                  To continue, Google will share your name, email address, and profile picture with Memory Magnets.
                  Before using this app, review their <span className="underline cursor-pointer hover:text-gray-500">privacy policy</span> and <span className="underline cursor-pointer hover:text-gray-500">terms of service</span>.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
