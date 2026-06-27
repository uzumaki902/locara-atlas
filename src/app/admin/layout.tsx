import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions";
import { LayoutDashboard, Building2, Users, Grid, Video, FileText, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Organizations", href: "/admin/organizations", icon: Building2 },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Collections", href: "/admin/collections", icon: Grid },
    { label: "Videos", href: "/admin/videos", icon: Video },
    { label: "Requests", href: "/admin/requests", icon: FileText },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-full md:w-[280px] lg:w-[320px] flex flex-col border-b md:border-b-0 md:border-r border-border bg-surface/30 flex-shrink-0">
        <div className="px-6 pt-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Locara Atlas"
                width={20}
                height={20}
                className="rounded-md shrink-0"
                priority
              />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white tracking-tight leading-tight uppercase">
                Locara Atlas
              </h1>
              <p className="text-[11px] font-mono text-accent leading-tight mt-1 tracking-widest uppercase">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-all group"
              >
                <Icon className="w-4 h-4 text-text-secondary/70 group-hover:text-accent transition-colors" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <form action={logout}>
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 w-full text-center rounded-lg px-3 py-2.5 text-[14px] font-medium bg-red-600 text-white hover:bg-red-500 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
