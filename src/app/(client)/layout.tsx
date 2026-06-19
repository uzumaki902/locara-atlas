import { logout } from "@/app/actions";
import ClientNav from "./client-nav";
import Image from "next/image";
import Link from "next/link";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="h-[64px] border-b border-border bg-background flex items-center px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/collections" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Locara Atlas" width={28} height={28} className="rounded-md" />
            <span className="text-[16px] font-bold tracking-tight uppercase">Locara Atlas</span>
          </Link>
          <div className="h-4 w-px bg-border"></div>
          <ClientNav />
        </div>
        <div>
          <form action={logout}>
            <button type="submit" className="text-[14px] font-medium text-text-secondary hover:text-foreground transition-colors">
              Logout
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
