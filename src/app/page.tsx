const BASE = "/RationalOptimist";
const LOGO = `${BASE}/logo.png`;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" className="h-10 w-10" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Rational Optimist</span>{" "}
            <span className="text-gold">Society</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href={`${BASE}/good-news-gallery`}
            className="hidden sm:block text-base text-slate-blue hover:text-white transition-colors"
          >
            Good News
          </a>
          <a
            href="https://rationaloptimistsociety.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-base text-slate-blue hover:text-white transition-colors"
          >
            Newsletter
          </a>
          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-gold text-navy text-base font-bold rounded-lg hover:bg-gold-light transition-colors"
          >
            Join Free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-xl mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO}
            alt="Rational Optimist Society"
            className="w-52 sm:w-64 h-auto mx-auto"
          />

          <h1 className="mt-8 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            <span className="text-white">Rational Optimist</span>{" "}
            <span className="text-gold">Society</span>
          </h1>

          <p className="mt-6 text-xl text-slate-blue leading-relaxed">
            A free community of thinkers championing human prosperity. Join us
            and get our newsletter.
          </p>

          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block w-full sm:w-auto px-14 py-4 bg-gold text-navy font-bold rounded-lg text-xl hover:bg-gold-light transition-all shadow-[0_0_40px_rgba(201,168,76,0.2)] hover:shadow-[0_0_50px_rgba(201,168,76,0.35)]"
          >
            Join for Free
          </a>

          <p className="mt-4 text-base text-slate-blue">
            Free forever &middot; No spam &middot; Unsubscribe anytime
          </p>
        </div>
      </section>

      {/* Links — Merch, Books, Patron's Area */}
      <section className="border-t border-gray-800 bg-navy-light py-14">
        <div className="max-w-2xl mx-auto px-8 grid grid-cols-3 gap-6">
          <a
            href="#"
            className="group flex flex-col items-center gap-3 py-8 px-4 rounded-xl border border-gray-700 hover:border-gold transition-all text-center"
          >
            <span className="text-4xl">&#128085;</span>
            <span className="text-base font-semibold group-hover:text-gold transition-colors">
              ROS Merch
            </span>
          </a>
          <a
            href="#"
            className="group flex flex-col items-center gap-3 py-8 px-4 rounded-xl border border-gray-700 hover:border-gold transition-all text-center"
          >
            <span className="text-4xl">&#128218;</span>
            <span className="text-base font-semibold group-hover:text-gold transition-colors">
              ROS Books
            </span>
          </a>
          <a
            href="#"
            className="group flex flex-col items-center gap-3 py-8 px-4 rounded-xl border border-gray-700 hover:border-gold transition-all text-center"
          >
            <span className="text-4xl">&#128274;</span>
            <span className="text-base font-semibold group-hover:text-gold transition-colors">
              Patron&apos;s Area
            </span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <p className="text-base text-gray-600">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-6 text-base text-gray-600">
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
