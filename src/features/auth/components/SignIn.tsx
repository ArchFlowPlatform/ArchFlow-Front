"use client";

import { useState, type FormEvent } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import OAuthButtons, {
  type OAuthProvider,
} from "@/components/auth/OAuthButtons";
import {
  DEFAULT_LOADING_DURATION_MS,
  startTimedGlobalLoading,
} from "@/hooks/useGlobalLoading";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { login } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";

const primaryButtonClassName =
  "af-surface-sm af-surface-hover af-focus-ring inline-flex h-11 w-full items-center justify-center bg-[#14121a] px-5 text-sm font-semibold text-white transition hover:brightness-110 sm:h-12";

const auxiliaryLinkClassName =
  "text-sm text-white/68 underline decoration-white/18 underline-offset-4 transition hover:text-white hover:decoration-white/42";

function Divider() {
  return (
    <div className="flex items-center gap-4 text-sm text-white/44">
      <div className="af-divider-line flex-1" />
      <span className="uppercase tracking-[0.22em] text-[11px]">or</span>
      <div className="af-divider-line flex-1" />
    </div>
  );
}

export default function SignIn() {
  const { navigate } = useAppNavigate();
  const { setUser, refetchUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = (provider: OAuthProvider) => {
    console.log(`oauth: ${provider}`);
    startTimedGlobalLoading("auth", DEFAULT_LOADING_DURATION_MS + 180);
    navigate("/projects", { withLoading: false });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await login({ email, password });
      if (response.success) {
        // Backend sets httpOnly cookie; use user from response or refetch from /me
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          await refetchUser();
        }
        startTimedGlobalLoading("auth", DEFAULT_LOADING_DURATION_MS + 180);
        navigate("/projects", { withLoading: false });
      } else {
        setError(response.message ?? "Falha no login. Verifique suas credenciais.");
      }
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Sign in to ArchFlow"
        subtitle="Continue with a provider or use your email and password."
      >
        <div className="space-y-4 sm:space-y-6">
          <OAuthButtons onProviderClick={handleOAuth} />

          <Divider />

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            ) : null}
            <AuthInput
              required
              type="email"
              name="email"
              label="Email"
              autoComplete="email"
              placeholder="your@email.com"
            />

            <AuthInput
              required
              type="password"
              name="password"
              label="Password"
              autoComplete="current-password"
              placeholder="correct horse battery staple"
            />

            <button
              type="submit"
              className={primaryButtonClassName}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando…" : "Sign in"}
            </button>
          </form>

          <div className="flex flex-col items-start gap-2.5 sm:gap-3">

            <p className="text-sm text-white/68">
              Need an account?{" "}
              <a href="/signup" className={auxiliaryLinkClassName}>
                Sign up
              </a>
            </p>

            <button
              type="button"
              onClick={() => console.log("auth: reset-password")}
              className={auxiliaryLinkClassName}
            >
              Forgot your password? Reset it
            </button>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
