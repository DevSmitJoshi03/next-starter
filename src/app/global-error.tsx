"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center font-sans">
        <h1 className="text-2xl font-semibold text-black">
          Something went wrong
        </h1>
        <p className="max-w-md text-zinc-600">
          A critical error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#383838]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
