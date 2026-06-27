"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/collections", label: "Collections" },
  { href: "/", label: "Dataset Explorer" },
  { href: "/requests", label: "Requests" },
];

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {navigation.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative text-[14px] font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
              active
                ? "text-foreground bg-surface"
                : "text-text-secondary hover:text-foreground hover:bg-surface/50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
