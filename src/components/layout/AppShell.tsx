"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContentStoreProvider, useContentStore } from "@/lib/store/content-store";

function ShellBody({ children }: { children: ReactNode }) {
  const { ready } = useContentStore();

  return (
    <div className="flex min-h-screen bg-ink-925 text-ink-100">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {ready ? children : (
            <div className="text-sm text-ink-400">Loading content OS…</div>
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
