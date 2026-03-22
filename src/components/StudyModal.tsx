"use client";

import { useState, useEffect, useCallback } from "react";
import type { KanjiWord } from "@/types/kanji";
import { FlashcardContainer } from "@/components/FlashcardContainer";

type StudyModalProps = {
  words: KanjiWord[];
  autoOpen?: boolean;
  wordbookWordIds?: number[];
};

export function StudyModal({ words, autoOpen = false, wordbookWordIds }: StudyModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [showGradeSelection, setShowGradeSelection] = useState(false);

  useEffect(() => {
    if (!autoOpen) return;

    const STORAGE_KEY = "zubokan-last-modal-date";
    const today = new Date().toISOString().slice(0, 10);

    try {
      if (localStorage.getItem(STORAGE_KEY) !== today) {
        setIsModalOpen(true);
        setShowGradeSelection(true);
        localStorage.setItem(STORAGE_KEY, today);
      }
    } catch {
      // localStorage が使えない場合は autoOpen しない
    }
  }, [autoOpen]);

  const handleOpen = () => {
    setModalKey((prev) => prev + 1);
    setShowGradeSelection(false);
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
                showGradeSelection={showGradeSelection}
                wordbookWordIds={wordbookWordIds}
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
