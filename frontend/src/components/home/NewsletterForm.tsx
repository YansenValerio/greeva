'use client';

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="email@kamu.com"
        className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-greeva-black placeholder:text-gray-400 focus:border-greeva-forest focus:outline-none focus:ring-2 focus:ring-greeva-leaf/30"
      />
      <button
        type="submit"
        className="rounded-lg bg-greeva-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-greeva-starbucks-green"
      >
        Ikut
      </button>
    </form>
  );
}
