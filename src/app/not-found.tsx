import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Page not found
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Could not find the requested resource.
      </p>
      <Link
        href="/"
        className="flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Return home
      </Link>
    </div>
  );
}
