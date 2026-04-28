export const metadata = {
  title: "About — Digital Herbarium",
  description:
    "University project to modernize classification of medicinal plants with digital technology.",
};

const TEAM = ["Lamaizi M. Khalil", "Tifrit Amina", "Dahmani Sara"];

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-emerald-100/90 bg-white/95 px-6 py-10 shadow-sm backdrop-blur sm:px-10 sm:py-12">
          <h1 className="font-serif text-center text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            About the Digital Herbarium
          </h1>

          <p className="font-serif mt-8 text-center text-lg leading-relaxed text-emerald-900/95 sm:text-xl">
            This platform was developed as a university project to modernize the classification of
            medicinal plants. By integrating pharmaceutical studies with digital technology, we aim
            to provide a more accessible way to document botanical data.
          </p>

          <section className="mt-12 border-t border-emerald-100 pt-10">
            <h2 className="text-center text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
              The team
            </h2>
            <ul className="mt-6 space-y-3 text-center font-serif text-lg font-semibold text-emerald-950 sm:text-xl">
              {TEAM.map((name) => (
                <li
                  key={name}
                  className="rounded-2xl border border-emerald-100/80 bg-emerald-50/50 px-4 py-3 text-emerald-950"
                >
                  {name}
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
