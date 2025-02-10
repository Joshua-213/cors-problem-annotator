import { useEffect } from "react";
import { useAnnotationStore } from "../store/useAnnotationStore";
import { AnnotationType } from "../types/annotation";
import { useToast } from "../contexts/ToastContext";

interface ShortcutConfig {
  action: () => void;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

interface ShortcutMap {
  [key: string]: ShortcutConfig | ShortcutConfig[];
}

export const useKeyboardShortcuts = (
  documentId: string,
  currentPage: number
) => {
  const {
    setCurrentTool,
    undo,
    redo,
    deleteSelectedAnnotations,
    selectAnnotation,
    clearSelection,
    selectAnnotations,
    documents,
    copySelectedAnnotations,
    pasteAnnotations,
    bringToFront,
    sendToBack,
  } = useAnnotationStore();
  const { showToast } = useToast();

  useEffect(() => {
    const shortcuts: ShortcutMap = {
      z: [
        {
          action: () => undo(documentId),
          ctrl: true,
        },
        {
          action: () => redo(documentId),
          ctrl: true,
          shift: true,
        },
      ],
      y: {
        action: () => redo(documentId),
        ctrl: true,
      },
      v: [
        {
          action: () => setCurrentTool("select"),
        },
        {
          action: () => {
            const count = pasteAnnotations(currentPage);
            if (count) {
              showToast(`${count} annotation${count > 1 ? "s" : ""} pasted`);
            }
          },
          ctrl: true,
        },
      ],
      p: {
        action: () => setCurrentTool("freehand"),
      },
      r: {
        action: () => setCurrentTool("rectangle"),
      },
      c: [
        {
          action: () => setCurrentTool("circle"),
        },
        {
          action: () => {
            const count = copySelectedAnnotations();
            if (count) {
              showToast(`${count} annotation${count > 1 ? "s" : ""} copied`);
            }
          },
          ctrl: true,
        },
      ],
      l: {
        action: () => setCurrentTool("line"),
      },
      a: [
        {
          action: () => setCurrentTool("arrow"),
        },
        {
          action: () => {
            // Select all annotations on current page
            const document = documents[documentId];
            if (document) {
              selectAnnotations(document.annotations);
            }
          },
          ctrl: true,
        },
      ],
      t: {
        action: () => setCurrentTool("text"),
      },
      h: {
        action: () => setCurrentTool("highlight"),
      },
      Delete: {
        action: deleteSelectedAnnotations,
      },
      Backspace: {
        action: deleteSelectedAnnotations,
      },
      Escape: {
        action: () => {
          clearSelection();
          setCurrentTool("select");
        },
      },
      x: {
        action: () => {
          const count = copySelectedAnnotations();
          if (count) {
            showToast(`${count} annotation${count > 1 ? "s" : ""} cut`);
            deleteSelectedAnnotations();
          }
        },
        ctrl: true,
      },
      "]": {
        action: () => {
          if (selectedAnnotations.length) {
            bringToFront(
              documentId,
              selectedAnnotations.map((a) => a.id)
            );
          }
        },
        ctrl: true,
      },
      "[": {
        action: () => {
          if (selectedAnnotations.length) {
            sendToBack(
              documentId,
              selectedAnnotations.map((a) => a.id)
            );
          }
        },
        ctrl: true,
      },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const shortcut = shortcuts[key];

      if (!shortcut) return;

      if (Array.isArray(shortcut)) {
        // Handle multiple shortcuts for same key
        const matchingShortcut = shortcut.find((s) => {
          const ctrlMatch = !s.ctrl || (s.ctrl && (e.ctrlKey || e.metaKey));
          const shiftMatch = !s.shift || (s.shift && e.shiftKey);
          const altMatch = !s.alt || (s.alt && e.altKey);
          return ctrlMatch && shiftMatch && altMatch;
        });

        if (matchingShortcut) {
          e.preventDefault();
          matchingShortcut.action();
        }
      } else {
        const ctrlMatch =
          !shortcut.ctrl || (shortcut.ctrl && (e.ctrlKey || e.metaKey));
        const shiftMatch = !shortcut.shift || (shortcut.shift && e.shiftKey);
        const altMatch = !shortcut.alt || (shortcut.alt && e.altKey);

        if (ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    documentId,
    currentPage,
    setCurrentTool,
    undo,
    redo,
    deleteSelectedAnnotations,
    clearSelection,
    selectAnnotations,
    documents,
    copySelectedAnnotations,
    pasteAnnotations,
    showToast,
    bringToFront,
    sendToBack,
  ]);
};
