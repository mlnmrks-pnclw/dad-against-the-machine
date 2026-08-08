"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Clapperboard,
  LayoutDashboard,
  Library,
  Lightbulb,
  KanbanSquare,
} from "lucide-react";
import { APP_NAME, BRAND_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/board", label: "Production Board", icon: KanbanSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/library", label: "Library", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-950">
      <div className="border-b border-ink-800 px-5 py-5">
        <div className="flex items-center gap-2 text-copper">
          <Clapperboard className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            {APP_NAME}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-ink-100">{BRAND_NAME}</p>
        <p className="mt-1 text-xs text-ink-500">Content operating system</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-ink-850 text-ink-50"
                  : "text-ink-400 hover:bg-ink-900 hover:text-ink-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-800 px-5 py-4 text-xs text-ink-500">
        Local MVP · Supabase-ready
      </div>
    </aside>
  );
}
