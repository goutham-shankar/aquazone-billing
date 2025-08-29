"use client";
import { Plus, X } from "lucide-react";

interface BillingTab {
  id: string;
  name: string;
  hasUnsavedChanges: boolean;
}

interface TabManagerProps {
  tabs: BillingTab[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: (id: string) => void;
}

export default function TabManager({ tabs, activeId, onSelect, onNew, onClose }: TabManagerProps) {
  return (
    <div className="flex h-16 items-center gap-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-1">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors
            ${tab.id === activeId 
              ? "bg-sky-600 text-white" 
              : "hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200"
            }
          `}
          onClick={() => onSelect(tab.id)}
        >
          <span>{tab.name}</span>
          {tab.hasUnsavedChanges && (
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
          )}
          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onNew}
        className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <Plus className="w-3 h-3" />
        New
      </button>
    </div>
  );
}
