"use client";

import { useActionState } from "react";
import { login } from "./actions";
import Image from "next/image";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">

      {/* ── Brand header (mirrors sidebar header) ── */}
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

      {/* ── Login card ── */}
      <div className="w-full max-w-[380px] bg-surface border border-border rounded-lg">

        {/* Card header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
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
                className="w-full pl-8 pr-3 py-[7px] text-[14px] rounded-lg bg-background border border-border text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all duration-150"
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
                type="password"
                required
                className="w-full pl-8 pr-3 py-[7px] text-[14px] rounded-lg bg-background border border-border text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all duration-150"
              />
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
            className="w-full bg-accent/90 text-white font-medium text-[14px] px-4 py-[8px] rounded-lg hover:bg-accent transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* ── Footer ── */}
      <p className="mt-6 text-[12px] text-text-secondary/50">
        Locara Labs · Internal Use Only
      </p>

    </div>
  );
}
