// src/components/ErrorBanner.tsx
export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-error-border bg-error-bg px-6 py-4">
      <p className="text-sm text-error-text">{message}</p>
    </div>
  );
}
