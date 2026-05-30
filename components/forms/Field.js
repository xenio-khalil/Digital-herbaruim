export function Field({ label, name, type = "text", value, onChange, required = true, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-emerald-950">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none ring-emerald-600/30 transition placeholder:text-emerald-600/40 focus:border-emerald-400 focus:ring-2"
      />
    </label>
  );
}
