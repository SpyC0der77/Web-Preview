"use client";

import dynamic from "next/dynamic";
import { usePreviewContent } from "@/hooks/use-preview-content";

const WebPreview = dynamic(
  () => import("@/components/web-preview").then((mod) => mod.WebPreview),
  {
    ssr: false,
  }
);

export default function Home() {
  const { component: Page, code } = usePreviewContent();

  return (
    <main className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-4xl mx-auto">
        <WebPreview
          component={Page}
          code={code}
          initialPath="/"
          className="h-[700px]"
        />
      </div>
    </main>
  );
}
