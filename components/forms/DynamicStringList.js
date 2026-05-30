"use client";

import { useState } from "react";

/**
 * @param {{ label: string, items: string[], onChange: (items: string[]) => void, placeholder?: string, addLabel?: string }} props
 */
export function DynamicStringList({
  label,
  items,
  onChange,
  placeholder = "Enter value…",
  addLabel = "Add",
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    const exists = items.some((item) => item.toLowerCase() === value.toLowerCase());
    if (exists) {
      setDraft("");
      return;
    }
    onChange([...items, value]);
    setDraft("");
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 block text-sm font-semibold text-emerald-950">{label}</legend>

      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-sm font-medium text-emerald-900"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-full p-0.5 text-emerald-600 transition hover:bg-emerald-200/80 hover:text-emerald-950"
                aria-label={`Remove ${item}`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-emerald-700/70">None added yet.</p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-950 outline-none ring-emerald-600/30 transition placeholder:text-emerald-600/40 focus:border-emerald-400 focus:ring-2"
        />
        <button
          type="button"
          onClick={addItem}
          className="shrink-0 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
        >
          {addLabel}
        </button>
      </div>
    </fieldset>
  );
}
