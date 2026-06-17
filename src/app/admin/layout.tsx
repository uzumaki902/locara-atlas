import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    { label: "Dashboard", href: "/admin" },
    { label: "Organizations", href: "/admin/organizations" },
    { label: "Users", href: "/admin/users" },
    { label: "Collections", href: "/admin/collections" },
    { label: "Videos", href: "/admin/videos" },
    { label: "Requests", href: "/admin/requests" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-full md:w-[280px] lg:w-[320px] flex flex-col border-b md:border-b-0 md:border-r border-border bg-background flex-shrink-0">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Locara Atlas"
              width={32}
              height={32}
              className="rounded-md shrink-0"
              priority
            />
            <div>
              <h1 className="text-[20px] font-bold text-foreground tracking-tight leading-tight uppercase">
                Locara Atlas
              </h1>
              <p className="text-[12px] font-normal text-text-secondary leading-tight mt-0.5">
                Admin
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block w-full text-left rounded-lg px-3 py-2.5 text-[14px] font-medium text-text-secondary hover:text-foreground hover:bg-surface transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
