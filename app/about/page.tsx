export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative h-[260px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/kids_running.webp)" }}
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
          <h1 className="text-5xl font-extrabold tracking-wide text-white drop-shadow-md">
            ABOUT
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* Mission & Vision */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900">
            Mission &amp; Vision
          </h2>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700">
            <p>
              Our mission is to make essential community resources easier to find
              for immigrants and low-income individuals.
            </p>
            <p>
              We aim to reduce stress and confusion by providing a simple way to
              search for nearby support.
            </p>
            <p>
              We envision a community where everyone — regardless of background
              or income — can quickly access the help they need.
            </p>
            <p>
              By connecting people to trusted local services, we hope to promote
              stability, dignity, and opportunity.
            </p>
          </div>

          {/* Rounded image card */}
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-xl overflow-hidden rounded-[2rem] shadow-md ring-1 ring-slate-200">
              <div
                className="h-[260px] w-full bg-cover bg-center"
                style={{ backgroundImage: "url(/taking_care.webp)" }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto mt-14 h-px w-full max-w-3xl bg-slate-200" />

        {/* How it works */}
        <div className="mx-auto mt-14 max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900">How It Works</h2>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            Users can enter their city (or use “Use My Location”) and select their needs,
            such as food assistance, job training, housing support, and more.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-700">
            The website then displays a list of relevant resources and a map to
            help users quickly find support nearby.
          </p>

          {/* 3-step cards */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-6 text-left shadow-sm ring-1 ring-slate-200">
              <div className="text-2xl">🔎</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Search
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Choose your city, category, and language to match your needs.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-left shadow-sm ring-1 ring-slate-200">
              <div className="text-2xl">📍</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Locate
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                View results on an interactive map and sort by nearest (Near Me).
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-left shadow-sm ring-1 ring-slate-200">
              <div className="text-2xl">🤝</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Connect
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Call, visit websites, or get directions to reach support quickly.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          {/* Impact stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
              <div className="text-3xl font-extrabold text-slate-900">1</div>
              <p className="mt-2 text-sm text-slate-600">Search in seconds</p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
              <div className="text-3xl font-extrabold text-slate-900">3</div>
              <p className="mt-2 text-sm text-slate-600">Filters for clarity</p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
              <div className="text-3xl font-extrabold text-slate-900">✓</div>
              <p className="mt-2 text-sm text-slate-600">Privacy-friendly (no address needed)</p>
            </div>
          </div>

          {/* Values */}
          <div className="mt-12 rounded-2xl bg-sky-50 p-8 ring-1 ring-sky-100">
            <h3 className="text-xl font-semibold text-slate-900">Our Values</h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-slate-900">Accessibility</p>
                <p className="mt-2 text-sm text-slate-600">
                  Clear language, clean UI, and easy navigation.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Trust</p>
                <p className="mt-2 text-sm text-slate-600">
                  We prioritize accurate information and transparent sources.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Respect</p>
                <p className="mt-2 text-sm text-slate-600">
                  We support users with dignity and privacy.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:flex-row sm:text-left">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Want to suggest a resource or partner with us?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                We welcome feedback from community members and organizations.
              </p>
            </div>

            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-sky-200 px-8 py-3 text-sm font-semibold tracking-[0.25em] text-slate-800 shadow-md ring-1 ring-sky-300 transition hover:scale-[1.01] hover:bg-sky-100"
            >
              CONTACT
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
