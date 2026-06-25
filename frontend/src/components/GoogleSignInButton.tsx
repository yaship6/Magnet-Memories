import { useEffect, useState } from "react";
import { googleLogin } from "../api/auth";
import type { User } from "../context/StoreContext";

type GoogleSignInButtonProps = {
  onSuccess: (user: User) => void;
  onError: (message: string) => void;
};

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GMAIL_CLIENT_ID;
  const isConfigured = Boolean(clientId);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const handleCredentialResponse = async (response: any) => {
      setLoading(true);
      try {
        const user = await googleLogin({ credential: response.credential });
        onSuccess(user);
      } catch (err) {
        if (err instanceof Error) {
          onError(err.message);
        } else {
          onError("Failed to log in with Google.");
        }
      } finally {
        setLoading(false);
      }
    };

    const initializeGoogleSignIn = () => {
      const g = (window as any).google;
      if (!g || !g.accounts || !g.accounts.id) {
        console.warn("Google Identity Services script is not loaded yet. Retrying...");
        return;
      }

      g.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      g.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: "350px", shape: "pill" }
      );
    };

    // Try initializing, if script is not loaded, check every 200ms
    const checkInterval = setInterval(() => {
      const g = (window as any).google;
      if (g && g.accounts && g.accounts.id) {
        clearInterval(checkInterval);
        initializeGoogleSignIn();
      }
    }, 200);

    return () => {
      clearInterval(checkInterval);
    };
  }, [clientId, isConfigured, onSuccess, onError]);

  const handleMockClick = async () => {
    const email = window.prompt(
      "Google Client ID is not configured (VITE_GOOGLE_CLIENT_ID is missing in your frontend .env).\n\nEnter a Gmail address to simulate a successful Google account login/signup:"
    );
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      const user = await googleLogin({ credential: `mock-google-token:${email}` });
      onSuccess(user);
    } catch (err) {
      if (err instanceof Error) {
        onError(err.message);
      } else {
        onError("Mock Google Sign-In failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center w-full">
      {loading ? (
        <div className="flex items-center justify-center py-2 text-sm text-white font-semibold">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </div>
      ) : isConfigured ? (
        <div id="google-signin-btn" className="w-full flex justify-center min-h-[46px]" />
      ) : (
        <button
          type="button"
          onClick={handleMockClick}
          className="flex w-[350px] max-w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-98"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
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
          Continue with Google (Sandbox)
        </button>
      )}
    </div>
  );
}
