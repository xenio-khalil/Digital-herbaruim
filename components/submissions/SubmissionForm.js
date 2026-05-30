"use client";

import { DynamicStringList } from "@/components/forms/DynamicStringList";
import { Field } from "@/components/forms/Field";
import { MicroscopicImagesManager } from "@/components/forms/MicroscopicImagesManager";
import { ScientificClassificationFields } from "@/components/forms/ScientificClassificationFields";

/**
 * @param {{
 *   form: Record<string, unknown>,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
 *   onClassificationChange: (key: string, value: string) => void,
 *   onFormPatch: (patch: Record<string, unknown>) => void,
 *   file?: File | null,
 *   onFileChange?: (file: File | null) => void,
 *   requireImage?: boolean,
 *   showImageUrl?: boolean,
 * }} props
 */
export function SubmissionForm({
  form,
  onChange,
  onClassificationChange,
  onFormPatch,
  file,
  onFileChange,
  requireImage = true,
  showImageUrl = false,
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <h2 className="border-b border-emerald-100 pb-2 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
          Specimen details
        </h2>
        <Field label="Plant name" name="plantName" value={form.plantName} onChange={onChange} />
        <Field
          label="Scientific name"
          name="scientificName"
          value={form.scientificName}
          onChange={onChange}
        />
        <Field label="Family" name="family" value={form.family} onChange={onChange} />
        <Field label="Location" name="location" value={form.location} onChange={onChange} />
        <Field label="Collector" name="collector" value={form.collector} onChange={onChange} />
        <Field label="Date" name="date" type="date" value={form.date} onChange={onChange} />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-emerald-950">Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            required
            className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none ring-emerald-600/30 transition focus:ring-2"
            placeholder="Habitat, organoleptic notes, pharmacological observations…"
          />
        </label>

        {showImageUrl ? (
          <Field
            label="Image URL"
            name="imageUrl"
            value={form.imageUrl}
            onChange={onChange}
            required={false}
          />
        ) : null}

        {onFileChange ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-emerald-950">
              Specimen image{requireImage ? "" : " (optional if URL set)"}
            </span>
            <input
              type="file"
              accept="image/*"
              required={requireImage && !form.imageUrl}
              onChange={(ev) => onFileChange(ev.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-800"
            />
            {file ? (
              <p className="mt-2 text-xs text-emerald-700">Selected: {file.name}</p>
            ) : form.imageUrl ? (
              <p className="mt-2 text-xs text-emerald-700">Using existing image URL.</p>
            ) : null}
          </label>
        ) : null}
      </section>

      <ScientificClassificationFields
        classification={form.scientificClassification}
        onChange={onClassificationChange}
      />

      <section className="space-y-5">
        <h2 className="border-b border-emerald-100 pb-2 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
          Pharmacology & indexing
        </h2>
        <DynamicStringList
          label="Medicinal properties"
          items={form.medicinalProperties}
          onChange={(medicinalProperties) => onFormPatch({ medicinalProperties })}
          placeholder="e.g. Anti-inflammatory"
          addLabel="Add property"
        />
        <DynamicStringList
          label="Tags"
          items={form.tags}
          onChange={(tags) => onFormPatch({ tags })}
          placeholder="e.g. Medicinal"
          addLabel="Add tag"
        />
      </section>

      <MicroscopicImagesManager
        images={form.microscopicImages}
        onChange={(microscopicImages) => onFormPatch({ microscopicImages })}
      />
    </div>
  );
}
