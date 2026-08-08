"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContentStoreProvider, useContentStore } from "@/lib/store/content-store";

function ShellBody({ children }: { children: ReactNode }) {
  const { ready, error, reload } = useContentStore();

  return (
    <div className="flex min-h-screen bg-ink-925 text-ink-100">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {error ? (
            <div className="mb-6 border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
              <p className="font-medium">Couldn’t sync with Supabase</p>
              <p className="mt-1 text-rose-200/80">{error}</p>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void reload();
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : null}

          {ready ? (
            children
          ) : (
            <div className="text-sm text-ink-400">
              {error ? "Waiting for database connection…" : "Loading content OS…"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ContentStoreProvider>
      <ShellBody>{children}</ShellBody>
    </ContentStoreProvider>
  );
}
