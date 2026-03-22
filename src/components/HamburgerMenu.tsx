"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GRADE_LABELS } from "@/lib/constants";

const MENU_ITEMS = [
  { href: "/", label: "トップ" },
  { href: "/wordbook", label: "マイカード" },
  ...Object.entries(GRADE_LABELS)
    .filter(([, label], i, arr) => i === 0 || arr[i - 1][1] !== label)
    .map(([grade, label]) => ({ href: `/grade/${grade}`, label })),
];

type HamburgerMenuProps = {
  onClose: () => void;
};

export function HamburgerMenu({ onClose }: HamburgerMenuProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-50 ${isClosing ? "modal-fade-out" : "modal-fade-in"}`}
    >
      <div
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
        onClick={handleClose}
      />
      <nav
        role="dialog"
        aria-label="メニュー"
        className={`fixed top-0 right-0 h-full w-64 bg-white p-6 shadow-xl dark:bg-zinc-900 ${
          isClosing ? "drawer-slide-out" : "drawer-slide-in"
        }`}
      >
        <button
          onClick={handleClose}
          aria-label="メニューを閉じる"
          className="mb-6 ml-auto block cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={handleClose}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
