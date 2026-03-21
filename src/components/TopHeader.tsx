"use client";

import { useState } from "react";
import { HamburgerMenu } from "@/components/HamburgerMenu";

export function TopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-700">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold text-white">
          漢
        </div>

        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="メニューを開く"
          aria-expanded={isMenuOpen}
          className="flex cursor-pointer flex-col gap-1.5 p-2"
        >
          <span className="block h-0.5 w-6 bg-zinc-700 dark:bg-zinc-300" />
          <span className="block h-0.5 w-6 bg-zinc-700 dark:bg-zinc-300" />
          <span className="block h-0.5 w-6 bg-zinc-700 dark:bg-zinc-300" />
        </button>
      </div>

      {isMenuOpen && <HamburgerMenu onClose={() => setIsMenuOpen(false)} />}
    </header>
  );
}
