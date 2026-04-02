import { useEffect, useState } from "react";

export type AntiCheatEvent = {
  type: "window_blur" | "window_focus" | "paste";
  questionId?: number;
  timestamp: string;
};

export function useAntiCheat(enabled: boolean) {
  const [events, setEvents] = useState<AntiCheatEvent[]>([]);

  useEffect(() => {
    if (!enabled) return;

    function onBlur() {
      setEvents((prev) => [
        ...prev,
        { type: "window_blur", timestamp: new Date().toISOString() },
      ]);
    }

    function onFocus() {
      setEvents((prev) => [
        ...prev,
        { type: "window_focus", timestamp: new Date().toISOString() },
      ]);
    }

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled]);

  function logPaste(questionId: number) {
    setEvents((prev) => [
      ...prev,
      { type: "paste", questionId, timestamp: new Date().toISOString() },
    ]);
  }

  function getSummary() {
    const blurCount = events.filter((e) => e.type === "window_blur").length;
    const focusCount = events.filter((e) => e.type === "window_focus").length;
    const pasteCount = events.filter((e) => e.type === "paste").length;
    return { blurCount, focusCount, pasteCount, total: events.length };
  }

  function reset() {
    setEvents([]);
  }

  return { events, logPaste, getSummary, reset };
}
