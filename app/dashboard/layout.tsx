import type { ReactNode } from "react";
import { BottomNav } from "./_components/bottom-nav";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
