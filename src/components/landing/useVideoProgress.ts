"use client";

import { useEffect, useState, type RefObject } from "react";
import { videoProviderFromEmbedUrl } from "@/lib/landing";

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLIFrameElement, options: Record<string, unknown>) => {
        getDuration: () => number;
        getCurrentTime: () => number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Tracks playback progress (0-100) of an embedded YouTube/Vimeo video via
// their respective player APIs, so overlay CTAs can reveal at a % threshold.
export function useVideoProgress(iframeRef: RefObject<HTMLIFrameElement | null>, embedUrl: string) {
  // Unknown/unsupported embeds can't report playback progress, so treat them as fully watched.
  const [percent, setPercent] = useState(() =>
    embedUrl && videoProviderFromEmbedUrl(embedUrl) === "other" ? 100 : 0,
  );

  useEffect(() => {
    if (!embedUrl) return;
    const provider = videoProviderFromEmbedUrl(embedUrl);
    if (provider === "other") return;

    if (provider === "youtube") {
      let cancelled = false;
      let interval: ReturnType<typeof setInterval> | undefined;

      function createPlayer() {
        if (cancelled || !iframeRef.current || !window.YT) return;
        const player = new window.YT.Player(iframeRef.current, {
          events: {
            onReady: () => {
              interval = setInterval(() => {
                const duration = player.getDuration() || 0;
                const current = player.getCurrentTime() || 0;
                if (duration > 0) setPercent(Math.min(100, Math.round((current / duration) * 100)));
              }, 500);
            },
          },
        });
      }

      if (window.YT?.Player) {
        createPlayer();
      } else {
        if (!document.getElementById("youtube-iframe-api")) {
          const tag = document.createElement("script");
          tag.id = "youtube-iframe-api";
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previous?.();
          createPlayer();
        };
      }

      return () => {
        cancelled = true;
        if (interval) clearInterval(interval);
      };
    }

    if (provider === "vimeo") {
      function handleMessage(event: MessageEvent) {
        if (typeof event.data !== "string" || !event.origin.includes("vimeo.com")) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "ready") {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
              "*",
            );
          }
          if (payload.event === "timeupdate" && typeof payload.data?.percent === "number") {
            setPercent(Math.min(100, Math.round(payload.data.percent * 100)));
          }
        } catch {
          // ignore postMessages from other embeds/origins on the page
        }
      }
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [embedUrl, iframeRef]);

  return percent;
}
