import { WebPreview } from "@/components/web-preview";
import { QuizApp } from "@/components/preview-content";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-4xl mx-auto">
        <WebPreview component={QuizApp} initialPath="/" className="h-[700px]" />
      </div>
    </main>
  );
}
