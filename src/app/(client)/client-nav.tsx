"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/collections", label: "Collections" },
  { href: "/requests", label: "Requests" },
];

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4">
      {navigation.map((item) => {
        // Handle exact matching or child paths appropriately
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-[14px] font-medium transition-colors ${
              active ? "text-foreground" : "text-text-secondary hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
