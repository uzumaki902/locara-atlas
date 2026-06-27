"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BarChart3, Grid, Search, FileText, LogOut } from "lucide-react";
import { logout } from "@/app/actions";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/collections", label: "Collections", icon: Grid },
  { href: "/", label: "Dataset Explorer", icon: Search },
  { href: "/requests", label: "Requests", icon: FileText },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 text-text-secondary hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-[64px] z-50 bg-background/95 backdrop-blur-md border-t border-border flex flex-col p-6 overflow-y-auto">
          <nav className="flex flex-col gap-2 flex-1">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white border border-white/5 shadow-sm"
                      : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-accent" : "text-text-secondary/70"} transition-colors`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-6 border-t border-white/5">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 text-[15px] font-medium px-4 py-3.5 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors shadow-sm"
              >
                <LogOut className="w-5 h-5 text-white/90" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
