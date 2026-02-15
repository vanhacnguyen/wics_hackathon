export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative h-[280px] w-full overflow-hidden">
        {/* background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(contact_us.jpg)",
          }}
        />
        {/* overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* title */}
        <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
          <h1 className="text-5xl font-extrabold tracking-wide text-white drop-shadow-sm">
            CONTACT US
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-4xl">
          <h2 className="text-4xl font-bold text-black">
            Have a question, suggestion, or resource to share?
            <br />
            We’d love to hear from you!
          </h2>

          <div className="mt-10 space-y-6 text-lg text-black/80">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✉️</span>
              <p>
                Email:{" "}
                <a
                  className="font-medium text-black underline underline-offset-4 hover:text-blue-700"
                  href="mailto:support@example.org"
                >
                  support@example.org
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <p>
                Phone:{" "}
                <a
                  className="font-medium text-black underline underline-offset-4 hover:text-blue-700"
                  href="tel:+10000000000"
                >
                  (000) 000-0000
                </a>
              </p>
            </div>

            <p className="pt-4 text-lg text-black/70">
              We welcome feedback from community members and organizations.
            </p>

            {/* optional: CTA button */}
            <div className="pt-6">
              <a
                href="mailto:support@example.org"
                className="inline-flex items-center justify-center rounded-full bg-sky-200 px-8 py-3 text-sm font-semibold tracking-[0.25em] text-slate-800 shadow-md ring-1 ring-sky-300 transition hover:scale-[1.01] hover:bg-sky-100"
              >
                EMAIL US
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
