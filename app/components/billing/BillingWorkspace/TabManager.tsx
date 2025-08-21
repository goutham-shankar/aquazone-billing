"use client";
import { Plus, X } from "lucide-react";

export type Tab = { id: string; name: string; hasUnsavedChanges?: boolean };

export default function TabManager({
  tabs,
  activeId,
  onSelect,
  onNew,
  onClose,
}: {
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`h-10 px-3 rounded-md border flex items-center gap-2 ${t.id === activeId ? "bg-sky-50 border-sky-300 text-slate-900" : "bg-white border-slate-300 text-slate-700"}`}
          title={`Ctrl+${i + 1}`}
        >
          <span className="text-sm font-medium">{t.name}</span>
          {t.hasUnsavedChanges && <span className="text-red-500">•</span>}
          <X
            className="w-4 h-4 ml-1"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onClose(t.id);
            }}
          />
        </button>
      ))}
      <button onClick={onNew} className="h-10 px-3 rounded-md border border-sky-300 bg-sky-100 text-sky-700 flex items-center gap-2">
        <Plus className="w-4 h-4" /> <span className="text-sm">New Tab</span>
      </button>
    </div>
  );
}
