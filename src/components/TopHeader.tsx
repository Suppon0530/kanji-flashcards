"use client";

import { useState } from "react";
import Image from "next/image";
import { AuthButton } from "@/components/AuthButton";
import { HamburgerMenu } from "@/components/HamburgerMenu";

export function TopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-700">
      <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
        <Image
          src="/Suppon_Logo_1024.png"
          alt="ロゴ"
          width={1024}
          height={1024}
          className="h-full w-auto"
          unoptimized
        />

        <div className="flex items-center gap-3">
          <AuthButton />
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
      </div>

      {isMenuOpen && <HamburgerMenu onClose={() => setIsMenuOpen(false)} />}
    </header>
  );
}
