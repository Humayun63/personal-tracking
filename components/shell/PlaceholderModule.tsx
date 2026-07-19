import { EmptyState } from "@/components/ui/EmptyState";
import { MODULES } from "./modules";

export function PlaceholderModule({ moduleKey }: { moduleKey: string }) {
  const mod = MODULES.find((m) => m.key === moduleKey)!;
  const Icon = mod.icon;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <EmptyState
        icon={<Icon />}
        accentColor={mod.accent === "text" ? undefined : mod.accent}
        title={`${mod.label} is coming soon`}
        description="This module isn't built yet — check back later."
      />
    </div>
  );
}
