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
              href="https://rationaloptimistsociety.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              Newsletter
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
        <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-12 items-start">
          {/* ─── Left: Member Area ─── */}
          <div className="flex-1 w-full">
            {/* Logo + Headline */}
            <div className="flex items-center gap-4 mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="" className="w-14 h-14" />
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
          </div>

          {/* ─── Right: Join Sidebar ─── */}
          <div className="w-full lg:w-[340px] flex-shrink-0">
            <div
              className="rounded-[12px] bg-bg-card border border-border p-8"
              style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)" }}
            >
              <p
                className="text-lg font-bold text-text-primary mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Not a member yet?
              </p>
              <p className="text-sm text-text-secondary mb-6">
                Join today, it&apos;s free. Get our newsletter delivered to your
                inbox.
              </p>

              <form
                action="https://rationaloptimistsociety.substack.com/api/v1/free?noRedirect=true"
                method="post"
                target="_blank"
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-[8px] bg-bg-tertiary border border-border text-text-primary text-sm placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-[8px] text-sm font-bold text-[#000] bg-gold hover:bg-gold-light transition-all hover:-translate-y-0.5 cursor-pointer"
                  style={{
                    boxShadow: "0 0 30px rgba(201, 168, 76, 0.2)",
                  }}
                >
                  Join
                </button>
              </form>

              <p className="mt-4 text-xs text-text-muted text-center">
                Free forever &middot; No spam &middot; Unsubscribe anytime
              </p>
            </div>
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
