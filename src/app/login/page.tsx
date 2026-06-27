"use client";

import { useState } from "react";
import { useActionState } from "react";
import { login } from "./actions";
import Image from "next/image";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#050505]">
      
      {/* ── Left Pane: Immersive Command Center Vibe ── */}
      <div className="hidden md:flex md:w-3/5 flex-col justify-between p-12 lg:p-24 relative overflow-hidden bg-[#050505]">
        
        {/* Abstract data visualization background (CSS-only) */}
        <div className="absolute inset-0 z-0 opacity-30">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#2E8BBA]/20 rounded-full blur-[150px]"></div>
           {/* High-tech grid overlay */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_rgba(59,156,194,0.2)]">
            <Image src="/logo.png" alt="Locara" width={24} height={24} className="rounded" priority />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-white tracking-tight uppercase leading-none mb-1">
              Locara <span className="text-accent">Atlas</span>
            </h2>
            <p className="text-[11px] font-mono text-text-secondary tracking-[0.2em] uppercase">
              Operations Command Center
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 my-auto">
          <h1 className="text-5xl lg:text-[80px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 tracking-tighter leading-[1.05] mb-8">
            Command<br />
            your data<br />
            <span className="text-accent drop-shadow-[0_0_30px_rgba(59,156,194,0.3)]">universe.</span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-text-secondary">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
              <span className="text-white">System Operational</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md shadow-lg">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
              <span className="text-white">Enterprise Grade Security</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] text-text-secondary/60 font-mono">
          ATLAS ENGINE v2.4.1 • ENCRYPTED CONNECTION
        </div>
      </div>

      {/* ── Right Pane: Auth Form ── */}
      <div className="w-full md:w-2/5 flex flex-col justify-center p-8 lg:p-16 relative bg-[#09090b] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-20 border-l border-white/5">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
            <Image src="/logo.png" alt="Locara Labs" width={20} height={20} className="rounded" priority />
          </div>
          <p className="text-[18px] font-bold text-white tracking-tight uppercase">
            Locara <span className="text-accent font-medium">Atlas</span>
          </p>
        </div>

        <div className="w-full max-w-[380px] mx-auto">
          
          <div className="mb-10">
            <h2 className="text-[24px] font-semibold text-white mb-2 tracking-tight">Welcome back</h2>
            <p className="text-[14px] text-text-secondary">Authenticate to securely access your workspace.</p>
          </div>

          <form action={formAction} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="client@company.com"
                required
                className="w-full px-4 py-3 text-[14px] rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent focus:bg-white/[0.05] transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 text-[14px] rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent focus:bg-white/[0.05] transition-all duration-200 tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-2 rounded-md hover:bg-white/5"
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
              className="w-full mt-4 bg-white text-black font-bold text-[14px] px-4 py-3 rounded-xl hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
