"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Grid, Search, FileText } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/collections", label: "Collections", icon: Grid },
  { href: "/", label: "Dataset Explorer", icon: Search },
  { href: "/requests", label: "Requests", icon: FileText },
];

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
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
            className={`relative flex items-center gap-2 text-[13px] font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
              active
                ? "text-white bg-white/10 border border-white/5 shadow-sm"
                : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? "text-accent" : "text-text-secondary/70"} transition-colors`} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
