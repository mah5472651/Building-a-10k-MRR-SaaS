import { FileText, LucideIcon, Send } from "lucide-react";

const icons = {
  clients: Send,
  document: FileText,
} satisfies Record<string, LucideIcon>;

export function EmptyState({
  icon = "clients",
  title,
  body,
}: {
  icon?: keyof typeof icons;
  title: string;
  body: string;
}) {
  const Icon = icons[icon];
  return (
    <div className="py-14 text-center">
      <Icon className="mx-auto mb-4 text-[var(--ink-200)]" size={48} strokeWidth={1.75} />
      <p className="font-medium text-[var(--ink-800)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--ink-600)]">{body}</p>
    </div>
  );
}
