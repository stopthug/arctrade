"use client";

import { useState } from "react";
import { Button } from "@/components/marketing/button";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not join the waitlist. Try again.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Could not join the waitlist. Try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="border border-line bg-white px-5 py-6 text-sm leading-relaxed">
        You’re on the list. We’ll write when ArcTrade is ready.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-3 sm:grid-cols-[1fr_auto]">
      <label className="sr-only" htmlFor="waitlist-email">
        Email
      </label>
      <input
        id="waitlist-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        disabled={status === "loading"}
        className="h-11 w-full border border-line bg-white px-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-arcblue disabled:opacity-50"
      />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <Button type="submit" arrow="ne" loading={status === "loading"} className="h-11">
        Join waitlist
      </Button>
      {message ? <p className="text-sm text-muted sm:col-span-2">{message}</p> : null}
    </form>
  );
}
