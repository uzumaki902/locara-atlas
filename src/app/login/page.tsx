"use client";

import { useState } from "react";
import { useActionState } from "react";
import { login } from "./actions";
import Image from "next/image";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(59,156,194,0.08) 0%, #09090F 60%)",
      }}
    >

      {/* ── Brand header ── */}
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/logo.png"
          alt="Locara Labs"
          width={32}
          height={32}
          className="rounded-md"
          priority
        />
        <div>
          <p className="text-[30px] font-bold text-foreground tracking-tight leading-tight uppercase">
            Locara Atlas
          </p>
          <p className="text-[14px] font-normal text-text-secondary leading-tight mt-0.5">
            Secure Dataset Explorer
          </p>
        </div>
      </div>

      {/* ── Login card with glassmorphism ── */}
      <div className="w-full max-w-[380px] bg-surface/80 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl shadow-black/40"
        style={{ boxShadow: "0 0 80px -20px rgba(59,156,194,0.08), 0 25px 50px -12px rgba(0,0,0,0.5)" }}
      >

        {/* Card header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/60">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">
            Sign In
          </h2>
          <p className="text-[14px] font-normal text-text-secondary mt-0.5">
            Enter your credentials to continue
          </p>
        </div>

        {/* Card body */}
        <form action={formAction} className="px-6 py-5 space-y-4">
          <div>
            <label
              className="block text-[13px] font-medium text-foreground mb-1.5"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" strokeLinecap="round" />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                className="w-full pl-8 pr-3 py-2 text-[14px] rounded-lg bg-background border border-border text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all duration-150"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[13px] font-medium text-foreground mb-1.5"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
              </svg>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-8 pr-10 py-2 text-[14px] rounded-lg bg-background border border-border text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-[13px] font-medium text-red-400">
                {state.error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-accent/90 text-white font-medium text-[14px] px-4 py-2.5 rounded-lg hover:bg-accent transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* ── Footer ── */}
      <p className="mt-6 text-[12px] text-text-secondary/50">
        Locara Labs
      </p>

    </div>
  );
}
