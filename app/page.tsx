"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Board from "@/components/Board";

export default function Home() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function ensureSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }

        if (active) setStatus("ready");
      } catch (err) {
        if (!active) return;
        setErrorMsg(
          err instanceof Error ? err.message : "Could not start a session."
        );
        setStatus("error");
      }
    }

    ensureSession();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-sm">Starting your board\u2026</p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-base font-semibold text-red-700">
            Couldn&apos;t connect
          </h1>
          <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
          <p className="mt-3 text-xs text-red-500">
            Check that your Supabase env vars are set and anonymous sign-ins are
            enabled.
          </p>
        </div>
      </main>
    );
  }

  return <Board />;
}
