"use client";

import { useState, useEffect, useCallback } from "react";
import type { KanjiWord } from "@/types/kanji";
import { FlashcardContainer } from "@/components/FlashcardContainer";

type StudyModalProps = {
  words: KanjiWord[];
};

export function StudyModal({ words }: StudyModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const handleOpen = () => {
    setModalKey((prev) => prev + 1);
    setIsModalOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="cursor-pointer rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        問題に挑戦
      </button>

      {isModalOpen && (
        <div
          className={`fixed inset-0 z-50 overflow-y-auto ${
            isClosing ? "modal-fade-out" : "modal-fade-in"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
          />
          <div className="relative flex min-h-full items-center justify-center p-4">
            <div
              className={`relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ${
                isClosing ? "modal-slide-down" : "modal-slide-up"
              }`}
            >
              <FlashcardContainer
                key={modalKey}
                words={words}
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
