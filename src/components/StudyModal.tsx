"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import type { KanjiWord } from "@/types/kanji";
import { FlashcardContainer } from "@/components/FlashcardContainer";

const STORAGE_KEY = "zubokan-last-modal-date";
const emptySubscribe = () => () => {};

function getAutoOpenSnapshot(autoOpen: boolean): boolean {
  if (!autoOpen) return false;
  try {
    return (
      localStorage.getItem(STORAGE_KEY) !==
      new Date().toISOString().slice(0, 10)
    );
  } catch {
    return false;
  }
}

type StudyModalProps = {
  words: KanjiWord[];
  autoOpen?: boolean;
  wordbookWordIds?: number[];
};

export function StudyModal({ words, autoOpen = false, wordbookWordIds }: StudyModalProps) {
  const shouldAutoOpen = useSyncExternalStore(
    emptySubscribe,
    () => getAutoOpenSnapshot(autoOpen),
    () => false,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [showGradeSelection, setShowGradeSelection] = useState(false);

  // React公式パターン: 外部ストアの値に基づいてレンダリング中にstateを調整
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);
  if (shouldAutoOpen && !autoOpenHandled) {
    setAutoOpenHandled(true);
    setIsModalOpen(true);
    setShowGradeSelection(true);
  }

  // localStorage への書き込み（副作用のためeffect内で実行、setState なし）
  useEffect(() => {
    if (autoOpenHandled) {
      try {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString().slice(0, 10));
      } catch {
        // localStorage が使えない場合は無視
      }
    }
  }, [autoOpenHandled]);

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
