"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Database, Video, Headphones, Tag, Grid } from "lucide-react";

const assetsGroup = {
  label: "Data Assets",
  icon: Database,
  items: [
    { label: "Videos", href: "/admin/videos", icon: Video },
    { label: "Audio", href: "/admin/audio", icon: Headphones },
    { label: "Tags", href: "/admin/tags", icon: Tag },
  ]
};

export function AssetsNavGroup() {
  const pathname = usePathname();
  
  const isActiveGroup = assetsGroup.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  
  const [isOpen, setIsOpen] = useState(isActiveGroup);
  const Icon = assetsGroup.icon;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium transition-all group ${
          isActiveGroup
            ? "text-white bg-white/5"
            : "text-text-secondary hover:text-white hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 transition-colors ${isActiveGroup ? "text-accent" : "text-text-secondary/70 group-hover:text-accent"}`} />
          {assetsGroup.label}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-text-secondary/70" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-secondary/70" />
        )}
      </button>

      {isOpen && (
        <div className="pl-4 space-y-1 mt-1">
          {assetsGroup.items.map((item) => {
            const ItemIcon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full text-left rounded-xl px-4 py-2 text-[13px] font-medium transition-all group ${
                  active
                    ? "text-white bg-white/10 shadow-sm border border-white/5"
                    : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <ItemIcon className={`w-4 h-4 transition-colors ${active ? "text-accent" : "text-text-secondary/70 group-hover:text-accent"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const collectionsGroup = {
  label: "Collections",
  icon: Grid,
  items: [
    { label: "Videos", href: "/admin/collections", icon: Video },
    { label: "Audio", href: "/admin/collections/audio", icon: Headphones },
    { label: "Tags", href: "/admin/collections/tags", icon: Tag },
  ]
};

export function CollectionsNavGroup() {
  const pathname = usePathname();
  
  const isActiveGroup = collectionsGroup.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  
  const [isOpen, setIsOpen] = useState(isActiveGroup);
  const Icon = collectionsGroup.icon;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium transition-all group ${
          isActiveGroup
            ? "text-white bg-white/5"
            : "text-text-secondary hover:text-white hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 transition-colors ${isActiveGroup ? "text-accent" : "text-text-secondary/70 group-hover:text-accent"}`} />
          {collectionsGroup.label}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-text-secondary/70" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-secondary/70" />
        )}
      </button>

      {isOpen && (
        <div className="pl-4 space-y-1 mt-1">
          {collectionsGroup.items.map((item) => {
            const ItemIcon = item.icon;
            // Exact match for the root to prevent it from highlighting when child routes are active
            // Actually, because items[1] and items[2] start with items[0].href, we must be careful!
            const active = item.href === "/admin/collections" 
              ? pathname === "/admin/collections" 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full text-left rounded-xl px-4 py-2 text-[13px] font-medium transition-all group ${
                  active
                    ? "text-white bg-white/10 shadow-sm border border-white/5"
                    : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <ItemIcon className={`w-4 h-4 transition-colors ${active ? "text-accent" : "text-text-secondary/70 group-hover:text-accent"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
