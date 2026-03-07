"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
  { href: "/dashboard/play", icon: "🎵", label: "Play" },
  { href: "/dashboard/profile", icon: "👤", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-card/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center justify-around">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-20 flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "text-primary"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
