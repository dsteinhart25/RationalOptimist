const BASE = "/RationalOptimist";
const LOGO = `${BASE}/logo.png`;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" className="h-8 w-8" />
            <span
              className="text-sm font-bold tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-text-primary">Rational Optimist</span>{" "}
              <span className="text-gold">Society</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${BASE}/about`}
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              About
            </a>
            <a
              href={`${BASE}/portfolio`}
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              Disruption X
            </a>
            <a
              href={`${BASE}/di-portfolio`}
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              Disruption Investor
            </a>
            <a
              href="https://rationaloptimistsociety.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              ROS Diary
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main
        className="flex-1 px-6 py-12"
        style={{
          background:
            "linear-gradient(180deg, #0a0a0b 0%, #111113 50%, #0a0a0b 100%)",
        }}
      >
        <div className="max-w-[800px] mx-auto">
          {/* Logo + Headline */}
          <div className="flex flex-col items-center text-center mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" className="w-14 h-14 mb-5" />
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome, fellow{" "}
              <span className="text-gold">rational optimist.</span>
            </h1>
          </div>

          {/* Member Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <a
              href="#"
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[12px] bg-bg-card border border-border hover:border-gold hover:-translate-y-0.5 transition-all"
              style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)" }}
            >
              <span className="text-5xl">&#128085;</span>
              <div className="text-center">
                <span
                  className="text-base font-semibold text-text-primary group-hover:text-gold transition-colors block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ROS Merch
                </span>
                <span className="text-xs text-text-muted mt-1 block">
                  Coming soon
                </span>
              </div>
            </a>

            <a
              href="#"
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[12px] bg-bg-card border border-border hover:border-gold hover:-translate-y-0.5 transition-all"
              style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)" }}
            >
              <span className="text-5xl">&#128218;</span>
              <div className="text-center">
                <span
                  className="text-base font-semibold text-text-primary group-hover:text-gold transition-colors block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ROS Books
                </span>
                <span className="text-xs text-text-muted mt-1 block">
                  Coming soon
                </span>
              </div>
            </a>

            <a
              href="#"
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[12px] bg-bg-card border border-border hover:border-gold hover:-translate-y-0.5 transition-all"
              style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)" }}
            >
              <span className="text-5xl">&#128274;</span>
              <div className="text-center">
                <span
                  className="text-base font-semibold text-text-primary group-hover:text-gold transition-colors block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Patron&apos;s Area
                </span>
              </div>
            </a>
          </div>

          {/* ─── Join Box ─── */}
          <div
            className="mt-12 rounded-[12px] bg-bg-card border border-border p-8 max-w-[520px] mx-auto text-center"
            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)" }}
          >
            <p
              className="text-xl font-bold text-text-primary mb-6 text-center"
              style={{ fontFamily: "var(--font-display)" }}
            >
              New here? Join free to start receiving our weekly{" "}
              <span className="text-gold">ROS Diary</span>
            </p>

            <form
              action="https://rationaloptimistsociety.substack.com/api/v1/free?noRedirect=true"
              method="post"
              target="_blank"
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-[8px] bg-bg-tertiary border border-border text-text-primary text-sm placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-[8px] text-sm font-bold text-[#000] bg-gold hover:bg-gold-light transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{
                  boxShadow: "0 0 30px rgba(201, 168, 76, 0.2)",
                }}
              >
                Join
              </button>
            </form>

            <p className="mt-4 text-xs text-text-muted">
              Free forever &middot; No spam &middot; Unsubscribe anytime
            </p>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-bg py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-6 text-sm text-text-muted">
            <a
              href={`${BASE}/about`}
              className="hover:text-gold transition-colors"
            >
              About
            </a>
            <a
              href={`${BASE}/portfolio`}
              className="hover:text-gold transition-colors"
            >
              Disruption X
            </a>
            <a
              href={`${BASE}/di-portfolio`}
              className="hover:text-gold transition-colors"
            >
              Disruption Investor
            </a>
            <a
              href="https://rationaloptimistsociety.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              ROS Diary
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
