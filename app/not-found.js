import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <div className="rounded-2xl border-2 border-ink bg-white p-8 shadow-[4px_4px_0px_0px_#111318]">
        <span className="text-4xl block mb-2">🔍</span>
        <h1 className="text-3xl font-black text-ink">Page Not Found</h1>
        <p className="mt-2 text-sm text-zinc-600">
          The page or opportunity check you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl border-2 border-ink bg-lime px-6 py-2.5 text-sm font-black text-ink shadow-[2px_2px_0px_0px_#111318] hover:brightness-95 transition-all"
        >
          Return to ApplyGuard Check
        </Link>
      </div>
    </main>
  );
}

