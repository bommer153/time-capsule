"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <h1 className="font-display text-3xl text-pink-950">Something went wrong</h1>
      <p className="mt-2 text-sm text-pink-800/70">
        The page hit a server error. Check Vercel env vars and MongoDB Atlas access, then try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white"
      >
        Reload
      </button>
    </div>
  );
}
