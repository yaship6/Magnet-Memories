import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { forgotPassword, resetPassword } from "../api/auth";

type Step = "request" | "reset" | "success";

function ForgotPassword() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailSent, setEmailSent] = useState(true);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setDebugCode(null);

    try {
      const response = await forgotPassword(email);
      setEmailSent(response.emailSent);
      
      if (!response.emailSent && response.debugCode) {
        setDebugCode(response.debugCode);
      }
      
      setSuccessMessage(response.message);
      setStep("reset");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send reset code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ email, code, newPassword });
      setStep("success");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reset password. Please verify the code and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8efe6] text-[#1a1a1a]">
      <Navbar />

      <main className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-8 sm:py-20">
        <div className="w-full max-w-xl rounded-[28px] bg-[#ca3a3c] p-5 text-white shadow-[0px_24px_70px_rgba(121,4,5,0.28)] sm:rounded-[40px] sm:p-10 transition-all duration-300">
          
          {step === "request" && (
            <form onSubmit={handleRequestCode}>
              <h1 className="text-4xl font-black sm:text-5xl">Forgot Password</h1>
              <p className="mt-4 text-base text-[#ffe1dc] sm:text-xl">
                Enter your email address and we'll send you a 6-digit code to reset your password.
              </p>

              <label className="mt-8 flex flex-col gap-2 text-lg font-semibold">
                Email Address
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                />
              </label>

              {error && <p className="mt-4 text-lg font-semibold text-[#ffe1dc]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-4 text-lg font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] hover:border-[#ff9999] disabled:opacity-50 sm:py-5 sm:text-xl"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>

              <p className="mt-5 text-center text-base text-[#ffe1dc] sm:text-lg">
                Remember your password?{" "}
                <Link to="/login" className="font-bold text-white underline">
                  Back to Login
                </Link>
              </p>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword}>
              <h1 className="text-4xl font-black sm:text-5xl">Reset Password</h1>
              <p className="mt-4 text-base text-[#ffe1dc] sm:text-xl">
                {successMessage}
              </p>

              {!emailSent && (
                <div className="mt-4 rounded-xl bg-[#5a0205] border border-[#ffb6b6] p-4 text-sm text-[#ffe1dc]">
                  <p className="font-bold text-white mb-1">Local Testing Mode:</p>
                  <p>Email service is not configured. We have printed the reset code in the server terminal.</p>
                  {debugCode && (
                    <p className="mt-2 font-mono text-base text-yellow-300">
                      Reset Code: <span className="font-black bg-[#ca3a3c] px-2 py-0.5 rounded">{debugCode}</span>
                    </p>
                  )}
                </div>
              )}

              <label className="mt-6 flex flex-col gap-2 text-lg font-semibold">
                6-Digit Verification Code
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none tracking-widest text-center font-bold text-2xl"
                />
              </label>

              <label className="mt-5 flex flex-col gap-2 text-lg font-semibold">
                New Password
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                />
              </label>

              <label className="mt-5 flex flex-col gap-2 text-lg font-semibold">
                Confirm New Password
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat new password"
                  className="rounded-2xl border border-[#ffb6b6] bg-[#f8efe6] px-5 py-4 text-[#1a1a1a] outline-none"
                />
              </label>

              {error && <p className="mt-4 text-lg font-semibold text-[#ffe1dc]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-4 text-lg font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] hover:border-[#ff9999] disabled:opacity-50 sm:py-5 sm:text-xl"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setError("");
                }}
                className="mt-4 w-full text-center text-base text-[#ffe1dc] hover:text-white underline transition"
              >
                Change email or request new code
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-[#5a0205] p-5 border-2 border-[#ffb6b6]">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-black sm:text-5xl">Success!</h1>
              <p className="mt-4 text-base text-[#ffe1dc] sm:text-xl">
                Your password has been successfully reset.
              </p>
              
              <Link
                to="/login"
                className="mt-8 inline-block w-full rounded-2xl border-2 border-[#790405] bg-[#5a0205] py-4 text-lg font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] hover:border-[#ff9999] sm:py-5 sm:text-xl"
              >
                Go to Login
              </Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ForgotPassword;
