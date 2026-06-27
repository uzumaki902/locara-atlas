import { logout } from "@/app/actions";
import ClientNav from "./client-nav";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="h-[64px] border-b border-border bg-background flex items-center px-6 justify-between flex-shrink-0 relative">
        <Link href="/collections" className="flex items-center gap-2 z-10">
          <Image src="/logo.png" alt="Locara Atlas" width={28} height={28} className="rounded-md" />
          <span className="text-[16px] font-bold tracking-tight uppercase">Locara Atlas</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <ClientNav />
        </div>
        <div className="z-10">
          <form action={logout}>
            <button type="submit" className="group flex items-center justify-center gap-2 text-[14px] font-medium px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors shadow-sm">
              <LogOut className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
              Sign Out
            </button>
          </form>
        </div>
      </nav>
      {/* Allows children to stretch or scroll independently */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
