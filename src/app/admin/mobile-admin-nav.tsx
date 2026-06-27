"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, LayoutDashboard, Building2, Users, Grid, Video, FileText, LogOut } from "lucide-react";
import { logout } from "@/app/actions";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Organizations", href: "/admin/organizations", icon: Building2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Collections", href: "/admin/collections", icon: Grid },
  { label: "Videos", href: "/admin/videos", icon: Video },
  { label: "Requests", href: "/admin/requests", icon: FileText },
];

export default function MobileAdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden flex flex-col bg-background border-b border-border">
      <div className="h-[64px] px-6 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 z-10" onClick={() => setIsOpen(false)}>
          <Image src="/logo.png" alt="Locara Atlas" width={32} height={32} className="rounded-lg shrink-0 shadow-sm" priority />
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight uppercase">Locara Atlas</h1>
            <p className="text-[10px] font-mono text-accent leading-tight mt-0.5 tracking-widest uppercase">Admin</p>
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-text-secondary hover:text-white transition-colors z-10"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-[64px] z-50 bg-background/95 backdrop-blur-md border-t border-white/5 flex flex-col p-6 overflow-y-auto">
          <nav className="flex flex-col gap-1.5 flex-1">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white border border-white/5 shadow-sm"
                      : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-accent" : "text-text-secondary/70"} transition-colors`} />
                  {link.label}
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
