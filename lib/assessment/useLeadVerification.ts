"use client";

// Client half of the assessment bot protection (server half:
// app/api/assessment/verify). Captures when the assessment first rendered,
// holds the honeypot value, runs an invisible Cloudflare Turnstile widget
// from the final step onwards, and asks the server whether the completion
// counts. qualify_lead is pushed only when this resolves true.
//
// Nothing here ever blocks or delays the result screen: the caller shows the
// result first and verifies afterwards.

import { useCallback, useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** How long verify() waits for a Turnstile token before giving up. */
const TOKEN_WAIT_MS = 15_000;

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance?: "always" | "execute" | "interaction-only";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ): string | undefined;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

const CSRF_COOKIE = "ecm-csrf";
const CSRF_HEADER = "x-csrf-token";

function readCsrfCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/**
 * Double-submit header read from the cookie at send time. Not useCsrf():
 * every useCsrf() instance fetches its own token and resets the cookie, so a
 * token held in component state can stop matching the cookie the browser
 * actually sends (the results screen mounts another instance at the same
 * moment this request goes out).
 */
async function csrfHeader(): Promise<Record<string, string>> {
  let token = readCsrfCookie();
  if (!token) {
    await fetch("/api/csrf", { credentials: "same-origin" }).catch(() => null);
    token = readCsrfCookie();
  }
  return token ? { [CSRF_HEADER]: token } : {};
}

/** Load the Turnstile script once per page. Only assessment pages call this. */
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Turnstile script failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export interface LeadVerification {
  /** Spread onto the hidden honeypot input. */
  honeypot: { value: string; onChange: (e: { target: { value: string } }) => void };
  /** Resolves true only when the server says the completion is qualified. Never throws. */
  verify: () => Promise<boolean>;
}

/**
 * @param challengeActive true from the final step onwards; mounts the widget.
 */
export function useLeadVerification(challengeActive: boolean): LeadVerification {
  const startedAt = useRef<number | null>(null);
  const token = useRef<string | null>(null);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!challengeActive || !SITE_KEY) return;

    let widgetId: string | undefined;
    let cancelled = false;
    // Rendered outside the assessment's own tree so moving from the final
    // step to the result screen does not reset the widget. In
    // interaction-only mode it stays invisible unless Cloudflare needs the
    // visitor to click.
    const container = document.createElement("div");
    container.className = "turnstile-slot";
    document.body.appendChild(container);

    loadTurnstile()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetId = window.turnstile.render(container, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          callback: (t) => {
            token.current = t;
          },
          "expired-callback": () => {
            token.current = null;
          },
          "error-callback": () => {
            token.current = null;
          },
        });
      })
      .catch(() => {
        // Script blocked or offline: verify() will send no token and the
        // completion is simply not counted.
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      container.remove();
    };
  }, [challengeActive]);

  const verify = useCallback(async (): Promise<boolean> => {
    try {
      if (SITE_KEY) {
        const deadline = Date.now() + TOKEN_WAIT_MS;
        while (!token.current && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      const res = await fetch("/api/assessment/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...(await csrfHeader()) },
        body: JSON.stringify({
          startedAt: startedAt.current,
          website,
          turnstileToken: token.current ?? "",
        }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { qualified?: boolean };
      return data.qualified === true;
    } catch {
      return false;
    }
  }, [website]);

  return {
    honeypot: { value: website, onChange: (e) => setWebsite(e.target.value) },
    verify,
  };
}
