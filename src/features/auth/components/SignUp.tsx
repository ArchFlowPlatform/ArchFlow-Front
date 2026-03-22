"use client";

import { useState, type FormEvent } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import OAuthButtons, {
  type OAuthProvider,
} from "@/components/auth/OAuthButtons";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  DEFAULT_LOADING_DURATION_MS,
  startTimedGlobalLoading,
} from "@/hooks/useGlobalLoading";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { createUser } from "@/features/users/api/users.api";
import { login } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import {
  buildCreateUserPayload,
  validateSignUpPayload,
} from "../utils/signUpPayload";
import AuthLayout from "./AuthLayout";

const primaryButtonClassName =
  "af-surface-sm af-surface-hover af-focus-ring inline-flex h-11 w-full items-center justify-center bg-[#14121a] px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12";

const inlineLinkClassName =
  "text-white/78 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white/42";

function Divider() {
  return (
    <div className="flex items-center gap-4 text-sm text-white/44">
      <div className="af-divider-line flex-1" />
      <span className="uppercase tracking-[0.22em] text-[11px]">or</span>
      <div className="af-divider-line flex-1" />
    </div>
  );
}

export default function SignUp() {
  const { navigate } = useAppNavigate();
  const { setUser, refetchUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = (provider: OAuthProvider) => {
    console.log(`oauth: ${provider}`);
    startTimedGlobalLoading("signup", DEFAULT_LOADING_DURATION_MS + 180);
    navigate("/projects", { withLoading: false });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = buildCreateUserPayload(formData);

    const validationError = validateSignUpPayload(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await createUser(payload);

      const loginResponse = await login({
        email: payload.email,
        password: payload.password,
      });

      if (loginResponse.success) {
        if (loginResponse.data?.user) {
          setUser(loginResponse.data.user);
        } else {
          await refetchUser();
        }
        startTimedGlobalLoading("signup", DEFAULT_LOADING_DURATION_MS + 180);
        navigate("/projects", { withLoading: false });
      } else {
        setError(
          loginResponse.message ??
            "Conta criada, mas não foi possível entrar automaticamente. Acesse a página de login.",
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível criar a conta."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create an account"
        subtitle="Start with a provider or create your ArchFlow credentials."
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
              type="text"
              name="name"
              label="Name"
              autoComplete="name"
              placeholder="Your name"
            />

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
            />

            <AuthInput
              type="url"
              name="avatarUrl"
              label="Avatar URL (optional)"
              autoComplete="photo"
              placeholder="https://…"
            />

            <p className="text-sm leading-relaxed text-white/58">
              By signing up you agree to our{" "}
              <a href="#" className={inlineLinkClassName}>
                terms of service
              </a>{" "}
              and{" "}
              <a href="#" className={inlineLinkClassName}>
                privacy policy
              </a>
              .
            </p>

            <button
              type="submit"
              className={primaryButtonClassName}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="space-y-3 sm:space-y-4 text-sm text-white/68">
            <p>
              Already have an account?{" "}
              <a href="/signin" className={inlineLinkClassName}>
                Sign in
              </a>
            </p>

            <p className="text-white/48">
              This site is protected by hCaptcha. Its{" "}
              <a href="#" className={inlineLinkClassName}>
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className={inlineLinkClassName}>
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
