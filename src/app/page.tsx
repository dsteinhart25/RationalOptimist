const BASE = "/RationalOptimist";
const LOGO = `${BASE}/logo.png`;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Rational Optimist</span>{" "}
            <span className="text-gold">Society</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://rationaloptimistsociety.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-slate hover:text-white transition-colors"
          >
            Newsletter
          </a>
          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-gold text-navy text-sm font-bold rounded-lg hover:bg-gold-light transition-colors"
          >
            Join Free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="stars flex-1 flex items-center justify-center px-8 py-20">
        <div className="max-w-lg mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO}
            alt="Rational Optimist Society"
            className="w-72 sm:w-96 h-auto mx-auto drop-shadow-[0_0_40px_rgba(201,168,76,0.15)]"
          />

          <p className="mt-10 text-xl sm:text-2xl text-gray-300 leading-relaxed">
            A free community of thinkers championing human prosperity. Join us
            and get our newsletter.
          </p>

          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block w-full sm:w-auto px-12 py-4 bg-gold text-navy font-bold rounded-lg text-xl hover:bg-gold-light transition-colors shadow-[0_0_30px_rgba(201,168,76,0.25)]"
          >
            Join for Free
          </a>

          <p className="mt-4 text-sm text-gray-500">
            Free forever &middot; No spam &middot; Unsubscribe anytime
          </p>
        </div>
      </section>

      {/* Links — Merch, Books, Patron's Area */}
      <section className="border-t border-gray-800 bg-navy-light py-14">
        <div className="max-w-xl mx-auto px-8 grid grid-cols-3 gap-5">
          <a
            href="#"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
          >
            <span className="text-3xl">&#128085;</span>
            <span className="text-sm font-semibold group-hover:text-gold transition-colors">
              ROS Merch
            </span>
          </a>
          <a
            href="#"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
          >
            <span className="text-3xl">&#128218;</span>
            <span className="text-sm font-semibold group-hover:text-gold transition-colors">
              ROS Books
            </span>
          </a>
          <a
            href="#"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
          >
            <span className="text-3xl">&#128274;</span>
            <span className="text-sm font-semibold group-hover:text-gold transition-colors">
              Patron&apos;s Area
            </span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
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
