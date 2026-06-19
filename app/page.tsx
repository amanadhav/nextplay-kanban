"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Board from "@/components/Board";

type AuthState =
  | { phase: "loading" }
  | { phase: "ready" }
  | { phase: "error"; message: string };

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [auth, setAuth] = useState<AuthState>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      try {
        // Reuse an existing session if one is already persisted.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }

        if (!cancelled) setAuth({ phase: "ready" });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "Failed to start an anonymous session.";
        setAuth({ phase: "error", message });
      }
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (auth.phase === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
        <p className="text-sm text-muted">Setting up your board…</p>
      </main>
    );
  }

  if (auth.phase === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="text-base font-semibold text-foreground">
          Couldn&apos;t connect
        </h1>
        <p className="max-w-md text-sm text-muted">{auth.message}</p>
        <p className="max-w-md text-xs text-muted/70">
          If this persists, confirm anonymous sign-ins are enabled in your
          Supabase project and that your env vars are correct.
        </p>
      </main>
    );
  }

  return <Board />;
}
