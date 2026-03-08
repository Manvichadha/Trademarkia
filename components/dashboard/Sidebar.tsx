"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Sheets", href: "/dashboard/sheets" },
    { name: "Templates", href: "/dashboard/templates" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside className="relative z-10 hidden w-72 flex-col border-r border-border-subtle bg-surface-1/60 backdrop-blur-xl px-6 py-8 shadow-sm md:flex">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
          Sh
        </div>
        <div>
          <div className="text-lg font-bold text-text-primary">Sheet</div>
          <div className="text-sm text-text-muted">Workspace</div>
        </div>
      </div>
      <nav className="space-y-2 text-base">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              }`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-8 text-sm text-text-muted">
        Designed for focused collaboration.
      </div>
    </aside>
  );
}
