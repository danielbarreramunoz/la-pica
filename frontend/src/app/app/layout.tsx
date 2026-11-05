import { Suspense } from "react";
import { PublicHeader } from "@/components/app/public-header";
import { TabBar } from "@/components/app/tab-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <Suspense>
        <PublicHeader />
      </Suspense>
      <main className="pb-16">{children}</main>
      <Suspense>
        <TabBar />
      </Suspense>
    </div>
  );
}
