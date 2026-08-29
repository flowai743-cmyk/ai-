"use client";

import { useEffect } from "react";

export default function ScriptGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Suppress benign third-party external script errors (like TradingView cross-origin iframe events)
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = String(event.message || "");
      const filename = String(event.filename || "");

      if (
        !msg ||
        msg.includes("Script error") ||
        msg.includes("ResizeObserver") ||
        msg.includes("Hydration") ||
        filename.includes("tradingview") ||
        filename.includes("s3.tradingview.com")
      ) {
        event.stopImmediatePropagation?.();
        event.preventDefault?.();
        return true;
      }
    };

    const prevOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const msgStr = String(message || "");
      const srcStr = String(source || "");
      if (
        msgStr.includes("Script error") ||
        msgStr.includes("ResizeObserver") ||
        srcStr.includes("tradingview")
      ) {
        return true; // prevent default error handling
      }
      if (typeof prevOnError === "function") {
        return prevOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const strReason = String(reason?.message || reason || "");

      if (
        strReason.includes("Script error") ||
        strReason.includes("ResizeObserver") ||
        strReason.includes("tradingview")
      ) {
        event.stopImmediatePropagation?.();
        event.preventDefault?.();
      }
    };

    window.addEventListener("error", handleGlobalError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", handleGlobalError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
      window.onerror = prevOnError;
    };
  }, []);

  return null;
}
