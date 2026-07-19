export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-xs text-text-2">
        This page hasn&apos;t been loaded yet, so it needs a connection. Anything you&apos;ve
        already opened will keep working, and Qaza logging will sync once you&apos;re back
        online.
      </p>
    </main>
  );
}
