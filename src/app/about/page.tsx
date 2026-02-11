const BASE = "/RationalOptimist";
const LOGO = `${BASE}/logo.png`;

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto">
          <a href={BASE} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" className="h-8 w-8" />
            <span
              className="text-sm font-bold tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-text-primary">Rational Optimist</span>{" "}
              <span className="text-gold">Society</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={`${BASE}/about`}
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-gold bg-gold-dim transition-all"
            >
              About
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

      {/* ─── Content ─── */}
      <main
        className="flex-1 px-6 py-16"
        style={{
          background:
            "linear-gradient(180deg, #0a0a0b 0%, #111113 50%, #0a0a0b 100%)",
        }}
      >
        <div className="max-w-[720px] mx-auto">
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-[-1px] leading-[1.1] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            About the{" "}
            <span className="text-gold">Rational Optimist Society</span>
          </h1>

          <div className="space-y-6 text-base text-text-secondary leading-relaxed">
            <p>
              By almost every metric, the world is getting better — and at a
              rapid pace. Extreme poverty has dropped from over half of humanity
              to less than 8%. Child mortality is down by two thirds. Lifespan
              is up by a third. We&apos;re wealthier, healthier, happier,
              kinder, cleverer, freer, more peaceful, and more equal than ever
              before.
            </p>

            <p>
              Most people take it for granted or don&apos;t believe it. The
              Rational Optimist Society exists to change that.
            </p>

            <h2
              className="text-2xl font-bold text-text-primary pt-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Our Mission
            </h2>

            <p>
              We champion the truth — informed by data, science, and logic —
              about how humanity ascended to where we are today, and the
              incredibly bright future now unfolding. We help our members
              understand, appreciate, and take advantage of the innovations
              revolutionizing the world for the better.
            </p>

            <p>
              Our motto is{" "}
              <span className="text-gold font-semibold">Sapere Aude</span> —
              Dare to Know. Rational Optimists think for themselves. We respect
              facts, data, and reason.
            </p>

            <h2
              className="text-2xl font-bold text-text-primary pt-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What We Believe
            </h2>

            <p>We support the societal conditions necessary for prosperity:</p>

            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>
                <span className="text-text-primary font-medium">Freedom</span>{" "}
                — of action, thought, speech, and private property.
              </li>
              <li>
                <span className="text-text-primary font-medium">
                  Innovation
                </span>{" "}
                — respect for problem-solving entrepreneurs who turn ideas into
                reality and scale them to be affordable for everyone.
              </li>
              <li>
                <span className="text-text-primary font-medium">Reason</span>{" "}
                — good laws applied equally, meritocracy, technological
                advancement, and honest, transparent government.
              </li>
              <li>
                <span className="text-text-primary font-medium">
                  Real capitalism
                </span>{" "}
                — not buddies-with-the-government corporatism.
              </li>
            </ul>

            <h2
              className="text-2xl font-bold text-text-primary pt-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Founders
            </h2>

            <p>
              The Rational Optimist Society was co-founded by{" "}
              <span className="text-text-primary font-medium">
                Dan Steinhart
              </span>
              ,{" "}
              <span className="text-text-primary font-medium">
                David Galland
              </span>
              , and{" "}
              <span className="text-text-primary font-medium">Olivier</span> —
              entrepreneurs, investors, and writers who believe the next
              generation needs rational optimism to drive progress and solve the
              challenges of our time.
            </p>

            <p>
              Inspired by thinkers like{" "}
              <span className="text-text-primary font-medium">
                Matt Ridley
              </span>{" "}
              (a friend, supporter, and honorary founder),{" "}
              <span className="text-text-primary font-medium">
                Hans Rosling
              </span>
              , and{" "}
              <span className="text-text-primary font-medium">
                Steven Pinker
              </span>
              , we founded the society to build a tribe of rational optimists —
              to disrupt the doom machine and inspire people to achieve great
              things.
            </p>

            {/* CTA */}
            <div
              className="mt-10 p-8 rounded-[12px] bg-bg-card border border-border text-center"
              style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)" }}
            >
              <p
                className="text-lg font-bold text-text-primary mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Join the Rational Optimist Society
              </p>
              <p className="text-sm text-text-secondary mb-6">
                It&apos;s free. Get our weekly ROS Diary and become part of a
                growing community.
              </p>
              <a
                href="https://rationaloptimistsociety.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-3 rounded-[8px] text-base font-bold text-[#000] bg-gold hover:bg-gold-light transition-all hover:-translate-y-0.5"
                style={{
                  boxShadow: "0 0 30px rgba(201, 168, 76, 0.2)",
                }}
              >
                Join for Free
              </a>
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
            <a href={BASE} className="hover:text-gold transition-colors">
              Home
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
