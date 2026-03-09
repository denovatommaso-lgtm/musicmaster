"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  className?: string;
  label?: string;
};

export function BackButton({
  className = "",
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white ${className}`.trim()}
    >
      <ArrowLeftIcon />
      <span>{label}</span>
    </button>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}
