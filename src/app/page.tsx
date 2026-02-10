const BASE = "/RationalOptimist";
const LOGO = `${BASE}/logo.png`;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" className="h-10 w-10" />
            <span
              className="text-base font-bold tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-text-primary">Rational Optimist</span>{" "}
              <span className="text-gold">Society</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://rationaloptimistsociety.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              Newsletter
            </a>
            <a
              href="https://rationaloptimistsociety.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-[8px] text-sm font-bold text-[#000] bg-gold hover:bg-gold-light transition-all"
            >
              Join Free
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section
        className="flex-1 flex items-center justify-center px-6 py-20"
        style={{
          background:
            "linear-gradient(180deg, #0a0a0b 0%, #111113 50%, #0a0a0b 100%)",
        }}
      >
        <div className="max-w-xl mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO}
            alt="Rational Optimist Society"
            className="w-48 sm:w-64 h-auto mx-auto"
          />

          <h1
            className="mt-10 text-5xl sm:text-6xl font-extrabold tracking-[-1px] leading-[1.1]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f4f4f5 0%, #a1a1aa 100%)",
              }}
            >
              Rational Optimist
            </span>
            <br />
            <span className="text-gold">Society</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed">
            A free community of thinkers championing human prosperity through
            innovation, freedom, and progress. Join and get our newsletter.
          </p>

          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block w-full sm:w-auto px-12 py-4 rounded-[8px] text-lg font-bold text-[#000] bg-gold hover:bg-gold-light transition-all hover:-translate-y-0.5"
            style={{
              boxShadow: "0 0 40px rgba(201, 168, 76, 0.2)",
            }}
          >
            Join for Free
          </a>

          <p className="mt-4 text-sm text-text-muted">
            Free forever &middot; No spam &middot; Unsubscribe anytime
          </p>
        </div>
      </section>

      {/* ─── Resource Cards ─── */}
      <section className="border-t border-border bg-bg-secondary py-16">
        <div className="max-w-2xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="#"
            className="group flex flex-col items-center gap-3 p-6 rounded-[12px] bg-bg-card border border-border hover:border-gold hover:-translate-y-0.5 transition-all"
            style={{
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span className="text-3xl">&#128085;</span>
            <span
              className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ROS Merch
            </span>
          </a>

          <a
            href="#"
            className="group flex flex-col items-center gap-3 p-6 rounded-[12px] bg-bg-card border border-border hover:border-gold hover:-translate-y-0.5 transition-all"
            style={{
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span className="text-3xl">&#128218;</span>
            <span
              className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ROS Books
            </span>
          </a>

          <a
            href="#"
            className="group flex flex-col items-center gap-3 p-6 rounded-[12px] bg-bg-card border border-border hover:border-gold hover:-translate-y-0.5 transition-all"
            style={{
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span className="text-3xl">&#128274;</span>
            <span
              className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Patron&apos;s Area
            </span>
          </a>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-bg py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-6 text-sm text-text-muted">
            <a
              href="https://rationaloptimistsociety.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Substack
            </a>
            <a
              href="https://x.com/RationalOptSoc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
