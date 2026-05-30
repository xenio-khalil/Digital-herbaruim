/**
 * @param {{ stats: { totalPlants: number, totalFamilies: number, totalLocations: number, totalTags: number, totalVerified: number } }} props
 */
export function HerbariumStats({ stats }) {
  const items = [
    { label: "Total Plants", value: stats.totalPlants },
    { label: "Total Families", value: stats.totalFamilies },
    { label: "Total Locations", value: stats.totalLocations },
    { label: "Total Tags", value: stats.totalTags },
    { label: "Total Verified Records", value: stats.totalVerified },
  ];

  return (
    <section
      aria-label="Herbarium statistics"
      className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {items.map(({ label, value }) => (
        <article
          key={label}
          className="group rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/40 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
        >
          <p className="font-serif text-4xl font-bold tabular-nums tracking-tight text-emerald-950 transition group-hover:text-emerald-800">
            {value}
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-700">{label}</p>
        </article>
      ))}
    </section>
  );
}
